# Gemini Service with IQ ADK

## 📋 Tổng quan

File này là phiên bản **IQ ADK** của `geminiService.ts`, sử dụng AgentBuilder và FunctionTool thay vì gọi API trực tiếp.

## 🆚 So sánh với phiên bản gốc

### File gốc (`services/geminiService.ts`)
```typescript
// Gọi API trực tiếp với Google GenAI SDK
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "...",
  config: {
    systemInstruction: "...",
    responseMimeType: "application/json",
    responseSchema: cryptoSchema
  }
});
```

### Phiên bản ADK (`services-adk/geminiService.ts`)
```typescript
// Sử dụng IQ ADK AgentBuilder
const { runner } = await AgentBuilder
  .create("crypto_data_aggregator")
  .withModel("gemini-2.5-flash")
  .withInstruction(systemInstruction)
  .withRunConfig({ temperature: 0.2 })
  .buildWithSchema(cryptoZodSchema);

const result = await runner.ask("Generate data...");
```

## ✨ Các cải tiến với IQ ADK

### 1️⃣ **Structured Output với Zod**
- **Trước**: Sử dụng Google GenAI Schema (Type.OBJECT, Type.STRING, etc.)
- **ADK**: Sử dụng Zod schema (type-safe, elegant)
```typescript
const cryptoZodSchema = z.object({
  coinName: z.string().describe("Name of the cryptocurrency"),
  currentPrice: z.number().describe("Current price in USD"),
  // ... more fields
});
```

### 2️⃣ **Session Management cho Chat**
- **Trước**: Manual history tracking
- **ADK**: Built-in session với `.withQuickSession()`
```typescript
const { runner } = await AgentBuilder
  .create("cryptoinsight_chat")
  .withQuickSession(sessionId)
  .build();
```

### 3️⃣ **Agent Pattern cho mỗi tác vụ**
- `crypto_data_aggregator` - Phân tích coin
- `web3_transaction_agent` - Parse giao dịch
- `market_analyst` - Tạo báo cáo
- `intent_classifier` - Phân loại intent
- `cryptoinsight_chat` - Chatbot
- `portfolio_analyst` - Phân tích portfolio

### 4️⃣ **Cleaner Code**
```typescript
// Trước (60+ dòng setup)
const ai = new GoogleGenAI({ apiKey: ... });
const response = await ai.models.generateContent({
  model: "...",
  contents: "...",
  config: { systemInstruction: "...", responseSchema: ... }
});
const result = JSON.parse(response.text);

// ADK (30 dòng)
const { runner } = await AgentBuilder
  .create("agent_name")
  .withModel("gemini-2.5-flash")
  .withInstruction(systemInstruction)
  .buildWithSchema(schema);
const result = await runner.ask("...");
```

## 🚀 Cách sử dụng

### Import từ services-adk thay vì services
```typescript
// Trước
import { analyzeCoin } from './services/geminiService';

// Bây giờ (ADK version)
import { analyzeCoin } from './services-adk/geminiService';
```

### Sử dụng giống hệt file gốc
```typescript
// 1. Phân tích coin
const data = await analyzeCoin("Bitcoin");

// 2. Tạo transaction preview
const tx = await createTransactionPreview("Send 1 ETH to 0x123...");

// 3. Generate market report
const report = await generateMarketReport(cryptoData);

// 4. Detect intent
const intent = await determineIntent("Analyze Solana");

// 5. Chat
const response = await chatWithModel("What is BTC price?", history, contextData);

// 6. Portfolio analysis
const analysis = await analyzePortfolio(portfolioItems);
```

## 📊 Performance & Features

| Feature | Gốc (GenAI SDK) | ADK Version |
|---------|----------------|-------------|
| Code lines | ~350 | ~320 |
| Schema type | GenAI Schema | Zod (Type-safe) |
| Session mgmt | Manual | Built-in |
| Error handling | Manual | Built-in |
| Tool support | ❌ | ✅ Ready for FunctionTool |
| Callbacks | ❌ | ✅ beforeTool/afterTool |
| Temperature control | ✅ | ✅ |
| Timeout control | ❌ | ✅ |

## 🔧 Cấu hình

### Environment Variables (giống file gốc)
```bash
# .env.local
API_KEY=your_gemini_api_key_here
```

### Dependencies (đã có sẵn)
```json
{
  "@iqai/adk": "^0.5.6",
  "@google/genai": "^1.30.0",
  "zod": "^3.25.76"
}
```

## 💡 Khi nào dùng version nào?

### Dùng **services/geminiService.ts** (Gốc) khi:
- Cần control tuyệt đối mọi detail của API call
- Đã quen với Google GenAI SDK
- Không cần conversation memory
- Single request/response pattern

### Dùng **services-adk/geminiService.ts** (ADK) khi:
- Muốn code ngắn gọn, dễ maintain
- Cần session management cho chat
- Muốn mở rộng với FunctionTool (tool calling)
- Cần callbacks để monitor/logging
- Type-safety với Zod

## 🎯 Future Enhancements (có thể thêm với ADK)

```typescript
// 1. Thêm FunctionTool cho real-time data fetching
const priceTool = new FunctionTool(getPriceAction, {
  name: "get_price_action",
  description: "Fetch real-time price history"
});

const { runner } = await AgentBuilder
  .withTools(priceTool)
  .build();

// 2. Callbacks cho monitoring
const { runner } = await AgentBuilder
  .withBeforeToolCallback(async (tool, args) => {
    console.log(`Calling ${tool.name}...`);
  })
  .withAfterToolCallback(async (tool, args, ctx, response) => {
    console.log(`${tool.name} completed`);
  })
  .build();
```

## 📝 Notes

- **System prompts giữ nguyên 100%** - Chỉ thay đổi cách gọi API
- **API fetching functions không đổi** - searchCoinGecko, getPriceAction, getSentiment, etc.
- **Type definitions tương thích** - Sử dụng cùng types.ts
- **Có thể swap giữa 2 versions** - Interface giống hệt nhau

## ⚠️ Lưu ý

- File này **KHÔNG thay thế** file gốc
- Giữ nguyên cả 2 versions để so sánh và testing
- Production: Chọn 1 trong 2 versions để deploy
- ADK version có thêm overhead nhỏ do agent initialization (~100-200ms)
