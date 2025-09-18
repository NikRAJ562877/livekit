import { type NextRequest, NextResponse } from "next/server"
import { agentOrchestrator, type CallContext } from "@/lib/ai-agent"

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Received request to generate summary")
    const { callContext, agentId } = await req.json()

    if (!callContext || !agentId) {
      console.log("[v0] Missing required parameters")
      return NextResponse.json({ error: "Call context and agent ID are required" }, { status: 400 })
    }

    console.log("[v0] Looking for agent:", agentId)
    const agent = agentOrchestrator.getAgent(agentId)
    if (!agent) {
      console.log("[v0] Agent not found:", agentId)
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    console.log("[v0] Generating summary with agent...")
    const summary = await agent.generateCallSummary(callContext as CallContext)

    console.log("[v0] Summary generated successfully")
    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    return NextResponse.json({ error: "Failed to generate call summary" }, { status: 500 })
  }
}
