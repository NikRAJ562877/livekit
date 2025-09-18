"use client"

import { useState, useCallback } from "react"
import type { CallContext } from "@/lib/ai-agent"
import type { TransferStep } from "@/lib/transfer-orchestrator"

interface TransferSession {
  id: string
  status: string
  transferScript: string
  agentBResponse: string
  summary: string
  keyPoints: string[]
}

export function useWarmTransfer() {
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferId, setTransferId] = useState<string | null>(null)
  const [transferSteps, setTransferSteps] = useState<TransferStep[]>([])
  const [transferSession, setTransferSession] = useState<TransferSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  const initiateTransfer = useCallback(
    async (roomName: string, callerName: string, agentAName: string, callContext: CallContext) => {
      try {
        setIsTransferring(true)
        setError(null)

        const response = await fetch("/api/transfer/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomName,
            callerName,
            agentAName,
            callContext,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to initiate transfer")
        }

        setTransferId(data.transferId)

        // Start polling for status updates
        pollTransferStatus(data.transferId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        setIsTransferring(false)
      }
    },
    [],
  )

  const pollTransferStatus = useCallback(async (id: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/transfer/status?transferId=${id}`)
        const data = await response.json()

        if (response.ok) {
          setTransferSteps(data.steps)
          setTransferSession(data.transferSession)

          // Check if transfer is complete
          const allCompleted = data.steps.every((step: TransferStep) => step.status === "completed")
          const anyFailed = data.steps.some((step: TransferStep) => step.status === "failed")

          if (allCompleted || anyFailed) {
            setIsTransferring(false)
            return
          }

          // Continue polling if transfer is still in progress
          setTimeout(poll, 2000)
        }
      } catch (err) {
        console.error("Error polling transfer status:", err)
        setError("Failed to get transfer status")
        setIsTransferring(false)
      }
    }

    poll()
  }, [])

  const cancelTransfer = useCallback(async () => {
    if (!transferId) return

    try {
      const response = await fetch("/api/transfer/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferId }),
      })

      if (response.ok) {
        setIsTransferring(false)
        setTransferId(null)
        setTransferSteps([])
        setTransferSession(null)
      }
    } catch (err) {
      setError("Failed to cancel transfer")
    }
  }, [transferId])

  const resetTransfer = useCallback(() => {
    setIsTransferring(false)
    setTransferId(null)
    setTransferSteps([])
    setTransferSession(null)
    setError(null)
  }, [])

  return {
    isTransferring,
    transferId,
    transferSteps,
    transferSession,
    error,
    initiateTransfer,
    cancelTransfer,
    resetTransfer,
  }
}
