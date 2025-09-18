import { type NextRequest, NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"
import { LIVEKIT_CONFIG } from "@/lib/livekit"

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName, participantRole } = await req.json()

    if (!roomName || !participantName) {
      return NextResponse.json({ error: "Room name and participant name are required" }, { status: 400 })
    }

    // Create access token
    const at = new AccessToken(LIVEKIT_CONFIG.apiKey, LIVEKIT_CONFIG.apiSecret, {
      identity: participantName,
      name: participantName,
    })

    // Grant permissions based on role
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: participantRole === "agent_a" || participantRole === "agent_b",
    })

    const token = await at.toJwt()

    return NextResponse.json({
      token,
      wsURL: LIVEKIT_CONFIG.wsURL,
    })
  } catch (error) {
    console.error("Error generating LiveKit token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
