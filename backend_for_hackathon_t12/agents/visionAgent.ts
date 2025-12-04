// Vision Agent with IQ ADK
import { AgentBuilder } from '@iqai/adk';
import { getCallbacks } from '../utils/callbacks.js';

export async function analyzeChartImage(base64Image: string, promptText: string): Promise<string> {
  const callbacks = getCallbacks();
  const builder = AgentBuilder
    .create("vision_analyzer")
    .withModel("gemini-2.5-flash")
    .withInstruction(`
You are a professional cryptocurrency technical analysis expert. 

CRITICAL INSTRUCTIONS:
1. **IDENTIFY THE COIN FIRST**: Look carefully at the chart to determine which cryptocurrency is being analyzed (Bitcoin, Ethereum, etc.) and note the current price shown.

2. **FOCUS ON KEY ELEMENTS**:
   - Current price level and recent price action
   - Support and resistance levels (especially any drawn by the user)
   - Candlestick patterns and what they suggest
   - Volume patterns if visible
   - Key breakout or breakdown zones

3. **RESPONSE FORMAT**: 
   - Keep your analysis concise and actionable
   - Start by stating: "Analyzing [COIN NAME] at $[CURRENT PRICE]"
   - Focus only on what's clearly visible in the chart
   - Do NOT mention trend lines unless they are drawn by the user

4. **TONE**: Professional but accessible, like a seasoned trader explaining to a colleague.

Example format:
"Analyzing Bitcoin at $86,291. The chart shows..."
    `)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  try {
    const { runner } = await builder.build();
    
    // Remove data:image/png;base64, prefix if present
    const imageData = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    // Build prompt with image inline part
    const prompt = `${promptText}\n\nAnalyze this chart with drawn indicators.\n\n[Image: data:image/png;base64,${imageData}]`;
    
    const response = await runner.ask(prompt);
    
    return response || "I encountered an error analyzing the chart.";
  } catch (error) {
    console.error("Vision Analysis Error:", error);
    return "I encountered an error analyzing the chart.";
  }
}
