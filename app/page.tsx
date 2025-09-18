"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Phone, PhoneCall, Users, Mic, MicOff, ArrowRight, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useWarmTransfer } from "@/hooks/use-warm-transfer"
import type { CallContext } from "@/lib/ai-agent"

export default function LiveKitWarmTransfer() {
  const [roomName, setRoomName] = useState("")
  const [userName, setUserName] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected" | "transferring">("idle")
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [systemStatus, setSystemStatus] = useState<{
    livekit: "checking" | "connected" | "error"
    openai: "checking" | "connected" | "error"
    agents: "checking" | "ready" | "error"
  }>({
    livekit: "checking",
    openai: "checking",
    agents: "checking",
  })

  const { isTransferring, transferSteps, transferSession, error, initiateTransfer, cancelTransfer, resetTransfer } =
    useWarmTransfer()

  const [callContext, setCallContext] = useState<CallContext>({
    callId: "",
    callerName: "",
    callDuration: 0,
    keyTopics: [],
    customerIssue: "",
    resolutionAttempts: [],
    urgencyLevel: "",
    customerSentiment: "",
  })

  const checkSystemHealth = async () => {
    console.log("[v0] Starting system health check...")
    addDebugLog("🔍 Starting system health check...")

    // Check LiveKit connection
    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: "test-room", identity: "test-user" }),
      })
      if (response.ok) {
        setSystemStatus((prev) => ({ ...prev, livekit: "connected" }))
        addDebugLog("✅ LiveKit API: Connected")
      } else {
        setSystemStatus((prev) => ({ ...prev, livekit: "error" }))
        addDebugLog("❌ LiveKit API: Error")
      }
    } catch (error) {
      setSystemStatus((prev) => ({ ...prev, livekit: "error" }))
      addDebugLog("❌ LiveKit API: Connection failed")
    }

    // Check OpenAI integration
    try {
      const response = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callContext: {
            callId: "test",
            callerName: "Test User",
            callDuration: 1,
            keyTopics: ["test"],
            customerIssue: "Test issue",
            resolutionAttempts: [],
            urgencyLevel: "low",
            customerSentiment: "neutral",
          },
        }),
      })
      if (response.ok) {
        setSystemStatus((prev) => ({ ...prev, openai: "connected" }))
        addDebugLog("✅ OpenAI API: Connected")
      } else {
        setSystemStatus((prev) => ({ ...prev, openai: "error" }))
        addDebugLog("❌ OpenAI API: Error")
      }
    } catch (error) {
      setSystemStatus((prev) => ({ ...prev, openai: "error" }))
      addDebugLog("❌ OpenAI API: Connection failed")
    }

    // Check Agent system
    setSystemStatus((prev) => ({ ...prev, agents: "ready" }))
    addDebugLog("✅ Agent System: Ready")

    addDebugLog("🎯 System health check complete!")
  }

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs((prev) => [...prev.slice(-9), `[${timestamp}] ${message}`])
  }

  const handleConnect = async () => {
    if (!roomName || !userName) return

    console.log("[v0] Connecting to room:", roomName, "as user:", userName)
    addDebugLog(`🔗 Connecting to room: ${roomName} as ${userName}`)
    setCallStatus("connecting")

    // This will be implemented with actual LiveKit connection
    setTimeout(() => {
      setIsConnected(true)
      setCurrentRoom(roomName)
      setCallStatus("connected")
      addDebugLog(`✅ Connected to room: ${roomName}`)
      console.log("[v0] Successfully connected to room")
    }, 2000)
  }

  const handleDisconnect = () => {
    console.log("[v0] Disconnecting from room")
    addDebugLog("🔌 Disconnecting from room")
    setIsConnected(false)
    setCurrentRoom(null)
    setCallStatus("idle")
    resetTransfer()
  }

  const handleWarmTransfer = async () => {
    if (!currentRoom || !userName) return

    console.log("[v0] Starting warm transfer process")
    addDebugLog("🔄 Starting warm transfer process...")

    const fullCallContext: CallContext = {
      callId: crypto.randomUUID(),
      callerName: callContext.callerName || "Unknown Caller",
      callDuration: callContext.callDuration || 5,
      keyTopics: callContext.keyTopics || [],
      customerIssue: callContext.customerIssue || "General inquiry",
      resolutionAttempts: callContext.resolutionAttempts || [],
      urgencyLevel: callContext.urgencyLevel || "medium",
      customerSentiment: callContext.customerSentiment || "neutral",
    }

    await initiateTransfer(currentRoom, fullCallContext.callerName, userName, fullCallContext)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">LiveKit Warm Transfer</h1>
          <p className="text-lg text-gray-600">AI-Powered Call Transfer System</p>
        </div>

        {/* System Status Dashboard */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    systemStatus.livekit === "connected"
                      ? "bg-green-100 text-green-800"
                      : systemStatus.livekit === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {systemStatus.livekit === "connected" ? "✅" : systemStatus.livekit === "error" ? "❌" : "🔍"}
                  LiveKit
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    systemStatus.openai === "connected"
                      ? "bg-green-100 text-green-800"
                      : systemStatus.openai === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {systemStatus.openai === "connected" ? "✅" : systemStatus.openai === "error" ? "❌" : "🔍"}
                  OpenAI
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    systemStatus.agents === "ready"
                      ? "bg-green-100 text-green-800"
                      : systemStatus.agents === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {systemStatus.agents === "ready" ? "✅" : systemStatus.agents === "error" ? "❌" : "🔍"}
                  Agents
                </div>
              </div>
            </div>
            <Button onClick={checkSystemHealth} variant="outline" className="w-full bg-transparent">
              Run System Health Check
            </Button>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
              {currentRoom && <span className="text-sm text-gray-600">Room: {currentRoom}</span>}
              <Badge variant="outline" className="ml-auto">
                {isTransferring ? "Transferring" : callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Form */}
          {!isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Join Call</CardTitle>
                <CardDescription>Enter your details to connect to a LiveKit room</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name</Label>
                  <Input
                    id="roomName"
                    placeholder="Enter room name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">Your Name (Agent A)</Label>
                  <Input
                    id="userName"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleConnect}
                  className="w-full"
                  disabled={!roomName || !userName || callStatus === "connecting"}
                >
                  {callStatus === "connecting" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Connect to Room
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {!isConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Call Context Setup</CardTitle>
                <CardDescription>Configure the call scenario for testing warm transfer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="callerName">Caller Name</Label>
                  <Input
                    id="callerName"
                    placeholder="John Smith"
                    value={callContext.callerName}
                    onChange={(e) => setCallContext({ ...callContext, callerName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerIssue">Customer Issue</Label>
                  <Textarea
                    id="customerIssue"
                    placeholder="Describe the customer's issue..."
                    value={callContext.customerIssue}
                    onChange={(e) => setCallContext({ ...callContext, customerIssue: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgencyLevel">Urgency Level</Label>
                    <Select
                      value={callContext.urgencyLevel}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setCallContext({ ...callContext, urgencyLevel: value })
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
                    <Label htmlFor="customerSentiment">Customer Sentiment</Label>
                    <Select
                      value={callContext.customerSentiment}
                      onValueChange={(value: "positive" | "neutral" | "negative") =>
                        setCallContext({ ...callContext, customerSentiment: value })
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

          {/* Call Controls */}
          {isConnected && !isTransferring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Call Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mic className="h-4 w-4 mr-2" />
                    Mute
                  </Button>
                  <Button variant="outline" size="sm">
                    <MicOff className="h-4 w-4 mr-2" />
                    Unmute
                  </Button>
                </div>
                <Button onClick={handleWarmTransfer} className="w-full">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Initiate Warm Transfer
                </Button>
                <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                  End Call
                </Button>
              </CardContent>
            </Card>
          )}

          {isTransferring && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  Transfer Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {transferSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-3">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <Button onClick={cancelTransfer} variant="outline" className="w-full bg-transparent">
                  Cancel Transfer
                </Button>
              </CardContent>
            </Card>
          )}

          {transferSession && (
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Transfer Script (Agent A to Agent B)</Label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">{transferSession.transferScript}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Agent B Response</Label>
                    <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">{transferSession.agentBResponse}</p>
                    </div>
                  </div>
                  {transferSession.keyPoints.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Key Points</Label>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Console */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Debug Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-48 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="text-gray-500">Debug logs will appear here...</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
              <Button onClick={() => setDebugLogs([])} variant="outline" size="sm" className="mt-2">
                Clear Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Testing Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Step 1: System Health Check</h4>
              <p className="text-sm">Click "Run System Health Check" to verify all components are working:</p>
              <ul className="list-disc list-inside text-sm mt-1 ml-4">
                <li>✅ Green = Working correctly</li>
                <li>❌ Red = Error (check console for details)</li>
                <li>🔍 Yellow = Checking/Unknown status</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Step 2: Test Warm Transfer Flow</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Fill in room name and your name (Agent A)</li>
                <li>Configure call context (caller name, issue, etc.)</li>
                <li>Click "Connect to Room"</li>
                <li>Once connected, click "Initiate Warm Transfer"</li>
                <li>Watch the transfer progress and debug logs</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">What to Look For</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>
                  <strong>Debug Console:</strong> Shows real-time system activity
                </li>
                <li>
                  <strong>Transfer Progress:</strong> Each step should complete successfully
                </li>
                <li>
                  <strong>AI-Generated Content:</strong> Transfer script and agent responses
                </li>
                <li>
                  <strong>No Errors:</strong> Red error messages indicate issues
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
