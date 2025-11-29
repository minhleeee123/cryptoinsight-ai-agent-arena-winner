// Vision Agent with IQ ADK
import { AgentBuilder } from '@iqai/adk';
import { getCallbacks } from '../utils/callbacks.js';

export async function analyzeChartImage(base64Image: string, promptText: string): Promise<string> {
  const callbacks = getCallbacks();
  const builder = AgentBuilder
    .create("vision_analyzer")
    .withModel("gemini-2.5-flash")
    .withInstruction(`
You are a technical analysis expert. Analyze chart images with drawn indicators.
Identify:
- Support/Resistance levels
- Candlestick patterns
- Trend lines
- Potential breakout zones
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
