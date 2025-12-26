# 🚀 CryptoInsight Backend (IQ ADK)

## 📋 Tổng quan

Backend mới sử dụng **IQ ADK (Agent Development Kit)** với kiến trúc agents riêng biệt.

## 🏗️ Kiến trúc

```
Frontend (React)           Backend (Express + IQ ADK)      AI
    :5173        ←→              :3001              ←→   Gemini 2.5
                 HTTP API                           ADK Agents
```

## 📁 Cấu trúc

```
backend_for_hackathon_t12/
├── agents/                    ← 5 IQ ADK Agents
│   ├── chatAgent.ts          ← Intent + Chat
│   ├── marketAgent.ts        ← Coin analysis với tools
│   ├── portfolioAgent.ts     ← Portfolio analysis
│   ├── transactionAgent.ts   ← Transaction parser
│   └── visionAgent.ts        ← Chart image analysis
├── dataFetcher.ts            ← CoinGecko, Binance APIs
├── types.ts                  ← Shared TypeScript types
├── server.ts                 ← Express server
├── package.json
├── tsconfig.json
└── .env
```

## 🔧 Setup

### 1. Install dependencies
```bash
cd backend_for_hackathon_t12
npm install
```

### 2. Configure .env
```bash
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### 3. Start backend
```bash
npm run dev
```

✅ Backend running at: **http://localhost:3001**

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze-coin` | POST | Analyze coin with tools |
| `/api/market-report` | POST | Generate market report |
| `/api/determine-intent` | POST | Classify user intent |
| `/api/chat` | POST | Chat with AI |
| `/api/analyze-portfolio` | POST | Portfolio analysis |
| `/api/update-portfolio` | POST | Update portfolio prices |
| `/api/transaction-preview` | POST | Parse transaction |
| `/api/analyze-chart` | POST | Analyze chart image |

## 🎯 Sự khác biệt với backend cũ

### Backend cũ (`backend/`)
- ✅ Tham khảo cú pháp IQ ADK
- ❌ **KHÔNG SỬ DỤNG NỮUA**

### Backend mới (`backend_for_hackathon_t12/`)
- ✅ Agents riêng biệt (5 files)
- ✅ Tool calling tự động
- ✅ Express server hoàn chỉnh
- ✅ **ĐANG SỬ DỤNG**

## 🚀 Chạy cả frontend + backend

**Terminal 1 - Backend:**
```bash
cd backend_for_hackathon_t12
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd for_hackathon_t12
npm run dev
```

## ✅ Advantages

1. **Bảo mật**: API key giấu ở backend
2. **Tool Calling**: AI tự gọi CoinGecko, Binance APIs
3. **Scalable**: Dễ thêm agents mới
4. **Clean Code**: Agents tách biệt, không trùng lặp
5. **Professional**: Kiến trúc chuẩn production

## 🔗 Frontend Integration

Frontend gọi backend qua `services/backendClient.ts`:

```typescript
import { analyzeCoin } from './services/backendClient';

const data = await analyzeCoin('Bitcoin'); // ← Gọi backend thay vì Gemini trực tiếp
```
