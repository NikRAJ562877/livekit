import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { crypto } from "crypto"

export interface CallContext {
  callId: string
  callerName: string
  callDuration: number
  keyTopics: string[]
  customerIssue: string
  resolutionAttempts: string[]
  urgencyLevel: "low" | "medium" | "high"
  customerSentiment: "positive" | "neutral" | "negative"
}

export interface TransferSummary {
  summary: string
  keyPoints: string[]
  recommendedActions: string[]
  customerContext: string
}

export class AIAgent {
  private agentId: string
  private agentName: string
  private role: "agent_a" | "agent_b"

  constructor(agentId: string, agentName: string, role: "agent_a" | "agent_b") {
    this.agentId = agentId
    this.agentName = agentName
    this.role = role
  }

  async generateCallSummary(callContext: CallContext): Promise<TransferSummary> {
    const prompt = `
    You are Agent A preparing to transfer a call to Agent B. Generate a comprehensive call summary based on the following context:

    Call Details:
    - Caller: ${callContext.callerName}
    - Duration: ${callContext.callDuration} minutes
    - Issue: ${callContext.customerIssue}
    - Urgency: ${callContext.urgencyLevel}
    - Customer Sentiment: ${callContext.customerSentiment}
    - Key Topics Discussed: ${callContext.keyTopics.join(", ")}
    - Resolution Attempts: ${callContext.resolutionAttempts.join(", ")}

    Provide a clear, professional summary that Agent B can use to seamlessly continue the conversation.
    Include key points, recommended next actions, and important customer context.
    `

    try {
      console.log("[v0] Generating call summary with OpenAI...")
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 500,
        temperature: 0.3,
      })

      console.log("[v0] Call summary generated successfully")
      // Parse the response into structured format
      const lines = text.split("\n").filter((line) => line.trim())

      return {
        summary: text,
        keyPoints: this.extractKeyPoints(text),
        recommendedActions: this.extractRecommendedActions(text),
        customerContext: this.extractCustomerContext(callContext),
      }
    } catch (error) {
      console.error("Error generating call summary:", error)
      throw new Error("Failed to generate call summary")
    }
  }

  async generateTransferScript(transferSummary: TransferSummary): Promise<string> {
    const prompt = `
    You are Agent A speaking to Agent B during a warm call transfer. Convert this call summary into a natural, conversational script that you would speak aloud:

    Summary: ${transferSummary.summary}
    Key Points: ${transferSummary.keyPoints.join(", ")}
    Recommended Actions: ${transferSummary.recommendedActions.join(", ")}
    Customer Context: ${transferSummary.customerContext}

    Create a brief, professional spoken summary (30-45 seconds) that Agent B can understand quickly.
    Use natural speech patterns and include the most critical information for a smooth handoff.
    `

    try {
      console.log("[v0] Generating transfer script...")
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 200,
        temperature: 0.4,
      })

      console.log("[v0] Transfer script generated successfully")
      return text.trim()
    } catch (error) {
      console.error("Error generating transfer script:", error)
      throw new Error("Failed to generate transfer script")
    }
  }

  async processIncomingTransfer(transferSummary: TransferSummary): Promise<string> {
    const prompt = `
    You are Agent B receiving a call transfer. Based on this summary, generate your opening response to the customer:

    Summary: ${transferSummary.summary}
    Key Points: ${transferSummary.keyPoints.join(", ")}
    Customer Context: ${transferSummary.customerContext}

    Create a warm, professional greeting that acknowledges the transfer and shows you understand their situation.
    Make the customer feel heard and confident that you can help them.
    `

    try {
      console.log("[v0] Processing incoming transfer...")
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt,
        maxTokens: 150,
        temperature: 0.5,
      })

      console.log("[v0] Agent B response generated successfully")
      return text.trim()
    } catch (error) {
      console.error("Error processing incoming transfer:", error)
      throw new Error("Failed to process incoming transfer")
    }
  }

  private extractKeyPoints(text: string): string[] {
    // Simple extraction logic - in production, this could be more sophisticated
    const keyPointsSection = text.match(/key points?:?\s*(.*?)(?:\n\n|\n[A-Z]|$)/is)
    if (keyPointsSection) {
      return keyPointsSection[1]
        .split(/[•\-\n]/)
        .map((point) => point.trim())
        .filter((point) => point.length > 0)
        .slice(0, 5)
    }
    return []
  }

  private extractRecommendedActions(text: string): string[] {
    const actionsSection = text.match(/recommended actions?:?\s*(.*?)(?:\n\n|\n[A-Z]|$)/is)
    if (actionsSection) {
      return actionsSection[1]
        .split(/[•\-\n]/)
        .map((action) => action.trim())
        .filter((action) => action.length > 0)
        .slice(0, 3)
    }
    return []
  }

  private extractCustomerContext(callContext: CallContext): string {
    return `${callContext.callerName} has been on the call for ${callContext.callDuration} minutes regarding ${callContext.customerIssue}. Customer sentiment is ${callContext.customerSentiment} with ${callContext.urgencyLevel} urgency.`
  }
}

export class AgentOrchestrator {
  private agents: Map<string, AIAgent> = new Map()
  private activeTransfers: Map<string, TransferSession> = new Map()

  createAgent(agentId: string, agentName: string, role: "agent_a" | "agent_b"): AIAgent {
    const agent = new AIAgent(agentId, agentName, role)
    this.agents.set(agentId, agent)
    return agent
  }

  getAgent(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId)
  }

  async initiateWarmTransfer(agentAId: string, agentBId: string, callContext: CallContext): Promise<TransferSession> {
    const agentA = this.agents.get(agentAId)
    const agentB = this.agents.get(agentBId)

    if (!agentA || !agentB) {
      console.log("[v0] Available agents:", Array.from(this.agents.keys()))
      console.log("[v0] Looking for agents:", agentAId, agentBId)
      throw new Error("Agents not found")
    }

    // Generate call summary
    const transferSummary = await agentA.generateCallSummary(callContext)

    // Generate transfer script for Agent A to speak
    const transferScript = await agentA.generateTransferScript(transferSummary)

    // Prepare Agent B's response
    const agentBResponse = await agentB.processIncomingTransfer(transferSummary)

    const transferSession: TransferSession = {
      id: crypto.randomUUID(),
      agentAId,
      agentBId,
      callContext,
      transferSummary,
      transferScript,
      agentBResponse,
      status: "initiated",
      createdAt: new Date(),
    }

    this.activeTransfers.set(transferSession.id, transferSession)
    return transferSession
  }

  getTransferSession(transferId: string): TransferSession | undefined {
    return this.activeTransfers.get(transferId)
  }

  updateTransferStatus(transferId: string, status: TransferSession["status"]): void {
    const session = this.activeTransfers.get(transferId)
    if (session) {
      session.status = status
    }
  }
}

export interface TransferSession {
  id: string
  agentAId: string
  agentBId: string
  callContext: CallContext
  transferSummary: TransferSummary
  transferScript: string
  agentBResponse: string
  status: "initiated" | "briefing" | "transferring" | "completed" | "failed"
  createdAt: Date
}

export const agentOrchestrator = new AgentOrchestrator()
