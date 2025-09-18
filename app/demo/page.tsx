"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Play, RotateCcw } from "lucide-react"
import { useWarmTransfer } from "@/hooks/use-warm-transfer"
import { TransferMonitor } from "@/components/transfer-monitor"
import type { CallContext } from "@/lib/ai-agent"

const DEMO_SCENARIOS = [
  {
    name: "Billing Issue",
    callerName: "Sarah Johnson",
    customerIssue:
      "Customer is disputing a charge on their account and wants a refund. They've been charged twice for the same service.",
    urgencyLevel: "high" as const,
    customerSentiment: "negative" as const,
    keyTopics: ["billing", "refund", "duplicate charge"],
    resolutionAttempts: ["Verified the duplicate charge", "Explained refund process"],
  },
  {
    name: "Technical Support",
    callerName: "Mike Chen",
    customerIssue:
      "Customer's internet connection keeps dropping every few hours. They work from home and need a stable connection.",
    urgencyLevel: "medium" as const,
    customerSentiment: "neutral" as const,
    keyTopics: ["internet", "connectivity", "work from home"],
    resolutionAttempts: ["Basic troubleshooting", "Router restart", "Speed test"],
  },
  {
    name: "Account Upgrade",
    callerName: "Emily Davis",
    customerIssue: "Customer wants to upgrade their plan but is confused about the different options and pricing.",
    urgencyLevel: "low" as const,
    customerSentiment: "positive" as const,
    keyTopics: ["upgrade", "pricing", "plan comparison"],
    resolutionAttempts: ["Explained current plan", "Showed upgrade options"],
  },
]

export default function DemoPage() {
  const [selectedScenario, setSelectedScenario] = useState<number>(0)
  const [customScenario, setCustomScenario] = useState<Partial<CallContext>>({
    callerName: "",
    customerIssue: "",
    urgencyLevel: "medium",
    customerSentiment: "neutral",
    keyTopics: [],
    resolutionAttempts: [],
  })
  const [useCustom, setUseCustom] = useState(false)

  const {
    isTransferring,
    transferId,
    transferSteps,
    transferSession,
    error,
    initiateTransfer,
    cancelTransfer,
    resetTransfer,
  } = useWarmTransfer()

  const handleStartDemo = async () => {
    const scenario = useCustom ? customScenario : DEMO_SCENARIOS[selectedScenario]

    const callContext: CallContext = {
      callId: crypto.randomUUID(),
      callerName: scenario.callerName || "Demo Caller",
      callDuration: Math.floor(Math.random() * 10) + 3, // 3-12 minutes
      customerIssue: scenario.customerIssue || "General inquiry",
      urgencyLevel: scenario.urgencyLevel || "medium",
      customerSentiment: scenario.customerSentiment || "neutral",
      keyTopics: scenario.keyTopics || [],
      resolutionAttempts: scenario.resolutionAttempts || [],
    }

    await initiateTransfer("demo-room", callContext.callerName, "Agent A", callContext)
  }

  const handleReset = () => {
    resetTransfer()
    setUseCustom(false)
    setSelectedScenario(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Warm Transfer Demo</h1>
          <p className="text-lg text-gray-600">Experience AI-powered call transfers in action</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scenario Selection */}
          {!isTransferring && (
            <Card>
              <CardHeader>
                <CardTitle>Choose Demo Scenario</CardTitle>
                <CardDescription>Select a pre-configured scenario or create your own</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {DEMO_SCENARIOS.map((scenario, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedScenario === index && !useCustom
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedScenario(index)
                        setUseCustom(false)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{scenario.name}</h3>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {scenario.urgencyLevel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {scenario.customerSentiment}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{scenario.customerIssue}</p>
                      <p className="text-xs text-gray-500 mt-1">Caller: {scenario.callerName}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      useCustom ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setUseCustom(true)}
                  >
                    <h3 className="font-medium">Custom Scenario</h3>
                    <p className="text-sm text-gray-600">Create your own call scenario</p>
                  </div>
                </div>

                <Button onClick={handleStartDemo} className="w-full" disabled={isTransferring}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Demo Transfer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Custom Scenario Form */}
          {useCustom && !isTransferring && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Scenario</CardTitle>
                <CardDescription>Configure your own call transfer scenario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callerName">Caller Name</Label>
                  <Input
                    id="callerName"
                    placeholder="John Smith"
                    value={customScenario.callerName}
                    onChange={(e) => setCustomScenario({ ...customScenario, callerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerIssue">Customer Issue</Label>
                  <Textarea
                    id="customerIssue"
                    placeholder="Describe the customer's issue..."
                    value={customScenario.customerIssue}
                    onChange={(e) => setCustomScenario({ ...customScenario, customerIssue: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Urgency Level</Label>
                    <Select
                      value={customScenario.urgencyLevel}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setCustomScenario({ ...customScenario, urgencyLevel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Sentiment</Label>
                    <Select
                      value={customScenario.customerSentiment}
                      onValueChange={(value: "positive" | "neutral" | "negative") =>
                        setCustomScenario({ ...customScenario, customerSentiment: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfer Monitor */}
          {isTransferring && <TransferMonitor transferId={transferId} onCancel={cancelTransfer} />}

          {/* Transfer Results */}
          {transferSession && (
            <Card>
              <CardHeader>
                <CardTitle>Transfer Results</CardTitle>
                <CardDescription>AI-generated transfer summary and scripts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Transfer Script (Agent A to Agent B)</Label>
                  <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">{transferSession.transferScript}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Agent B Opening Response</Label>
                  <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{transferSession.agentBResponse}</p>
                  </div>
                </div>
                {transferSession.keyPoints.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Key Points Transferred</Label>
                    <ul className="mt-1 space-y-1">
                      {transferSession.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Demo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
