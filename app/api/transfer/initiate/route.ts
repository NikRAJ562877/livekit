import { type NextRequest, NextResponse } from "next/server"
import { warmTransferOrchestrator } from "@/lib/transfer-orchestrator"
import type { CallContext } from "@/lib/ai-agent"

export async function POST(req: NextRequest) {
  try {
    const { roomName, callerName, agentAName, callContext } = await req.json()

    if (!roomName || !callerName || !agentAName || !callContext) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const transferId = await warmTransferOrchestrator.initiateWarmTransfer(
      roomName,
      callerName,
      agentAName,
      callContext as CallContext,
    )

    return NextResponse.json({
      success: true,
      transferId,
      message: "Warm transfer initiated successfully",
    })
  } catch (error) {
    console.error("Error initiating transfer:", error)
    return NextResponse.json({ error: "Failed to initiate warm transfer" }, { status: 500 })
  }
}
