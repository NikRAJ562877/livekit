
### Core Components

1. **LiveKit Room Management** (`lib/livekit.ts`)
   - Room creation and participant management
   - Token generation for secure access
   - Connection handling

2. **AI Agent System** (`lib/ai-agent.ts`)
   - Call context analysis
   - Summary generation using OpenAI GPT-4
   - Transfer script creation
   - Agent response preparation

3. **Transfer Orchestration** (`lib/transfer-orchestrator.ts`)
   - Step-by-step transfer process
   - Real-time status tracking
   - Error handling and recovery

## Setup Instructions

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the main interface.

## Usage

### Basic Warm Transfer

1. **Connect to Room**: Enter room name and your name (Agent A)
2. **Configure Call Context**: Set up caller information and issue details
3. **Initiate Transfer**: Click "Initiate Warm Transfer" to start the process
4. **Monitor Progress**: Watch real-time transfer steps and AI-generated content

### Demo Mode

Visit `/demo` for pre-configured scenarios:
- Billing Issue (High urgency, negative sentiment)
- Technical Support (Medium urgency, neutral sentiment)
- Account Upgrade (Low urgency, positive sentiment)

## Warm Transfer Flow

1. **Generate Call Summary**: AI analyzes call context and creates comprehensive summary
2. **Create Transfer Room**: New LiveKit room for Agent A and Agent B briefing
3. **Connect Agent B**: Agent B joins the transfer room
4. **Brief Agent B**: Agent A speaks AI-generated summary using text-to-speech
5. **Transfer Caller**: Caller moves from original room to Agent B
6. **Agent A Exit**: Agent A leaves, completing the warm transfer

## API Endpoints

### LiveKit
- `POST /api/livekit/token` - Generate access tokens

### AI Integration
- `POST /api/ai/generate-summary` - Generate call summaries
- `POST /api/ai/initiate-transfer` - Start warm transfer process

### Transfer Management
- `POST /api/transfer/initiate` - Begin transfer orchestration
- `GET /api/transfer/status` - Get transfer progress
- `POST /api/transfer/cancel` - Cancel ongoing transfer

## Technical Requirements

- **Node.js** 18+ 
- **Next.js** 15+
- **LiveKit** account and credentials
- **OpenAI** API key

## Key Technologies

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Real-time Communication**: LiveKit WebRTC
- **AI/LLM**: OpenAI GPT-4 via AI SDK
- **Text-to-Speech**: Web Speech API
- **UI Components**: shadcn/ui

## Development Notes

- The system uses AI SDK patterns for OpenAI integration
- LiveKit rooms are managed server-side with proper token authentication
- Transfer orchestration includes comprehensive error handling
- Text-to-speech provides audible transfer summaries
- All communication happens through LiveKit rooms for seamless real-time interaction

## Demo Recording

The system includes comprehensive logging and can be easily recorded for demonstration purposes. All transfer steps are tracked in real-time with detailed status updates.

## How It Works

### 1. Initial Connection
- User connects to a LiveKit room as Agent A
- Call context is configured with customer details and issue information

### 2. Warm Transfer Initiation
- Agent A clicks "Initiate Warm Transfer"
- AI generates a comprehensive call summary based on the context
- A new LiveKit room is created for the agent briefing

### 3. Agent Briefing
- Agent B joins the briefing room
- Agent A uses text-to-speech to communicate the AI-generated summary
- Agent B acknowledges understanding and readiness

### 4. Caller Transfer
- The original caller is moved to Agent B's room
- Agent A exits the call
- Transfer is complete with full context preserved

## License

This project is built for the Attack Capital assignment and demonstrates advanced real-time communication patterns with AI integration using LiveKit.
