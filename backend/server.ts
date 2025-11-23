import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { 
  analyzeCoin, 
  generateMarketReport, 
  determineIntent, 
  chatWithModel, 
  analyzePortfolio, 
  updatePortfolioRealTime,
  createTransactionPreview 
} from './adkService.js';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',           // Local development
    'http://localhost:5173',           // Vite dev server
    /\.vercel\.app$/,                  // Any Vercel deployment
    /\.railway\.app$/                  // Railway preview deployments
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'CryptoInsight Backend (IQ ADK)' });
});

// Analyze coin
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

// Generate market report
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

// Determine intent
app.post('/api/determine-intent', async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    
    console.log(`[API] Determining intent: ${userMessage}`);
    const intent = await determineIntent(userMessage);
    res.json(intent);
  } catch (error: any) {
    console.error('[API] Error determining intent:', error);
    res.status(500).json({ error: error.message || 'Failed to determine intent' });
  }
});

// Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage, contextData } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'userMessage is required' });
    }
    
    console.log(`[API] Chat: ${userMessage}`);
    const response = await chatWithModel(userMessage, contextData);
    res.json({ response });
  } catch (error: any) {
    console.error('[API] Error in chat:', error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

// Analyze portfolio
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

// Update portfolio prices
app.post('/api/update-portfolio', async (req, res) => {
  try {
    const { portfolio } = req.body;
    if (!portfolio) {
      return res.status(400).json({ error: 'portfolio is required' });
    }
    
    console.log(`[API] Updating portfolio prices for ${portfolio.length} items`);
    const updated = await updatePortfolioRealTime(portfolio);
    res.json(updated);
  } catch (error: any) {
    console.error('[API] Error updating portfolio:', error);
    res.status(500).json({ error: error.message || 'Failed to update portfolio' });
  }
});

// Create transaction preview
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 CryptoInsight Backend (IQ ADK) running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
