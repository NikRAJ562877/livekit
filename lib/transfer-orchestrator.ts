import type { Room } from "livekit-client"
import { agentOrchestrator, type CallContext, type TransferSession } from "./ai-agent"
import { ttsManager } from "./text-to-speech"

export interface TransferStep {
  id: string
  name: string
  status: "pending" | "in-progress" | "completed" | "failed"
  description: string
  timestamp?: Date
}

export class WarmTransferOrchestrator {
  private activeTransfers: Map<string, WarmTransferProcess> = new Map()

  async initiateWarmTransfer(
    originalRoomName: string,
    callerName: string,
    agentAName: string,
    callContext: CallContext,
  ): Promise<string> {
    const transferId = crypto.randomUUID()

    const transferProcess = new WarmTransferProcess(transferId, originalRoomName, callerName, agentAName, callContext)

    this.activeTransfers.set(transferId, transferProcess)

    // Start the transfer process
    await transferProcess.start()

    return transferId
  }

  getTransferProcess(transferId: string): WarmTransferProcess | undefined {
    return this.activeTransfers.get(transferId)
  }

  getTransferStatus(transferId: string): TransferStep[] {
    const process = this.activeTransfers.get(transferId)
    return process ? process.getSteps() : []
  }

  async cancelTransfer(transferId: string): Promise<void> {
    const process = this.activeTransfers.get(transferId)
    if (process) {
      await process.cancel()
      this.activeTransfers.delete(transferId)
    }
  }
}

export class WarmTransferProcess {
  private transferId: string
  private originalRoomName: string
  private callerName: string
  private agentAName: string
  private callContext: CallContext
  private steps: TransferStep[] = []
  private transferRoom: Room | null = null
  private originalRoom: Room | null = null
  private transferSession: TransferSession | null = null

  constructor(
    transferId: string,
    originalRoomName: string,
    callerName: string,
    agentAName: string,
    callContext: CallContext,
  ) {
    this.transferId = transferId
    this.originalRoomName = originalRoomName
    this.callerName = callerName
    this.agentAName = agentAName
    this.callContext = callContext

    this.initializeSteps()
  }

  private initializeSteps(): void {
    this.steps = [
      {
        id: "1",
        name: "Generate Call Summary",
        status: "pending",
        description: "AI generates comprehensive call summary for Agent B",
      },
      {
        id: "2",
        name: "Create Transfer Room",
        status: "pending",
        description: "Create new LiveKit room for Agent A and Agent B briefing",
      },
      {
        id: "3",
        name: "Connect Agent B",
        status: "pending",
        description: "Agent B joins the transfer room",
      },
      {
        id: "4",
        name: "Brief Agent B",
        status: "pending",
        description: "Agent A explains call context to Agent B using AI-generated summary",
      },
      {
        id: "5",
        name: "Transfer Caller",
        status: "pending",
        description: "Move caller from original room to transfer room with Agent B",
      },
      {
        id: "6",
        name: "Agent A Exit",
        status: "pending",
        description: "Agent A leaves the call, completing the warm transfer",
      },
    ]
  }

  async start(): Promise<void> {
    try {
      // Step 1: Generate Call Summary
      await this.executeStep("1", async () => {
        const agentAId = `agent_a_${this.transferId}`
        const agentBId = `agent_b_${this.transferId}`

        agentOrchestrator.createAgent(agentAId, this.agentAName, "agent_a")
        agentOrchestrator.createAgent(agentBId, "Agent B", "agent_b")

        this.transferSession = await agentOrchestrator.initiateWarmTransfer(agentAId, agentBId, this.callContext)
      })

      // Step 2: Create Transfer Room
      await this.executeStep("2", async () => {
        const transferRoomName = `transfer_${this.transferId}`
        // In a real implementation, this would create an actual LiveKit room
        console.log(`Created transfer room: ${transferRoomName}`)
      })

      // Step 3: Connect Agent B
      await this.executeStep("3", async () => {
        // Simulate Agent B joining
        await this.simulateDelay(2000)
        console.log("Agent B connected to transfer room")
      })

      // Step 4: Brief Agent B
      await this.executeStep("4", async () => {
        if (this.transferSession) {
          // Use text-to-speech to speak the transfer script
          await ttsManager.speakTransferScript(this.transferSession.transferScript, this.agentAName)
          console.log("Agent A briefed Agent B with call summary")
        }
      })

      // Step 5: Transfer Caller
      await this.executeStep("5", async () => {
        // Move caller to the transfer room
        await this.simulateDelay(1500)
        console.log("Caller transferred to Agent B")
      })

      // Step 6: Agent A Exit
      await this.executeStep("6", async () => {
        // Agent A leaves the call
        await this.simulateDelay(1000)
        console.log("Agent A exited call - transfer complete")
      })

      console.log("Warm transfer completed successfully")
    } catch (error) {
      console.error("Transfer failed:", error)
      this.markStepFailed(this.getCurrentStep()?.id || "unknown", error as Error)
    }
  }

  private async executeStep(stepId: string, action: () => Promise<void>): Promise<void> {
    const step = this.steps.find((s) => s.id === stepId)
    if (!step) return

    step.status = "in-progress"
    step.timestamp = new Date()

    try {
      await action()
      step.status = "completed"
    } catch (error) {
      step.status = "failed"
      throw error
    }
  }

  private markStepFailed(stepId: string, error: Error): void {
    const step = this.steps.find((s) => s.id === stepId)
    if (step) {
      step.status = "failed"
      step.description += ` - Error: ${error.message}`
    }
  }

  private getCurrentStep(): TransferStep | undefined {
    return this.steps.find((step) => step.status === "in-progress" || step.status === "pending")
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async cancel(): Promise<void> {
    // Stop any ongoing text-to-speech
    ttsManager.stopSpeaking()

    // Disconnect from rooms
    if (this.transferRoom) {
      await this.transferRoom.disconnect()
    }

    if (this.originalRoom) {
      await this.originalRoom.disconnect()
    }

    // Mark all pending steps as failed
    this.steps.forEach((step) => {
      if (step.status === "pending" || step.status === "in-progress") {
        step.status = "failed"
        step.description += " - Transfer cancelled"
      }
    })
  }

  getSteps(): TransferStep[] {
    return [...this.steps]
  }

  getTransferSession(): TransferSession | null {
    return this.transferSession
  }
}

export const warmTransferOrchestrator = new WarmTransferOrchestrator()
