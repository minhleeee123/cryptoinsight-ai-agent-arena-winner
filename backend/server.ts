// Express Server with IQ ADK Agents
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { 
  analyzeCoin, 
  generateMarketReport 
} from './agents/marketAgent.js';
import { 
  determineIntent, 
  chatWithModel 
} from './agents/chatAgent.js';
import { 
  analyzePortfolio, 
  updatePortfolio 
} from './agents/portfolioAgent.js';
import { 
  createTransactionPreview 
} from './agents/transactionAgent.js';
import { 
  analyzeChartImage 
} from './agents/visionAgent.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    /\.vercel\.app$/,
    /\.railway\.app$/
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // For image uploads

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'CryptoInsight Backend (IQ ADK)',
    timestamp: new Date().toISOString()
  });
});

// ========== MARKET AGENT ENDPOINTS ==========

app.post('/api/analyze-coin', async (req, res) => {
  try {
    const { coinName } = req.body;
    if (!coinName) {
      return res.status(400).json({ error: 'coinName is required' });
    }
    
    console.log(`[API] Analyzing coin: ${coinName}`);
    const data = await analyzeCoin(coinName);
    res.json(data);
  } catch (error: any) {
    console.error('[API] Error analyzing coin:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze coin' });
  }
});

app.post('/api/market-report', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'data is required' });
    }
    
    console.log(`[API] Generating market report for: ${data.coinName}`);
    const report = await generateMarketReport(data);
    res.json({ report });
  } catch (error: any) {
    console.error('[API] Error generating report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

// ========== CHAT AGENT ENDPOINTS ==========

app.post('/api/determine-intent', async (req, res) => {
  try {
    const { userMessage, userId = 'default' } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    
    console.log(`[API] Determining intent: ${userMessage} (User: ${userId})`);
    const intent = await determineIntent(userMessage, userId);
    res.json(intent);
  } catch (error: any) {
    console.error('[API] Error determining intent:', error);
    res.status(500).json({ error: error.message || 'Failed to determine intent' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, userId = 'default', contextData } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    
    console.log(`[API] Chat: ${userMessage} (User: ${userId})`);
    const response = await chatWithModel(userMessage, userId, contextData);
    res.json({ response });
  } catch (error: any) {
    console.error('[API] Error in chat:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// ========== PORTFOLIO AGENT ENDPOINTS ==========

app.post('/api/analyze-portfolio', async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio) {
      return res.status(400).json({ error: 'portfolio is required' });
    }
    
    console.log(`[API] Analyzing portfolio with ${portfolio.length} items`);
    const analysis = await analyzePortfolio(portfolio);
    res.json({ analysis });
  } catch (error: any) {
    console.error('[API] Error analyzing portfolio:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze portfolio' });
  }
});

app.post('/api/update-portfolio', async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio) {
      return res.status(400).json({ error: 'portfolio is required' });
    }
    
    console.log(`[API] Updating portfolio prices for ${portfolio.length} items`);
    const updated = await updatePortfolio(portfolio);
    res.json(updated);
  } catch (error: any) {
    console.error('[API] Error updating portfolio:', error);
    res.status(500).json({ error: error.message || 'Failed to update portfolio' });
  }
});

// ========== TRANSACTION AGENT ENDPOINTS ==========

app.post('/api/transaction-preview', async (req, res) => {
  try {
    const { userText } = req.body;
    if (!userText) {
      return res.status(400).json({ error: 'userText is required' });
    }
    
    console.log(`[API] Creating transaction preview: ${userText}`);
    const transaction = await createTransactionPreview(userText);
    res.json(transaction);
  } catch (error: any) {
    console.error('[API] Error creating transaction:', error);
    res.status(500).json({ error: error.message || 'Failed to create transaction' });
  }
});

// ========== VISION AGENT ENDPOINTS ==========

app.post('/api/analyze-chart', async (req, res) => {
  try {
    const { base64Image, promptText } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }
    
    console.log(`[API] Analyzing chart image`);
    const analysis = await analyzeChartImage(base64Image, promptText || "Analyze this chart");
    res.json({ analysis });
  } catch (error: any) {
    console.error('[API] Error analyzing chart:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze chart' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ CryptoInsight Backend (IQ ADK) running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
