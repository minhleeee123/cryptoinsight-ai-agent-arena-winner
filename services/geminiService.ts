
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CryptoData, ChatMessage, PortfolioItem, PricePoint, LongShortData, TransactionData, BinanceOrder } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SCHEMA DEFINITIONS ---

const cryptoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coinName: { type: Type.STRING, description: "Name of the cryptocurrency" },
    symbol: { type: Type.STRING, description: "Ticker symbol (e.g. BTC, ETH)" },
    currentPrice: { type: Type.NUMBER, description: "Current price in USD" },
    summary: { type: Type.STRING, description: "A brief analytical summary based on the provided real data." },
    priceHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          price: { type: Type.NUMBER }
        }
      }
    },
    tokenomics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        }
      }
    },
    sentimentScore: { type: Type.NUMBER },
    longShortRatio: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          long: { type: Type.NUMBER },
          short: { type: Type.NUMBER }
        }
      }
    },
    projectScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          A: { type: Type.NUMBER },
          fullMark: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["coinName", "symbol", "currentPrice", "summary", "priceHistory", "tokenomics", "sentimentScore", "longShortRatio", "projectScores"]
};

const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["SEND", "SWAP", "BUY", "SELL"] },
    token: { type: Type.STRING },
    amount: { type: Type.NUMBER },
    toAddress: { type: Type.STRING },
    network: { type: Type.STRING },
    estimatedGas: { type: Type.STRING },
    summary: { type: Type.STRING }
  },
  required: ["type", "token", "amount", "toAddress", "network", "estimatedGas", "summary"]
};

const binanceOrderSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    market: { type: Type.STRING, enum: ["SPOT", "FUTURES"] },
    symbol: { type: Type.STRING },
    side: { type: Type.STRING, enum: ["BUY", "SELL"] },
    type: { type: Type.STRING, enum: ["MARKET", "LIMIT"] },
    quantity: { type: Type.NUMBER },
    price: { type: Type.NUMBER },
    leverage: { type: Type.NUMBER },
    summary: { type: Type.STRING }
  },
  required: ["market", "symbol", "side", "type", "quantity", "summary"]
};

// --- REAL DATA FETCHING FUNCTIONS ---

// Map common symbols to CoinGecko IDs for portfolio fetching
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
      // Prioritize exact matches or top rank
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
    // Fetch 7 days of data
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=7&interval=daily`);
    const data = await response.json();
    
    if (!data.prices || data.prices.length === 0) return null;

    const history: PricePoint[] = data.prices.map((p: [number, number]) => {
      const date = new Date(p[0]);
      return {
        time: `${date.getMonth() + 1}/${date.getDate()}`, // Format: MM/DD
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
    // Alternative.me provides global crypto sentiment (Fear & Greed Index)
    const response = await fetch('https://api.alternative.me/fng/?limit=1');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      return parseInt(data.data[0].value, 10);
    }
    return 50; // Fallback
  } catch (error) {
    console.error("Sentiment Error:", error);
    return 50;
  }
}

async function getLongShortRatio(symbol: string): Promise<LongShortData[] | null> {
  try {
    // Binance API requires symbols like BTCUSDT
    const pair = `${symbol}USDT`;
    const response = await fetch(`https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol=${pair}&period=1d&limit=7`);
    
    if (!response.ok) return null; // Handle 404 if coin not on Binance Futures

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
    return null; // Return null to let AI generate fallback or handle gracefully
  }
}

// --- MAIN ANALYSIS FUNCTION ---

export const analyzeCoin = async (coinName: string): Promise<CryptoData> => {
  // 1. Identify the coin
  const coinInfo = await searchCoinGecko(coinName);
  
  // Prepare Real Data Variables
  let realPriceData: { history: PricePoint[], currentPrice: number } | null = null;
  let realSentiment = 50;
  let realLongShort: LongShortData[] | null = null;
  let identifiedName = coinName;
  let identifiedSymbol = "BTC"; // Default fallback

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

  // 3. Construct Prompt with Real Data
  const systemPrompt = `
    You are a Crypto Data Aggregator. 
    I have fetched REAL-TIME data from external APIs. 
    Your job is to structure this data into the required JSON format and generating the missing pieces (Tokenomics, Project Score) based on your knowledge of the project.

    REAL DATA PROVIDED:
    - Coin Name: ${identifiedName}
    - Symbol: ${identifiedSymbol}
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate the full JSON dashboard data for ${identifiedName} (${identifiedSymbol}).`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: cryptoSchema,
        temperature: 0.2, // Low temperature to stick to facts
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CryptoData;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const createTransactionPreview = async (userText: string): Promise<TransactionData> => {
    const systemPrompt = `
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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse this transaction request: "${userText}"`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: transactionSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TransactionData;
        }
        throw new Error("Failed to parse transaction");
    } catch (error) {
        console.error("Transaction Parse Error", error);
        throw error;
    }
}

export const createBinanceOrderPreview = async (userText: string): Promise<BinanceOrder> => {
    const systemPrompt = `
      You are a Binance Trading Agent. Your job is to extract trading details from the user's natural language request.
      
      Rules:
      1. Detect Market: 'FUTURES' if "short", "long", "leverage", "perp" mentioned, otherwise 'SPOT'.
      2. Symbol: Convert to Binance Pair (e.g. BTC -> BTCUSDT, ETH -> ETHUSDT).
      3. Type: 'LIMIT' if price specified (e.g. "at 50000"), else 'MARKET'.
      4. Side: 'BUY' (Long/Buy), 'SELL' (Short/Sell).
      5. Quantity: Extract amount.
      6. Leverage: Extract if present (e.g. "20x"), default to 1 for SPOT, 20 for FUTURES if unspecified but implied high risk.
      
      Example: "Long BTC 20x with 0.5 BTC" -> Market: FUTURES, Symbol: BTCUSDT, Side: BUY, Quantity: 0.5, Leverage: 20.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse this order: "${userText}"`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: binanceOrderSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as BinanceOrder;
        }
        throw new Error("Failed to parse order");
    } catch (error) {
        console.error("Binance Parse Error", error);
        throw error;
    }
}

export async function generateMarketReport(data: CryptoData): Promise<string> {
  try {
    const dataString = JSON.stringify(data, null, 2);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Act as a senior cryptocurrency market analyst.
      Write a "Deep Dive Analysis" for ${data.coinName} based on this dataset:
      ${dataString}
      
      Structure:
      - **Market Sentiment & Price Action**: specific comments on the chart and fear/greed index.
      - **On-Chain & Derivatives**: comments on Long/Short ratio.
      - **Fundamental Health**: comments on project scores and tokenomics.
      - **Verdict**: Bullish, Bearish, or Neutral?
      `,
    });
    return response.text || "Unable to generate market report.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Unable to generate market report.";
  }
}

export const determineIntent = async (userMessage: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION' | 'BINANCE_ORDER'; coinName?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify intent: "${userMessage}".
      1. New coin analysis (e.g. "Analyze BTC", "How is Solana doing") -> {"type": "ANALYZE", "coinName": "CorrectedName"}
      2. Portfolio analysis (e.g. "Check my wallet", "My portfolio") -> {"type": "PORTFOLIO_ANALYSIS"}
      3. Web3 Transaction (e.g. "Send 1 ETH", "Swap ETH for USDT") -> {"type": "TRANSACTION"}
      4. Binance Trading (e.g. "Long BTC", "Buy BNB on Binance", "Short ETH") -> {"type": "BINANCE_ORDER"}
      5. General chat -> {"type": "CHAT"}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text ? JSON.parse(response.text) : { type: 'CHAT' };
  } catch {
    return { type: 'CHAT' };
  }
}

export const chatWithModel = async (
  userMessage: string, 
  history: ChatMessage[], 
  contextData?: CryptoData
): Promise<string> => {
  try {
    const historyContent = history
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text + (msg.data ? ` [System: User viewed data for ${msg.data.coinName}]` : "") }]
      }));

    let systemInstruction = "You are CryptoInsight AI. You have access to real-time crypto tools.";
    if (contextData) {
      systemInstruction += `\nCURRENT CONTEXT: User is viewing dashboard for ${contextData.coinName}.\nData: ${JSON.stringify(contextData)}`;
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: historyContent,
      config: { systemInstruction }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    return "I'm having trouble connecting to the chat service.";
  }
};

// Update portfolio with real-time prices from CoinGecko
export const updatePortfolioRealTime = async (portfolio: PortfolioItem[]): Promise<PortfolioItem[]> => {
  try {
    // 1. Get IDs for symbols
    const ids = portfolio.map(item => COIN_ID_MAP[item.symbol] || item.name.toLowerCase()).join(',');
    
    // 2. Fetch prices
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
    const prices = await response.json();

    // 3. Update portfolio items
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
    return portfolio; // Return original if fetch fails
  }
};

export async function analyzePortfolio(portfolio: PortfolioItem[]): Promise<string> {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this crypto portfolio based on the provided data: ${JSON.stringify(portfolio)}. 
      
      Provide:
      1. Total Value Breakdown.
      2. Performance Check (Comparing Avg Price vs Current Price).
      3. Risk Assessment (Diversification).
      4. Suggestion for rebalancing.`,
    });
    return response.text || "Error analyzing portfolio.";
  } catch {
    return "Error analyzing portfolio.";
  }
}

export async function analyzeChartImage(base64Image: string, promptText: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image.split(',')[1], // Remove "data:image/png;base64," prefix
                mimeType: "image/png"
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 2.5 Flash supports multimodal vision
            contents: {
                parts: [
                    imagePart,
                    { text: `The user has drawn indicators/lines on this chart. ${promptText}. Analyze the technical setup based on these visual cues.` }
                ]
            }
        });
        return response.text || "I encountered an error trying to see the chart. Please try again.";
    } catch (error) {
        console.error("Vision Analysis Error:", error);
        return "I encountered an error trying to see the chart. Please try again.";
    }
}
