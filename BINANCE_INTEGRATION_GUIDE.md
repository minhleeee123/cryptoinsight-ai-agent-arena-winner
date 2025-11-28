# 🔗 Kết nối Frontend với Binance Backend

## 📝 Tóm tắt thay đổi

Đã thêm tính năng **Binance Testnet Trading** vào ứng dụng với kiến trúc:

```
Frontend (React)  ←→  Backend Proxy (Express)  ←→  Binance Testnet API
   Port 3000              Port 3002                  testnet.binance.vision
```

## 🆕 Files đã thêm

### Frontend
1. **`services/binanceApiClient.ts`** - API client gọi backend proxy
2. **`components/BinanceCard.tsx`** - UI component hiển thị balances & trading

### Backend (trong `backend_binance/`)
1. **`server.ts`** - Express server với 8 endpoints
2. **`binanceService.ts`** - Logic xử lý Binance API + signing
3. **`package.json`** - Dependencies
4. **`.env`** - API keys (testnet)

## 🔧 Files đã sửa

### `App.tsx`
- Import `BinanceCard`
- Thêm view state: `'binance'`
- Thêm route cho Binance view

### `components/layout/Sidebar.tsx`
- Thêm menu item "Binance Testnet"
- Cập nhật type cho `currentView`

## 🚀 Cách chạy

### 1. Start Backend (Terminal 1)
```bash
cd backend_binance
npm install
npm run dev
```
✅ Backend chạy tại: `http://localhost:3002`

### 2. Start Frontend (Terminal 2)
```bash
cd for_hackathon_t12
npm run dev
```
✅ Frontend chạy tại: `http://localhost:3000`

### 3. Sử dụng

1. Mở app → Click **"Binance Testnet"** trong sidebar
2. Xem balances (Spot & Futures)
3. Đặt lệnh thử nghiệm:
   - Symbol: BTCUSDT
   - Side: BUY/SELL
   - Type: MARKET/LIMIT
   - Quantity: 0.001

## 📊 Features

### Hiển thị
- ✅ Spot Balances
- ✅ Futures Balances
- ✅ Real-time refresh
- ✅ Tab switching

### Trading
- ✅ Place Market Order
- ✅ Place Limit Order
- ✅ Order result display
- ✅ Auto-refresh balances sau khi order

## 🔌 API Endpoints đang dùng

Frontend gọi qua `binanceApiClient.ts`:

```typescript
// Public
getBinancePrice(symbol)         // GET /api/binance/price/:symbol
get24hrStats(symbol)            // GET /api/binance/stats/:symbol

// Private
getBinanceBalances()            // GET /api/binance/balances
getSpotBalances()               // GET /api/binance/balances/spot
getFuturesBalances()            // GET /api/binance/balances/futures

// Trading
placeSpotOrder(order)           // POST /api/binance/order/spot
placeFuturesOrder(order)        // POST /api/binance/order/futures
cancelOrder(symbol, orderId)    // DELETE /api/binance/order/:symbol/:orderId
getOpenOrders(symbol?)          // GET /api/binance/orders/open
```

## 🎨 UI Components

### BinanceCard
- Tabs: Spot / Futures
- Balance list với color-coded display
- Quick trade form
- Order result feedback
- Loading states
- Refresh button

## 🔐 Security

✅ **API Keys ở backend** - Không exposed ra frontend
✅ **CORS configured** - Chỉ cho phép localhost:3000
✅ **Testnet only** - Không dùng real funds

## 📝 Example Usage

### Get Price
```typescript
import { getBinancePrice } from './services/binanceApiClient';

const price = await getBinancePrice('BTCUSDT');
console.log(price); // 64231.50
```

### Place Order
```typescript
import { placeSpotOrder } from './services/binanceApiClient';

const result = await placeSpotOrder({
  symbol: 'BTCUSDT',
  side: 'BUY',
  type: 'MARKET',
  quantity: '0.001'
});
```

## 🐛 Troubleshooting

### Backend không chạy
```bash
# Check xem port 3002 có bị chiếm không
netstat -ano | findstr :3002

# Hoặc đổi port trong .env
PORT=3003
```

### CORS Error
- Đảm bảo backend đang chạy
- Check `BINANCE_API_BASE` trong `binanceApiClient.ts`
- Xem console backend có log request không

### Order failed
- Check balances có đủ không
- Verify symbol format (BTCUSDT, không có dấu -)
- Quantity phải đúng format (0.001, không phải "0,001")

## 🎯 Next Steps

Có thể mở rộng:
1. ✨ Thêm Order History view
2. 📊 Chart tích hợp TradingView
3. ⚡ WebSocket real-time updates
4. 🤖 AI Trading Assistant integration
5. 📱 Mobile responsive improvements

## 💡 Tips

- Testnet có thể unstable, retry nếu API fail
- Market orders execute ngay, Limit orders cần match price
- Refresh balances để thấy thay đổi sau order
- Backend log chi tiết giúp debug

---

**Prepared by:** GitHub Copilot  
**Date:** November 28, 2025
