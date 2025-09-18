// LiveKit configuration and utilities
export const LIVEKIT_CONFIG = {
  wsURL: process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://attack-capital-m4mc8yz9.livekit.cloud",
  apiKey: process.env.LIVEKIT_API_KEY || "APIohxyL4mrHHAy",
  apiSecret: process.env.LIVEKIT_API_SECRET || "",
}

export interface CallParticipant {
  id: string
  name: string
  role: "caller" | "agent_a" | "agent_b"
  isConnected: boolean
}

export interface CallSession {
  id: string
  roomName: string
  participants: CallParticipant[]
  status: "active" | "transferring" | "completed"
  summary?: string
  createdAt: Date
}

export class LiveKitManager {
  private sessions: Map<string, CallSession> = new Map()

  createSession(roomName: string, callerName: string): CallSession {
    const session: CallSession = {
      id: crypto.randomUUID(),
      roomName,
      participants: [
        {
          id: crypto.randomUUID(),
          name: callerName,
          role: "caller",
          isConnected: true,
        },
        {
          id: crypto.randomUUID(),
          name: "Agent A",
          role: "agent_a",
          isConnected: true,
        },
      ],
      status: "active",
      createdAt: new Date(),
    }

    this.sessions.set(session.id, session)
    return session
  }

  getSession(sessionId: string): CallSession | undefined {
    return this.sessions.get(sessionId)
  }

  updateSessionStatus(sessionId: string, status: CallSession["status"]): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.status = status
    }
  }

  addParticipant(sessionId: string, participant: CallParticipant): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.participants.push(participant)
    }
  }

  removeParticipant(sessionId: string, participantId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.participants = session.participants.filter((p) => p.id !== participantId)
    }
  }
}

export const livekitManager = new LiveKitManager()
