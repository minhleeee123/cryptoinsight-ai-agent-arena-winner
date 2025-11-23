import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CryptoData, ChatMessage, PortfolioItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the strictly typed schema for the model output
const cryptoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coinName: { type: Type.STRING, description: "Name of the cryptocurrency (e.g., Bitcoin)" },
    currentPrice: { type: Type.NUMBER, description: "Current price in USD" },
    summary: { type: Type.STRING, description: "A brief analytical summary of the coin's current status (max 2 sentences)." },
    priceHistory: {
      type: Type.ARRAY,
      description: "Array of price points for the last 7 days or relevant period.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Date or Time label (e.g. 'Mon', 'Tue')" },
          price: { type: Type.NUMBER, description: "Price at that time" }
        },
        required: ["time", "price"]
      }
    },
    tokenomics: {
      type: Type.ARRAY,
      description: "Distribution of token supply.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Holder category (e.g., Whales, Team, Retail, Advisors)" },
          value: { type: Type.NUMBER, description: "Percentage held (0-100)" }
        },
        required: ["name", "value"]
      }
    },
    sentimentScore: { type: Type.NUMBER, description: "Fear & Greed Index score from 0 to 100." },
    longShortRatio: {
      type: Type.ARRAY,
      description: "Long vs Short ratio over recent timeframe.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Time label" },
          long: { type: Type.NUMBER, description: "Percentage of longs" },
          short: { type: Type.NUMBER, description: "Percentage of shorts" }
        },
        required: ["time", "long", "short"]
      }
    },
    projectScores: {
      type: Type.ARRAY,
      description: "Scores for Radar Chart on 5 criteria.",
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING, description: "Criteria name: Security, Decentralization, Scalability, Ecosystem, Tokenomics" },
          A: { type: Type.NUMBER, description: "Score obtained (0-100)" },
          fullMark: { type: Type.NUMBER, description: "Max score, usually 100" }
        },
        required: ["subject", "A", "fullMark"]
      }
    }
  },
  required: ["coinName", "currentPrice", "summary", "priceHistory", "tokenomics", "sentimentScore", "longShortRatio", "projectScores"]
};

// Helper function to fetch real price
async function getRealPrice(query: string): Promise<{ price: number; symbol: string; name: string } | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(`https://api.coincap.io/v2/assets?search=${encodeURIComponent(query)}&limit=1`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const asset = data.data[0];
      return {
        price: parseFloat(asset.priceUsd),
        symbol: asset.symbol,
        name: asset.name
      };
    }
    return null;
  } catch (e) {
    console.warn("Failed to fetch real price:", e);
    return null;
  }
}

export const analyzeCoin = async (coinName: string): Promise<CryptoData> => {
  try {
    // Attempt to get real price first
    const realData = await getRealPrice(coinName);
    
    let promptContext = "";
    if (realData) {
      promptContext = `IMPORTANT: Real-time market data for ${realData.name} (${realData.symbol}) is available. 
      Current Price: $${realData.price}. 
      You MUST set the 'currentPrice' field to exactly ${realData.price}.
      Ensure the last data point in 'priceHistory' is close to or exactly ${realData.price} to maintain continuity.`;
    } else {
      promptContext = "Real-time price unavailable. Estimate the current price based on your latest knowledge.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the cryptocurrency '${coinName}'. 
      ${promptContext}
      
      1. If specific internal data is not available, you MUST generate plausible, realistic synthetic data based on historical trends and the typical behavior of this coin type. 
      2. The structure MUST match the JSON schema provided.
      3. Ensure 'projectScores' includes exactly these 5 subjects: Security, Decentralization, Scalability, Ecosystem, Tokenomics.
      4. Ensure 'tokenomics' adds up to roughly 100%.
      5. Ensure 'longShortRatio' items add up to 100 (long + short = 100).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: cryptoSchema,
        temperature: 0.4, 
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as CryptoData;
      return data;
    } else {
      throw new Error("No data returned from Gemini");
    }
  } catch (error) {
    console.error("Error fetching coin data:", error);
    throw error;
  }
};

export const generateMarketReport = async (data: CryptoData): Promise<string> => {
  try {
    // We feed the structured data back to the model to generate a text report
    const dataString = JSON.stringify(data, null, 2);
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Act as a senior cryptocurrency market analyst. 
      
      I will provide you with a dataset for the coin '${data.coinName}'. 
      This data corresponds to the charts currently displayed to the user:
      1. Price Action (7D)
      2. Tokenomics (Distribution)
      3. Market Sentiment (Gauge)
      4. Long/Short Ratio
      5. Project Score (Radar)
      
      Your task is to "read" these metrics and write a professional "Deep Dive Analysis".
      
      Dataset:
      ${dataString}
      
      Guidelines:
      - Explicitly reference the specific charts/metrics in your analysis (e.g., "Looking at the Tokenomics distribution...", "The Sentiment gauge is currently showing...").
      - Use bolding for key insights.
      - Structure: "Market Sentiment", "On-Chain Data", "Project Health", "Verdict".
      - Keep it professional and insightful.
      `,
    });

    return response.text || "Analysis generation failed.";
  } catch (error) {
    console.error("Error generating market report:", error);
    return "Unable to generate market report at this time.";
  }
};

// --- NEW FUNCTIONS FOR CONTEXT AWARENESS ---

export const determineIntent = async (userMessage: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS'; coinName?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Classify the user's intent based on this message: "${userMessage}".
        
        1. If the user is asking to analyze a specific NEW cryptocurrency (e.g., "Analyze BTC", "Price of Solana", "ETH", "Show me Dogecoin", "how is btc doing"), return JSON: {"type": "ANALYZE", "coinName": "CorrectedCoinName"}.
        2. If the user is asking to analyze their own portfolio/holdings (e.g., "Analyze my portfolio", "How is my portfolio doing?", "Check my wallet performance", "Review my holdings"), return JSON: {"type": "PORTFOLIO_ANALYSIS"}.
        3. If the user is asking a follow-up question, general chat, or referring to previous context (e.g., "What is the sentiment?", "Tell me more", "Why is it down?", "Is it a good buy?"), return JSON: {"type": "CHAT"}.
        
        Output valid JSON only.
      `,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });
    
    if (response.text) {
        return JSON.parse(response.text);
    }
    return { type: 'CHAT' };
  } catch (e) {
    console.error("Intent detection failed", e);
    // Fallback simple checks
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes('portfolio') || lowerMsg.includes('holdings') || lowerMsg.includes('my wallet')) {
       return { type: 'PORTFOLIO_ANALYSIS' };
    }
    if (userMessage.length < 10 && /^[a-zA-Z0-9 ]+$/.test(userMessage)) {
       return { type: 'ANALYZE', coinName: userMessage };
    }
    return { type: 'CHAT' };
  }
}

export const chatWithModel = async (
  userMessage: string, 
  history: ChatMessage[], 
  contextData?: CryptoData
): Promise<string> => {
  try {
    // Filter and map history for the model
    const historyContent = history
      .filter(msg => msg.id !== 'welcome') // Skip generic welcome
      .map(msg => {
        let text = msg.text || "";
        // If a message had data, include a summary of it in the history so the model knows what was shown
        if (msg.data) {
          text += `\n[System: User viewed dashboard for ${msg.data.coinName}. Price: $${msg.data.currentPrice}. Sentiment: ${msg.data.sentimentScore}]`;
        }
        return {
          role: msg.role,
          parts: [{ text }]
        };
      });

    let systemInstruction = "You are CryptoInsight AI, a helpful and professional cryptocurrency assistant.";
    
    // Inject the current context data heavily into the system prompt
    if (contextData) {
      systemInstruction += `\n\nCURRENT DASHBOARD CONTEXT:\nThe user is currently looking at a dashboard for ${contextData.coinName}.
      Here is the live data displayed on their screen:
      ${JSON.stringify(contextData)}
      
      Answer any follow-up questions (like "what is the sentiment?", "explain the tokenomics") using THIS specific data.`;
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: historyContent,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "I'm having trouble connecting to the chat service right now.";
  }
};

export const analyzePortfolio = async (portfolio: PortfolioItem[]): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Act as a professional Wealth Manager and Portfolio Analyst.
        
        Here is the user's current cryptocurrency portfolio:
        ${JSON.stringify(portfolio, null, 2)}
        
        Please provide a comprehensive analysis of this portfolio using Markdown formatting. 
        Include:
        1. **Portfolio Composition**: A breakdown of the assets.
        2. **Risk Assessment**: Is it too concentrated? Too risky? (e.g. Memecoins vs Blue chips).
        3. **Performance Check**: Analyze the PNL (Profit and Loss) based on avgPrice vs currentPrice.
        4. **Actionable Advice**: Suggest rebalancing, diversification, or holding strategies.
        
        Keep the tone professional, encouraging, but realistic about crypto risks.
      `,
    });
    return response.text || "Unable to analyze portfolio at this moment.";
  } catch (error) {
    console.error("Portfolio analysis error:", error);
    return "I encountered an error while analyzing your portfolio data.";
  }
}
