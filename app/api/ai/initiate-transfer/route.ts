import { type NextRequest, NextResponse } from "next/server"
import { agentOrchestrator, type CallContext } from "@/lib/ai-agent"

export async function POST(req: NextRequest) {
  try {
    const { agentAId, agentBId, callContext } = await req.json()

    if (!agentAId || !agentBId || !callContext) {
      return NextResponse.json({ error: "Agent IDs and call context are required" }, { status: 400 })
    }

    // Create agents if they don't exist
    if (!agentOrchestrator.getAgent(agentAId)) {
      agentOrchestrator.createAgent(agentAId, "Agent A", "agent_a")
    }

    if (!agentOrchestrator.getAgent(agentBId)) {
      agentOrchestrator.createAgent(agentBId, "Agent B", "agent_b")
    }

    const transferSession = await agentOrchestrator.initiateWarmTransfer(agentAId, agentBId, callContext as CallContext)

    return NextResponse.json({
      success: true,
      transferSession,
    })
  } catch (error) {
    console.error("Error initiating transfer:", error)
    return NextResponse.json({ error: "Failed to initiate warm transfer" }, { status: 500 })
  }
}
