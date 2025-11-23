import { AgentBuilder, FunctionTool } from '@iqai/adk';
import { z } from 'zod';
import { CryptoData, ChatMessage, PortfolioItem, PricePoint, LongShortData, TransactionData } from "../types";

// --- SCHEMA DEFINITIONS (Zod for ADK) ---

const cryptoZodSchema = z.object({
  coinName: z.string().describe("Name of the cryptocurrency"),
  currentPrice: z.number().describe("Current price in USD"),
  summary: z.string().describe("A brief analytical summary based on the provided real data."),
  priceHistory: z.array(z.object({
    time: z.string(),
    price: z.number()
  })),
  tokenomics: z.array(z.object({
    name: z.string(),
    value: z.number()
  })),
  sentimentScore: z.number(),
  longShortRatio: z.array(z.object({
    time: z.string(),
    long: z.number(),
    short: z.number()
  })),
  projectScores: z.array(z.object({
    subject: z.string(),
    A: z.number(),
    fullMark: z.number()
  }))
});

const transactionZodSchema = z.object({
  type: z.enum(["SEND", "SWAP", "BUY", "SELL"]),
  token: z.string(),
  amount: z.number(),
  toAddress: z.string(),
  network: z.string(),
  estimatedGas: z.string(),
  summary: z.string()
});

// --- REAL DATA FETCHING FUNCTIONS ---

const COIN_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'BNB': 'binancecoin',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'MATIC': 'matic-network'
};

async function searchCoinGecko(query: string): Promise<{ id: string; symbol: string; name: string } | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data.coins && data.coins.length > 0) {
      return {
        id: data.coins[0].id,
        symbol: data.coins[0].symbol.toUpperCase(),
        name: data.coins[0].name
      };
    }
    return null;
  } catch (error) {
    console.error("CoinGecko Search Error:", error);
    return null;
  }
}

async function getPriceAction(coinId: string): Promise<{ history: PricePoint[], currentPrice: number } | null> {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`);
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) return null;

    const history: PricePoint[] = data.prices.map((p: [number, number]) => {
      const date = new Date(p[0]);
      return {
        time: `${date.getMonth() + 1}/${date.getDate()}`,
        price: p[1]
      };
    });

    const currentPrice = data.prices[data.prices.length - 1][1];
    return { history, currentPrice };
  } catch (error) {
    console.error("Price Action Error:", error);
    return null;
  }
}

async function getSentiment(): Promise<number> {
  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return parseInt(data.data[0].value, 10);
    }
    return 50;
  } catch (error) {
    console.error("Sentiment Error:", error);
    return 50;
  }
}

async function getLongShortRatio(symbol: string): Promise<LongShortData[] | null> {
  try {
    const pair = `${symbol}USDT`;
    const response = await fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${pair}&period=1d&limit=7`);
    
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data)) return null;

    return data.map((item: any) => {
        const date = new Date(item.timestamp);
        return {
            time: `${date.getMonth() + 1}/${date.getDate()}`,
            long: parseFloat((parseFloat(item.longAccount) * 100).toFixed(1)),
            short: parseFloat((parseFloat(item.shortAccount) * 100).toFixed(1))
        };
    });
  } catch (error) {
    console.warn(`Binance L/S Error for ${symbol}:`, error);
    return null;
  }
}

// --- MAIN ANALYSIS FUNCTION WITH IQ ADK ---

export const analyzeCoin = async (coinName: string): Promise<CryptoData> => {
  // 1. Identify the coin
  const coinInfo = await searchCoinGecko(coinName);
  
  // Prepare Real Data Variables
  let realPriceData: { history: PricePoint[], currentPrice: number } | null = null;
  let realSentiment = 50;
  let realLongShort: LongShortData[] | null = null;
  let identifiedName = coinName;
  let identifiedSymbol = "";

  if (coinInfo) {
    identifiedName = coinInfo.name;
    identifiedSymbol = coinInfo.symbol;
    
    // 2. Parallel Fetching of Real Data
    const [priceResult, sentimentResult, lsResult] = await Promise.all([
      getPriceAction(coinInfo.id),
      getSentiment(),
      getLongShortRatio(coinInfo.symbol)
    ]);

    realPriceData = priceResult;
    realSentiment = sentimentResult;
    realLongShort = lsResult;
  }

  // 3. Construct System Instruction with Real Data
  const systemInstruction = `
    You are a Crypto Data Aggregator. 
    I have fetched REAL-TIME data from external APIs. 
    Your job is to structure this data into the required JSON format and generating the missing pieces (Tokenomics, Project Score) based on your knowledge of the project.

    REAL DATA PROVIDED:
    - Coin Name: ${identifiedName} (${identifiedSymbol})
    - Current Price: ${realPriceData ? `$${realPriceData.currentPrice}` : "Unknown, please estimate"}
    - Price History (7D): ${realPriceData ? JSON.stringify(realPriceData.history) : "Unavailable, please generate realistic data"}
    - Market Sentiment (Fear & Greed): ${realSentiment}
    - Long/Short Ratio (Binance): ${realLongShort ? JSON.stringify(realLongShort) : "Unavailable, please generate realistic 50/50ish data"}

    INSTRUCTIONS:
    1. **Use the REAL DATA provided above exactly.** Do not change the price history numbers or sentiment score if provided.
    2. **Generate 'tokenomics'**: Create a realistic distribution for ${identifiedName} (e.g., if BTC, mostly Retail/Miners; if SOL, more Team/Insiders).
    3. **Generate 'projectScores'**: Rate ${identifiedName} on Security, Decentralization, Scalability, Ecosystem, Tokenomics (0-100).
    4. **Generate 'summary'**: Write a 2-sentence analysis referencing the specific price trend and sentiment provided.
  `;

  try {
    // Use IQ ADK with structured output
    const builder = AgentBuilder
      .create("crypto_data_aggregator")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction)
      .withRunConfig({
        temperature: 0.2, // Low temperature to stick to facts
        timeout: 30000
      });

    // @ts-ignore - buildWithSchema exists but type definition might be incomplete
    const { runner } = await builder.buildWithSchema(cryptoZodSchema);

    const result = await runner.ask(`Generate the full JSON dashboard data for ${identifiedName}.`);
    
    // ADK returns JSON string wrapped in code blocks, need to parse
    if (typeof result === 'string') {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as CryptoData;
      }
      // Try parsing directly if no code blocks
      return JSON.parse(result) as CryptoData;
    }
    
    return result as CryptoData;
  } catch (error) {
    console.error("AI Generation Error (ADK):", error);
    throw error;
  }
};

// --- TRANSACTION PREVIEW WITH IQ ADK ---

export const createTransactionPreview = async (userText: string): Promise<TransactionData> => {
  const systemInstruction = `
    You are a Web3 Transaction Agent. Your job is to extract transaction details from the user's natural language request.
    
    Rules:
    1. Detect intent: SEND (transfer tokens), SWAP (trade tokens), BUY, SELL.
    2. Extract 'token' (default to ETH if unclear but implied), 'amount'.
    3. For 'toAddress':
       - If user provides a 0x address, use it.
       - If SWAP/BUY/SELL, use the Uniswap V2 Router address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'.
       - If SEND and no address provided, use a placeholder '0x0000...0000' but mention in summary user needs to verify.
    4. Network: Assume 'Ethereum Mainnet' or 'Sepolia Testnet' based on context, default to 'Ethereum Mainnet'.
    5. Estimated Gas: Estimate standard ETH gas (e.g., 0.002 ETH).
    
    Example: "Swap 1 ETH for USDT" -> Type: SWAP, Token: ETH, Amount: 1, To: RouterAddress.
    Example: "Send 0.5 ETH to 0x123..." -> Type: SEND, Token: ETH, Amount: 0.5, To: 0x123...
  `;

  try {
    const builder = AgentBuilder
      .create("web3_transaction_agent")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction);

    // @ts-ignore - buildWithSchema exists but type definition might be incomplete
    const { runner } = await builder.buildWithSchema(transactionZodSchema);

    const result = await runner.ask(`Parse this transaction request: "${userText}"`);
    
    // Parse JSON string
    if (typeof result === 'string') {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as TransactionData;
      }
      return JSON.parse(result) as TransactionData;
    }
    
    return result as TransactionData;
  } catch (error) {
    console.error("Transaction Parse Error (ADK):", error);
    throw error;
  }
};

// --- MARKET REPORT WITH IQ ADK ---

export const generateMarketReport = async (data: CryptoData): Promise<string> => {
  try {
    const dataString = JSON.stringify(data, null, 2);
    
    const systemInstruction = `
      Act as a senior cryptocurrency market analyst.
      Write a "Deep Dive Analysis" based on the provided dataset.
      
      Structure:
      - **Market Sentiment & Price Action**: specific comments on the chart and fear/greed index.
      - **On-Chain & Derivatives**: comments on Long/Short ratio.
      - **Fundamental Health**: comments on project scores and tokenomics.
      - **Verdict**: Bullish, Bearish, or Neutral?
    `;

    const { runner } = await AgentBuilder
      .create("market_analyst")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction)
      .build();

    const response = await runner.ask(`Write a Deep Dive Analysis for ${data.coinName} based on this dataset:\n${dataString}`);
    
    return response || "Analysis generation failed.";
  } catch (error) {
    console.error("Error generating report (ADK):", error);
    return "Unable to generate market report.";
  }
};

// --- INTENT DETECTION WITH IQ ADK ---

export const determineIntent = async (userMessage: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string }> => {
  const intentSchema = z.object({
    type: z.enum(['ANALYZE', 'CHAT', 'PORTFOLIO_ANALYSIS', 'TRANSACTION']),
    coinName: z.string().optional()
  });

  const systemInstruction = `
    Classify user intent into one of these categories:
    1. New coin analysis (e.g. "Analyze BTC", "How is Solana doing") -> {"type": "ANALYZE", "coinName": "CorrectedName"}
    2. Portfolio analysis (e.g. "Check my wallet", "My portfolio") -> {"type": "PORTFOLIO_ANALYSIS"}
    3. Transaction Request (e.g. "Send 1 ETH", "Swap ETH for USDT", "Buy BTC") -> {"type": "TRANSACTION"}
    4. General chat -> {"type": "CHAT"}
  `;

  try {
    const builder = AgentBuilder
      .create("intent_classifier")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction);

    // @ts-ignore - buildWithSchema exists but type definition might be incomplete
    const { runner } = await builder.buildWithSchema(intentSchema);

    const result = await runner.ask(`Classify intent: "${userMessage}"`);
    
    // Parse JSON string
    if (typeof result === 'string') {
      const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]) as { type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string };
      }
      return JSON.parse(result) as { type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string };
    }
    
    return result as { type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string };
  } catch (error) {
    console.error("Intent Detection Error (ADK):", error);
    return { type: 'CHAT' };
  }
};

// --- CHAT WITH IQ ADK (Session-based conversation) ---

export const chatWithModel = async (
  userMessage: string, 
  history: ChatMessage[], 
  contextData?: CryptoData
): Promise<string> => {
  try {
    let systemInstruction = "You are CryptoInsight AI. You have access to real-time crypto tools.";
    if (contextData) {
      systemInstruction += `\nCURRENT CONTEXT: User is viewing dashboard for ${contextData.coinName}.\nData: ${JSON.stringify(contextData)}`;
    }

    // Create session ID from history length to maintain conversation
    const sessionId = `chat-session-${Date.now()}`;

    const { runner } = await AgentBuilder
      .create("cryptoinsight_chat")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction)
      .build();

    // For conversation history, we'd need to replay messages
    // For simplicity in this implementation, we'll use the current message with context
    const contextualMessage = history.length > 1 
      ? `Previous context: ${history.slice(-3).map(h => `${h.role}: ${h.text}`).join('\n')}\n\nCurrent message: ${userMessage}`
      : userMessage;

    const response = await runner.ask(contextualMessage);
    
    return response;
  } catch (error) {
    console.error("Chat Error (ADK):", error);
    return "I'm having trouble connecting to the chat service.";
  }
};

// --- PORTFOLIO REAL-TIME UPDATE (No change needed, pure API call) ---

export const updatePortfolioRealTime = async (portfolio: PortfolioItem[]): Promise<PortfolioItem[]> => {
  try {
    const ids = portfolio.map(item => COIN_ID_MAP[item.symbol] || item.name.toLowerCase()).join(',');
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    const prices = await response.json();

    return portfolio.map(item => {
      const id = COIN_ID_MAP[item.symbol] || item.name.toLowerCase();
      const newPrice = prices[id]?.usd;
      
      if (newPrice) {
        return { ...item, currentPrice: newPrice };
      }
      return item;
    });
  } catch (error) {
    console.error("Error fetching portfolio prices:", error);
    return portfolio;
  }
};

// --- PORTFOLIO ANALYSIS WITH IQ ADK ---

export const analyzePortfolio = async (portfolio: PortfolioItem[]): Promise<string> => {
  const systemInstruction = `
    You are a crypto portfolio analyst.
    Analyze the provided portfolio data and provide:
    1. Total Value Breakdown.
    2. Performance Check (Comparing Avg Price vs Current Price).
    3. Risk Assessment (Diversification).
    4. Suggestion for rebalancing.
  `;

  try {
    const { runner } = await AgentBuilder
      .create("portfolio_analyst")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction)
      .build();

    const response = await runner.ask(`Analyze this crypto portfolio: ${JSON.stringify(portfolio)}`);
    
    return response || "Unable to analyze portfolio.";
  } catch (error) {
    console.error("Portfolio Analysis Error (ADK):", error);
    return "Error analyzing portfolio.";
  }
};
