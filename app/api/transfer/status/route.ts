import { type NextRequest, NextResponse } from "next/server"
import { warmTransferOrchestrator } from "@/lib/transfer-orchestrator"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const transferId = searchParams.get("transferId")

    if (!transferId) {
      return NextResponse.json({ error: "Transfer ID is required" }, { status: 400 })
    }

    const steps = warmTransferOrchestrator.getTransferStatus(transferId)
    const transferProcess = warmTransferOrchestrator.getTransferProcess(transferId)

    if (!transferProcess) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
    }

    const transferSession = transferProcess.getTransferSession()

    return NextResponse.json({
      success: true,
      transferId,
      steps,
      transferSession: transferSession
        ? {
            id: transferSession.id,
            status: transferSession.status,
            transferScript: transferSession.transferScript,
            agentBResponse: transferSession.agentBResponse,
            summary: transferSession.transferSummary.summary,
            keyPoints: transferSession.transferSummary.keyPoints,
          }
        : null,
    })
  } catch (error) {
    console.error("Error getting transfer status:", error)
    return NextResponse.json({ error: "Failed to get transfer status" }, { status: 500 })
  }
}
