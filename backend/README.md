# 🚀 CryptoInsight Backend with IQ ADK

## 📋 Tổng quan

Backend API sử dụng **IQ ADK (Agent Development Kit)** để xử lý các tác vụ AI với Gemini.

## 🏗️ Architecture

```
Frontend (React)           Backend (Express + IQ ADK)      AI
    :3000        ←→              :3001              ←→   Gemini 2.5
                 HTTP API                           ADK Agents
```

## ✅ Đã Setup

### Backend Server
- ✅ Express API server
- ✅ IQ ADK integration với 6 agents
- ✅ CORS enabled cho frontend
- ✅ System prompts giữ nguyên 100%

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze-coin` | POST | Phân tích coin với ADK |
| `/api/market-report` | POST | Tạo báo cáo thị trường |
| `/api/determine-intent` | POST | Phân loại intent người dùng |
| `/api/chat` | POST | Chat với AI |
| `/api/analyze-portfolio` | POST | Phân tích portfolio |
| `/api/update-portfolio` | POST | Update giá portfolio |
| `/api/transaction-preview` | POST | Parse transaction request |

## 🚀 Cách chạy

### 1. Start Backend (Terminal 1)
```bash
cd for_hackathon_t12/backend
npm run dev
```

✅ Backend chạy tại: **http://localhost:3001**

### 2. Start Frontend (Terminal 2)
```bash
cd for_hackathon_t12
npm run dev
```

✅ Frontend chạy tại: **http://localhost:3000**

## 🔧 Cấu hình

### Backend `.env`
```bash
GOOGLE_API_KEY=your_api_key
PORT=3001
```

### Frontend API Client
File: `services/apiClient.ts`
- Default: `http://localhost:3001`
- Tự động gọi backend thay vì direct AI call

## 📊 IQ ADK Agents

Backend sử dụng 6 specialized agents:

1. **crypto_data_aggregator** - Phân tích coin với real-time data
2. **market_analyst** - Tạo báo cáo chi tiết
3. **intent_classifier** - Phân loại intent người dùng
4. **cryptoinsight_chat** - Chat assistant
5. **portfolio_analyst** - Phân tích portfolio
6. **web3_transaction_agent** - Parse Web3 transactions

## ✨ System Prompts

Tất cả system prompts **GIỮ NGUYÊN 100%** từ version gốc:
- ✅ Crypto Data Aggregator instructions
- ✅ Market Analyst structure
- ✅ Intent classification rules
- ✅ Chat context management
- ✅ Portfolio analysis criteria
- ✅ Transaction parsing rules

## 🔄 Transform Layer

Backend có transform layer tự động convert ADK output về đúng `CryptoData` interface:
- `priceHistory7D` → `priceHistory`
- `marketSentiment.score` → `sentimentScore`
- `longShortRatioBinance` → `longShortRatio`
- `projectScores` object → array

## 🧪 Test Backend

### Health Check
```bash
curl http://localhost:3001/health
```

### Test Analyze
```bash
curl -X POST http://localhost:3001/api/analyze-coin \
  -H "Content-Type: application/json" \
  -d '{"coinName": "Bitcoin"}'
```

## 📝 Example Usage

### Frontend Code
```typescript
import { analyzeCoin } from './services/apiClient';

// Sử dụng giống hệt như trước, nhưng giờ call backend
const data = await analyzeCoin("Bitcoin");
// Backend xử lý với IQ ADK agents
```

## 🆚 So sánh với trước

| Aspect | Trước (Direct) | Bây giờ (Backend) |
|--------|----------------|-------------------|
| Architecture | Frontend → Gemini | Frontend → Backend → Gemini |
| Browser compat | ❌ IQ ADK không chạy | ✅ Chạy hoàn hảo |
| System prompts | ✅ Giữ nguyên | ✅ Giữ nguyên |
| API calls | Direct từ browser | API calls qua backend |
| Performance | N/A | ~8-10s per request |

## ⚙️ Production Deployment

### Backend
```bash
npm run build
npm start
```

### Environment Variables
```bash
GOOGLE_API_KEY=production_key
PORT=3001
NODE_ENV=production
```

### Frontend
Update `apiClient.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-domain.com';
```

## 📦 Dependencies

### Backend
- `@iqai/adk` - Agent Development Kit
- `express` - Web server
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `zod` - Schema validation

### Shared
- Gemini AI API key
- Node.js 18+

## 🎯 Kết luận

✅ **Backend đã sẵn sàng production!**
- IQ ADK hoạt động hoàn hảo trong Node.js environment
- System prompts giữ nguyên 100%
- Frontend không cần thay đổi logic, chỉ đổi import
- Tất cả tính năng đều work!

**Cách test:** Mở http://localhost:3000, thử "Analyze Bitcoin" → Backend xử lý với IQ ADK! 🎉
