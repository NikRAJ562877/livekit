import { type NextRequest, NextResponse } from "next/server"
import { warmTransferOrchestrator } from "@/lib/transfer-orchestrator"

export async function POST(req: NextRequest) {
  try {
    const { transferId } = await req.json()

    if (!transferId) {
      return NextResponse.json({ error: "Transfer ID is required" }, { status: 400 })
    }

    await warmTransferOrchestrator.cancelTransfer(transferId)

    return NextResponse.json({
      success: true,
      message: "Transfer cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling transfer:", error)
    return NextResponse.json({ error: "Failed to cancel transfer" }, { status: 500 })
  }
}
