# Installation & Usage Guide

## Installation Guide

### Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for cloning the repository
- **Google Gemini API Key** ([Get one free](https://aistudio.google.com/app/apikey))

### Step 1: Clone the Repository

```bash
git clone https://github.com/minhleeee123/for_hackathon_t12.git
cd for_hackathon_t12
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend_for_hackathon_t12

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend_for_hackathon_t12` directory:

```bash
# Windows PowerShell
New-Item .env -ItemType File

# Linux/Mac
touch .env
```

Add your API keys to `.env`:

```env
# Google Gemini API Key (Required)
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_api_key_here
GOOGLE_API_KEY=your_actual_api_key_here
GEMINI_API_KEY=your_actual_api_key_here
API_KEY=your_actual_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

> **Important**: Replace `your_actual_api_key_here` with your real Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Step 4: Test Your API Key (Optional but Recommended)

```bash
# Still in backend_for_hackathon_t12 directory
npx tsx test-api-key.ts
```

You should see:
```
✅ API Key is VALID!
📝 Response: Xin chào!
```

If you see errors, verify:
- API key is correct
- Gemini API is enabled in your Google Cloud project
- You haven't exceeded quota limits

### Step 5: Start the Backend Server

```bash
npm run dev
```

Expected output:
```
✅ CryptoInsight Backend (IQ ADK) running on port 3001
📡 Health check: http://localhost:3001/health
```

Test the backend:
```bash
# In a new terminal
curl http://localhost:3001/health
```

### Step 6: Frontend Setup

Open a **new terminal** and navigate to frontend directory:

```bash
cd for_hackathon_t12

# Install dependencies
npm install
```

### Step 7: Configure Frontend (Optional)

If your backend runs on a different port, update `src/services/backendClient.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3001'; // Change port if needed
```

### Step 8: Start the Frontend

```bash
npm run dev
```

Expected output:
```
  VITE v6.2.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 9: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the CryptoInsight AI landing page!

---

## Usage Guide

### Getting Started with CryptoInsight AI

#### 1. Analyzing Cryptocurrencies

**Via Chat Interface**:
```
Type in chat: "Analyze Bitcoin"
```

The AI will:
- Fetch real-time price data
- Calculate sentiment score
- Generate tokenomics breakdown
- Display interactive charts

**Via Dashboard**:
1. Click "Get Started" on landing page
2. Type cryptocurrency name (e.g., "Ethereum", "BTC", "Solana")
3. View comprehensive analysis with:
   - 7-day price history chart
   - Market sentiment gauge
   - Long/Short ratio (Binance data)
   - Tokenomics distribution
   - Project quality scores

#### 2. Portfolio Management

**Creating Your Portfolio**:

1. Navigate to Portfolio section
2. Click "Add Position"
3. Enter:
   - **Symbol**: BTC, ETH, SOL, etc.
   - **Amount**: Quantity you own
   - **Average Price**: Your buy-in price

Example portfolio:
```json
[
  { "symbol": "BTC", "amount": 0.5, "avgPrice": 40000 },
  { "symbol": "ETH", "amount": 5, "avgPrice": 2500 },
  { "symbol": "SOL", "amount": 100, "avgPrice": 80 }
]
```

**Getting AI Analysis**:

Click "Analyze Portfolio" to receive:
- Total portfolio value (real-time)
- Profit/Loss per asset
- Asset allocation percentages
- Risk assessment
- Rebalancing recommendations

#### 3. Transaction Assistance

**Creating Transactions via Natural Language**:

Type in chat:
```
"Send 1 ETH to 0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
```

The AI will parse and display:
- Transaction type (SEND or SWAP)
- Token and amount
- Recipient address
- Network (auto-detected)
- Gas estimate

**Supported Transaction Types**:

**SEND** (Transfer tokens):
```
"Send 0.5 BNB to 0x123... on BSC"
"Transfer 100 USDT to 0xabc... on Ethereum"
```

**SWAP** (Exchange tokens):
```
"Swap 1 ETH for USDT"
"Exchange 100 MATIC to USDC on Polygon"
```

**Supported Networks**:
- Ethereum Mainnet
- Binance Smart Chain (BSC)
- Polygon (Matic)
- Avalanche C-Chain
- Sepolia Testnet

#### 4. Chart Analysis (Vision AI)

**Analyzing Technical Charts**:

1. Take a screenshot of your trading chart
2. Click "Upload Chart" button
3. Draw indicators on the chart (optional)
4. Click "Analyze"

The Vision Agent will identify:
- Support and resistance levels
- Candlestick patterns (Doji, Hammer, Engulfing, etc.)
- Trend lines and channels
- Breakout zones
- Volume patterns

#### 5. Using the Chat Interface

**General Conversation**:
```
"What's the current market sentiment?"
"Explain what is long/short ratio"
"Should I buy Bitcoin now?"
```

**Context-Aware Queries**:

While viewing a coin dashboard:
```
"What's the sentiment for this coin?"
"Is this a good entry point?"
"Compare this to Ethereum"
```

The AI remembers your last 10 messages for contextual responses.

### Advanced Features

#### Real-Time Data Updates

**Auto-Refresh Portfolio**:
```javascript
// Prices update every time you click "Refresh Prices"
// Or use the auto-refresh toggle for live updates
```

**Market Sentiment Updates**:
- Sentiment score updates every analysis
- Long/Short data refreshed from Binance
- Price history fetched from CoinGecko

#### Web3 Wallet Integration

**Connecting MetaMask**:

1. Click "Connect Wallet" button
2. Select MetaMask
3. Approve connection
4. Your address appears in header

**Executing Transactions**:

1. Create transaction preview via chat
2. Review details (gas, network, amount)
3. Click "Execute Transaction"
4. Confirm in MetaMask
5. Wait for blockchain confirmation

#### Keyboard Shortcuts

- **Ctrl + K**: Focus chat input
- **Ctrl + Enter**: Send message
- **Esc**: Close modals

### API Usage Examples

#### Analyze a Coin (cURL)

```bash
curl -X POST http://localhost:3001/api/analyze-coin \
  -H "Content-Type: application/json" \
  -d '{"coinName": "Bitcoin"}'
```

#### Chat with AI (cURL)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "What is blockchain?", "userId": "user123"}'
```

#### Analyze Portfolio (JavaScript)

```javascript
const response = await fetch('http://localhost:3001/api/analyze-portfolio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    portfolio: [
      { symbol: 'BTC', amount: 1, avgPrice: 45000 },
      { symbol: 'ETH', amount: 10, avgPrice: 3000 }
    ]
  })
});

const analysis = await response.json();
console.log(analysis);
```

### Best Practices

1. **API Key Security**:
   - Never commit `.env` files
   - Use separate keys for development/production
   - Monitor usage at [Google AI Studio](https://aistudio.google.com/apikey)

2. **Rate Limiting**:
   - Gemini free tier: 15 requests/minute
   - CoinGecko free: ~30 calls/minute
   - Implement caching for repeated queries

3. **Error Handling**:
   - Always check for quota exceeded errors
   - Implement retry logic with exponential backoff
   - Display user-friendly error messages

4. **Performance**:
   - Batch portfolio updates when possible
   - Use cached data for recent queries
   - Minimize redundant API calls

---

## Building for Production

**Backend**:
```bash
cd backend_for_hackathon_t12
npm run build
npm start
```

**Frontend**:
```bash
cd for_hackathon_t12
npm run build
npm run preview
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production CORS origins
- [ ] Enable HTTPS
- [ ] Set up monitoring for API quota
- [ ] Optimize frontend bundle size
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Implement rate limiting on backend
- [ ] Use environment-specific API URLs

---

## Common Issues & Solutions

### "Quota Exceeded" Error

**Problem**: API returns 429 error
**Solution**:
1. Check usage at https://aistudio.google.com/apikey
2. Wait for daily quota reset
3. Create new API key from different Google project

### Backend Not Starting

**Problem**: Port 3001 already in use
**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Frontend Can't Connect to Backend

**Problem**: CORS errors in browser console
**Solution**:
1. Verify backend is running on port 3001
2. Check `server.ts` CORS configuration includes your frontend URL
3. Clear browser cache and restart

### API Key Not Working

**Problem**: "Invalid API key" error
**Solution**:
1. Verify key is correctly copied (no extra spaces)
2. Check if Gemini API is enabled in Google Cloud Console
3. Test with `npx tsx test-api-key.ts`
4. Create a new API key if necessary

---

For more detailed troubleshooting, see the [main README](./README.md#troubleshooting).
