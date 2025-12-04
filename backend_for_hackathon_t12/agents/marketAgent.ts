// Market Agent with IQ ADK (Simplified - no tools)
import { AgentBuilder } from '@iqai/adk';
import { z } from 'zod';
import { CryptoData } from '../types.js';
import {
  searchCoinGecko,
  getPriceAction,
  getSentiment,
  getLongShortRatio
} from '../dataFetcher.js';
import { getCallbacks } from '../utils/callbacks.js';

const cryptoDataSchema = z.object({
  coinName: z.string(),
  symbol: z.string(),
  currentPrice: z.number(),
  summary: z.string(),
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

// Simplified - fetch data first, then pass to AI (no tools)

export async function analyzeCoin(coinName: string): Promise<CryptoData> {
  // 1. Fetch data first
  const coinInfo = await searchCoinGecko(coinName);
  
  let realPriceData: { history: any[], currentPrice: number } | null = null;
  let realSentiment = 50;
  let realLongShort: any[] | null = null;
  let identifiedName = coinName;
  let identifiedSymbol = "BTC";

  if (coinInfo) {
    identifiedName = coinInfo.name;
    identifiedSymbol = coinInfo.symbol;
    
    const [priceResult, sentimentResult, lsResult] = await Promise.all([
      getPriceAction(coinInfo.id),
      getSentiment(),
      getLongShortRatio(coinInfo.symbol)
    ]);

    realPriceData = priceResult;
    realSentiment = sentimentResult;
    realLongShort = lsResult;
    
    console.log(`[Market Agent] Fetched data for ${identifiedName}:`);
    console.log(`  - Price: $${realPriceData?.currentPrice || 'N/A'}`);
    console.log(`  - Sentiment: ${realSentiment}`);
    console.log(`  - L/S Data: ${realLongShort ? realLongShort.length + ' points' : 'N/A'}`);
  }

  // 2. Build system prompt with real data
  const systemPrompt = `
    You are a Crypto Data Aggregator. 
    I have fetched REAL-TIME data from external APIs. 
    Your job is to structure this data into the required JSON format and generating the missing pieces (Tokenomics, Project Score) based on your knowledge of the project.

    CRITICAL REAL DATA - DO NOT MODIFY THESE VALUES:
    - Coin Name: ${identifiedName}
    - Symbol: ${identifiedSymbol}
    - Current Price: ${realPriceData ? `$${realPriceData.currentPrice}` : "Unknown, please estimate"}
    - Price History (7D): ${realPriceData ? JSON.stringify(realPriceData.history) : "Unavailable, please generate realistic data"}
    - sentimentScore MUST BE EXACTLY: ${realSentiment}
    - Long/Short Ratio (Binance): ${realLongShort ? JSON.stringify(realLongShort) : "Unavailable, please generate realistic 50/50ish data"}

    INSTRUCTIONS:
    1. **CRITICAL**: In your JSON output, set "sentimentScore": ${realSentiment} EXACTLY. Do NOT use any other number.
    2. **CRITICAL**: Copy the priceHistory array EXACTLY as provided: ${realPriceData ? JSON.stringify(realPriceData.history) : '[]'}
    3. **CRITICAL**: Set "currentPrice": ${realPriceData?.currentPrice || 0} EXACTLY.
    4. **Generate 'tokenomics'**: MUST be array of objects like [{"name": "Retail Holders", "value": 45}, {"name": "Team/Insiders", "value": 20}, {"name": "Miners/Validators", "value": 35}]. Create realistic distribution for ${identifiedName}.
    5. **Generate 'projectScores'**: MUST be array with exactly 5 items rating ${identifiedName} on Security, Decentralization, Scalability, Ecosystem, Tokenomics. Format: [{"subject": "Security", "A": 85, "fullMark": 100}, ...].
    6. **Copy 'longShortRatio'**: ${realLongShort ? 'Use this exact array: ' + JSON.stringify(realLongShort) : 'Generate realistic 50/50ish data'}
    7. **Generate 'summary'**: Write a 2-sentence analysis referencing the sentiment score of ${realSentiment} and price trend.
  `;

  // 3. Create agent with callbacks
  const callbacks = getCallbacks();
  
  const builder = AgentBuilder
    .create("market_analyzer")
    .withModel("gemini-2.5-flash")
    .withInstruction(systemPrompt)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  // @ts-ignore
  const { runner } = await builder.buildWithSchema(cryptoDataSchema);
  const response = await runner.ask(`Generate complete JSON for ${identifiedName}.`);
  
  // Parse result (could be string or object)
  let parsedResult: any;
  if (typeof response === 'string') {
    // Check if response is an error message
    if (response.startsWith('Error:') || response.includes('quota') || response.includes('exceeded')) {
      throw new Error('API quota exceeded. Please wait and try again later.');
    }
    
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[1]);
    } else {
      parsedResult = JSON.parse(response);
    }
  } else {
    parsedResult = response;
  }
  return parsedResult as CryptoData;
}

export async function generateMarketReport(data: CryptoData): Promise<string> {
  const callbacks = getCallbacks();
  
  const builder = AgentBuilder
    .create("market_reporter")
    .withModel("gemini-2.5-flash")
    .withInstruction(`
You are a senior cryptocurrency market analyst.
Write a "Deep Dive Analysis" based on provided data.

Structure:
- **Market Sentiment & Price Action**: specific comments on chart and Fear & Greed
- **On-Chain & Derivatives**: comments on Long/Short ratio
- **Fundamental Health**: comments on project scores and tokenomics
- **Verdict**: Bullish, Bearish, or Neutral?
    `)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  const { runner } = await builder.build();
  const response = await runner.ask(`Generate market report for ${data.coinName}:\n${JSON.stringify(data, null, 2)}`);
  
  return response;
}
