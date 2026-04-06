# Day 42: AI Node Integrations - Complete ✅

**Date:** April 6, 2026  
**Status:** IMPLEMENTATION COMPLETE  
**MVP Feature:** AI-Powered Workflow Nodes

---

## Overview

Implemented comprehensive AI node integrations including OpenAI GPT-4, Claude API, image generation (DALL-E, Stable Diffusion), text-to-speech nodes, and AI response parsing utilities for workflow automation.

---

## Features Implemented

### 1. ✅ OpenAI GPT-4 Node

**Capabilities:**
- Text completion (GPT-4, GPT-3.5-turbo)
- Chat completion with conversation history
- Function calling support
- JSON mode for structured output
- Custom system prompts
- Temperature & token control

**Node Configuration:**
- Model selection (gpt-4, gpt-4-turbo, gpt-3.5-turbo)
- System prompt template
- User message with variable interpolation
- Temperature (0-2)
- Max tokens
- Top-p sampling
- Frequency/presence penalties

**Output:**
- Generated text
- Token usage (prompt, completion, total)
- Finish reason
- Function call results (if enabled)

### 2. ✅ Claude API Node

**Capabilities:**
- Claude 3 Opus, Sonnet, Haiku support
- Multi-turn conversations
- Document analysis (up to 100K tokens)
- JSON output mode
- Vision support (images)

**Node Configuration:**
- Model selection (claude-3-opus, claude-3-sonnet, claude-3-haiku)
- System prompt
- Messages array (role, content)
- Max tokens (1-100K)
- Temperature
- Top-k, top-p

**Output:**
- Generated response
- Stop reason
- Token usage
- Content blocks (text, image)

### 3. ✅ Image Generation Nodes

**DALL-E 3:**
- Text-to-image generation
- Style selection (vivid, natural)
- Quality settings (standard, hd)
- Size options (1024x1024, 1024x1792, 1792x1024)

**Stable Diffusion:**
- Text-to-image
- Image-to-image
- Negative prompts
- Step count control
- CFG scale
- Seed control

**Midjourney (via API wrapper):**
- Prompt generation
- Style parameters
- Aspect ratio
- Quality settings

**Output:**
- Image URL(s)
- Generation metadata
- Prompt used
- Seed (for reproducibility)

### 4. ✅ Text-to-Speech Nodes

**OpenAI TTS:**
- Voices: alloy, echo, fable, onyx, nova, shimmer
- Formats: mp3, opus, aac, flac
- Speed control (0.25x - 4x)

**ElevenLabs:**
- 29+ pre-made voices
- Voice cloning support
- Emotion control
- Stability & similarity settings

**Output:**
- Audio file URL
- Duration
- Character count
- Voice used

### 5. ✅ AI Response Parsing

**Parsers:**
- JSON extraction from AI responses
- Structured data validation (Zod schemas)
- Multi-part response splitting
- Code block extraction
- Citation/link extraction

**Utilities:**
- Response cleaning
- Hallucination detection
- Confidence scoring
- Fallback handling

---

## Database Schema

### New Models

```prisma
// Day 42: AI Integrations
model AiProvider {
  id          String   @id @default(cuid())
  name        String   @unique // openai, anthropic, stability, elevenlabs
  apiKey      String   @db.Text
  isActive    Boolean  @default(true)
  usageLimit  Int?     // Monthly token/credit limit
  usageCount  Int      @default(0)
  resetDate   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  generations AiGeneration[]
}

model AiGeneration {
  id          String   @id @default(cuid())
  providerId  String
  provider    AiProvider @relation(fields: [providerId], references: [id])
  userId      String
  workflowId  String
  executionId String
  model       String
  type        String   // text, image, audio
  prompt      String   @db.Text
  response    Json?
  tokens      Int?
  cost        Float?
  status      String   @default("success")
  error       String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([workflowId])
  @@index([providerId])
}
```

---

## Library Files

### `lib/ai/openai.ts` (New)

- `generateText()` - Text completion
- `generateChat()` - Chat completion
- `generateImage()` - DALL-E image generation
- `generateSpeech()` - Text-to-speech
- `extractJson()` - Extract JSON from response
- `countTokens()` - Token counting

### `lib/ai/anthropic.ts` (New)

- `generateClaude()` - Claude text generation
- `generateClaudeVision()` - Image analysis
- `extractJson()` - JSON mode
- `countTokens()` - Token estimation

### `lib/ai/stability.ts` (New)

- `generateImage()` - Stable Diffusion
- `imageToImage()` - Image variation
- `upscale()` - Image upscaling

### `lib/ai/elevenlabs.ts` (New)

- `generateSpeech()` - TTS generation
- `listVoices()` - Available voices
- `cloneVoice()` - Voice cloning

### `lib/ai/registry.ts` (New)

- `getProvider()` - Get provider by name
- `generate()` - Unified generation interface
- `estimateCost()` - Cost estimation

### `lib/ai/parser.ts` (New)

- `parseJsonResponse()` - Extract JSON
- `validateResponse()` - Schema validation
- `extractCodeBlocks()` - Code extraction
- `cleanResponse()` - Response cleanup

---

## API Endpoints

### AI Providers

**GET `/api/ai/providers`** - List configured providers

**POST `/api/ai/providers`** - Add new provider
```json
{
  "name": "openai",
  "apiKey": "sk-...",
  "usageLimit": 10000
}
```

### Text Generation

**POST `/api/nodes/ai-text/execute`** - Execute AI text node
```json
{
  "provider": "openai",
  "model": "gpt-4-turbo",
  "systemPrompt": "You are a helpful assistant",
  "userPrompt": "Write a product description for {{product.name}}",
  "inputData": { "product": { "name": "Widget" } },
  "temperature": 0.7,
  "maxTokens": 500
}
```

### Image Generation

**POST `/api/nodes/ai-image/execute`** - Generate image
```json
{
  "provider": "dall-e",
  "prompt": "A futuristic cityscape at sunset",
  "size": "1024x1024",
  "style": "vivid",
  "quality": "hd"
}
```

### Text-to-Speech

**POST `/api/nodes/ai-speech/execute`** - Generate speech
```json
{
  "provider": "elevenlabs",
  "text": "Welcome to our platform",
  "voice": "rachel",
  "speed": 1.0,
  "format": "mp3"
}
```

### Usage Tracking

**GET `/api/ai/usage`** - Get AI usage stats

**GET `/api/ai/usage/cost`** - Calculate costs

---

## UI Components

### `components/nodes/AiTextNode.tsx`

- Provider selection
- Model picker
- System prompt editor
- User prompt with variables
- Temperature slider
- Token limit input
- Preview response

### `components/nodes/AiImageNode.tsx`

- Provider selection (DALL-E, SD)
- Prompt builder
- Style selector
- Size options
- Quality settings
- Image preview grid

### `components/nodes/AiSpeechNode.tsx`

- Provider selection
- Voice picker with preview
- Text input
- Speed control
- Audio player
- Download button

### `components/ai/UsageDashboard.tsx`

- Token usage by provider
- Cost breakdown
- Usage trends
- Limit warnings
- Provider status

---

## Example Usage

### OpenAI Text Generation

```typescript
import { OpenAiProvider } from '@/lib/ai/openai';

const openai = new OpenAiProvider(process.env.OPENAI_API_KEY!);

const result = await openai.generateChat({
  model: 'gpt-4-turbo',
  messages: [
    { role: 'system', content: 'You are a marketing assistant' },
    { role: 'user', content: 'Write a tweet about AI automation' },
  ],
  temperature: 0.8,
  maxTokens: 280,
});

console.log(result.content); // Generated tweet
console.log(result.usage);   // { promptTokens: 25, completionTokens: 45, totalTokens: 70 }
```

### Claude with JSON Output

```typescript
import { AnthropicProvider } from '@/lib/ai/anthropic';

const claude = new AnthropicProvider(process.env.ANTHROPIC_API_KEY!);

const result = await claude.generateClaude({
  model: 'claude-3-sonnet-20240229',
  system: 'Extract data as JSON',
  messages: [{
    role: 'user',
    content: 'John Doe, age 30, lives in NYC. Email: john@example.com'
  }],
  maxTokens: 1000,
  jsonMode: true,
});

// Result: { name: "John Doe", age: 30, location: "NYC", email: "john@example.com" }
```

### DALL-E Image Generation

```typescript
import { DallEProvider } from '@/lib/ai/openai';

const dalle = new DallEProvider(process.env.OPENAI_API_KEY!);

const result = await dalle.generateImage({
  prompt: 'A cyberpunk cat wearing sunglasses, neon city background',
  size: '1024x1024',
  quality: 'hd',
  style: 'vivid',
  n: 1,
});

console.log(result.imageUrl); // https://oaidalle.com/...
```

### ElevenLabs TTS

```typescript
import { ElevenLabsProvider } from '@/lib/ai/elevenlabs';

const elevenlabs = new ElevenLabsProvider(process.env.ELEVENLABS_API_KEY!);

const result = await elevenlabs.generateSpeech({
  text: 'Welcome to HarshAI! Let me show you around.',
  voice: 'rachel',
  model: 'eleven_monolingual_v1',
  stability: 0.5,
  similarity: 0.75,
});

// result.audioUrl = https://api.elevenlabs.io/v1/audio/...
```

### AI Response Parsing

```typescript
import { parseJsonResponse } from '@/lib/ai/parser';
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(0),
});

const aiResponse = `Here's the data:\n\n\`\`\`json\n{"name": "John", "email": "john@example.com", "age": 30}\n\`\`\``;

const parsed = await parseJsonResponse(aiResponse, schema);
// { name: "John", email: "john@example.com", age: 30 }
```

---

## Cost Estimation

### OpenAI Pricing (per 1K tokens)

| Model | Input | Output |
|-------|-------|--------|
| GPT-4-turbo | $0.01 | $0.03 |
| GPT-4 | $0.03 | $0.06 |
| GPT-3.5-turbo | $0.0005 | $0.0015 |

### Anthropic Pricing

| Model | Input | Output |
|-------|-------|--------|
| Claude 3 Opus | $0.015 | $0.075 |
| Claude 3 Sonnet | $0.003 | $0.015 |
| Claude 3 Haiku | $0.00025 | $0.00125 |

### Image Generation

| Provider | Cost per Image |
|----------|---------------|
| DALL-E 3 (standard) | $0.040 |
| DALL-E 3 (hd) | $0.080 |
| Stable Diffusion | $0.002-0.020 |

### TTS

| Provider | Cost per 1K chars |
|----------|------------------|
| OpenAI TTS | $0.015 |
| ElevenLabs | $0.05-0.30 |

---

## Security Considerations

- **API Key Encryption:** All keys encrypted at rest
- **Usage Limits:** Per-user and per-workflow limits
- **Content Filtering:** Moderate API inputs/outputs
- **Cost Controls:** Budget alerts and hard limits
- **Data Privacy:** No training on user data

---

## Benefits

- **No-Code AI:** Anyone can use AI in workflows
- **Multi-Provider:** Switch between AI providers
- **Cost Tracking:** Know exactly what you spend
- **Structured Output:** Reliable JSON parsing
- **Media Generation:** Images and audio from text

---

**Status:** ✅ COMPLETE  
**Next:** Day 43 - Data Transformation Nodes
