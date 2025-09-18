"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, ArrowRight } from "lucide-react"
import type { TransferStep } from "@/lib/transfer-orchestrator"

interface TransferMonitorProps {
  transferId: string | null
  onCancel?: () => void
}

export function TransferMonitor({ transferId, onCancel }: TransferMonitorProps) {
  const [steps, setSteps] = useState<TransferStep[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!transferId) return

    const pollStatus = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/transfer/status?transferId=${transferId}`)
        const data = await response.json()

        if (response.ok) {
          setSteps(data.steps)
        }
      } catch (error) {
        console.error("Error polling transfer status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Poll immediately and then every 2 seconds
    pollStatus()
    const interval = setInterval(pollStatus, 2000)

    return () => clearInterval(interval)
  }, [transferId])

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  if (!transferId) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRight className="h-5 w-5" />
          Warm Transfer Monitor
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>
              {completedSteps} of {totalSteps} steps completed
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
              {getStepIcon(step.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{step.name}</span>
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "default"
                        : step.status === "in-progress"
                          ? "secondary"
                          : step.status === "failed"
                            ? "destructive"
                            : "outline"
                    }
                  >
                    {step.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                {step.timestamp && <p className="text-xs text-gray-400 mt-1">{step.timestamp.toLocaleTimeString()}</p>}
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Updating status...</span>
          </div>
        )}

        {onCancel && (
          <Button onClick={onCancel} variant="outline" className="w-full bg-transparent">
            Cancel Transfer
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
