// Portfolio Agent with IQ ADK
import { AgentBuilder } from '@iqai/adk';
import { z } from 'zod';
import { PortfolioAnalysisResult, PortfolioItem } from '../types.js';
import { updatePortfolioRealTime } from '../dataFetcher.js';
import { getCallbacks } from '../utils/callbacks.js';

const portfolioSchema = z.object({
  totalValue: z.number(),
  positions: z.array(z.object({
    asset: z.string(),
    amount: z.number(),
    avgPrice: z.number(),
    currentPrice: z.number(),
    currentValue: z.number(),
    pnlPercent: z.number(),
    allocation: z.number()
  })),
  riskAnalysis: z.string(),
  rebalancingSuggestions: z.array(z.string())
});

export async function analyzePortfolio(portfolio: PortfolioItem[]): Promise<PortfolioAnalysisResult> {
  const systemInstruction = `
You are a crypto portfolio analyst.
You MUST respond with ONLY valid JSON matching this exact structure:
{
  "totalValue": number,
  "positions": [
    {
      "asset": "string",
      "amount": number,
      "avgPrice": number,
      "currentPrice": number,
      "currentValue": number,
      "pnlPercent": number,
      "allocation": number
    }
  ],
  "riskAnalysis": "string paragraph",
  "rebalancingSuggestions": ["string", "string"]
}

CRITICAL: You MUST include ALL ${portfolio.length} positions from the input portfolio. Do NOT skip any asset.

Calculate accurately for EACH position:
- currentValue = amount * currentPrice
- pnlPercent = ((currentPrice - avgPrice) / avgPrice) * 100
- allocation = (currentValue / totalValue) * 100
- totalValue = sum of all currentValue

NO explanatory text outside JSON. ONLY the JSON object.
  `;

  const callbacks = getCallbacks();
  const builder = AgentBuilder
    .create("portfolio_analyzer")
    .withModel("gemini-2.5-flash")
    .withInstruction(systemInstruction)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  try {
    // @ts-ignore
    const { runner } = await builder.buildWithSchema(portfolioSchema);
    
    // Create explicit prompt listing all assets
    const assetList = portfolio.map(p => p.symbol).join(', ');
    const prompt = `Analyze ALL ${portfolio.length} assets in this portfolio: ${assetList}

Portfolio data: ${JSON.stringify(portfolio)}

Generate complete JSON with ALL ${portfolio.length} positions included.`;
    
    const response = await runner.ask(prompt);
    
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
    return parsedResult as PortfolioAnalysisResult;
  } catch (error: any) {
    console.error("Portfolio Agent Error:", error);
    
    // Handle quota errors specifically
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('API quota exceeded. Please wait 16 seconds and try again, or use a different API key.');
    }
    
    throw error;
  }
}

export async function updatePortfolio(portfolio: PortfolioItem[]): Promise<PortfolioItem[]> {
  return await updatePortfolioRealTime(portfolio);
}
