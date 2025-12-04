// Chat Agent with IQ ADK
import { AgentBuilder, InMemorySessionService } from '@iqai/adk';
import { z } from 'zod';
import { CryptoData } from '../types.js';
import { getCallbacks } from '../utils/callbacks.js';

// Create global session service for memory persistence
const sessionService = new InMemorySessionService();

// Simple conversation history per user (workaround for IQ ADK session issues)
const conversationHistory = new Map<string, Array<{role: 'user'|'assistant', content: string}>>();

function addToHistory(userId: string, role: 'user'|'assistant', content: string) {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  const history = conversationHistory.get(userId)!;
  history.push({ role, content });
  
  // Keep only last 10 messages
  if (history.length > 10) {
    history.shift();
    history.shift(); // Remove 2 (1 user + 1 assistant)
  }
}

function getHistoryContext(userId: string): string {
  const history = conversationHistory.get(userId);
  if (!history || history.length === 0) return '';
  
  return '\n\nPREVIOUS CONVERSATION:\n' + history.map(msg => 
    `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n') + '\n---\n';
}

const intentSchema = z.object({
  type: z.enum(['ANALYZE', 'CHAT', 'PORTFOLIO_ANALYSIS', 'TRANSACTION']),
  coinName: z.string().optional()
});

export async function determineIntent(userMessage: string, userId: string = 'default'): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string }> {
  const callbacks = getCallbacks();
  
  const builder = AgentBuilder
    .create("intent_classifier")
    .withModel("gemini-2.5-flash")
    .withInstruction(`
Classify user intent:
1. New coin analysis (e.g. "Analyze BTC", "How is Solana doing") -> {"type": "ANALYZE", "coinName": "CorrectedName"}
2. Portfolio analysis (e.g. "Check my wallet", "My portfolio") -> {"type": "PORTFOLIO_ANALYSIS"}
3. Web3 Transaction (e.g. "Send 1 ETH", "Swap ETH for USDT") -> {"type": "TRANSACTION"}
4. General chat -> {"type": "CHAT"}
    `)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  try {
    // @ts-ignore
    const { runner } = await builder.buildWithSchema(intentSchema);
    const response = await runner.ask(`Classify: "${userMessage}"`);
    
    // Parse result (could be string or object)
    let parsedResult: any;
    if (typeof response === 'string') {
      // Check if response is an error message
      if (response.startsWith('Error:') || response.includes('quota') || response.includes('exceeded')) {
        console.warn('Intent classification failed due to quota, defaulting to CHAT');
        return { type: 'CHAT' };
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
    return parsedResult;
  } catch (error: any) {
    console.warn('Intent classification error:', error.message);
    return { type: 'CHAT' };
  }
}

export async function chatWithModel(userMessage: string, userId: string = 'default', contextData?: CryptoData): Promise<string> {
  // Add conversation history context
  const historyContext = getHistoryContext(userId);
  
  let systemInstruction = "You are CryptoInsight AI. You have access to real-time crypto tools.";
  
  if (contextData) {
    systemInstruction += `\n\nCURRENT CONTEXT: User is viewing dashboard for ${contextData.coinName}.\nData: ${JSON.stringify(contextData)}`;
  }
  
  // Add history to instruction so AI remembers
  if (historyContext) {
    systemInstruction += historyContext;
  }

  const callbacks = getCallbacks();
  
  const builder = AgentBuilder
    .create("chat_assistant")
    .withModel("gemini-2.5-flash")
    .withInstruction(systemInstruction)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  try {
    const { runner } = await builder.build();
    
    // Store user message in history
    addToHistory(userId, 'user', userMessage);
    
    const response = await runner.ask(userMessage);
    const finalResponse = response || "I'm having trouble connecting to the chat service.";
    
    // Store assistant response in history
    addToHistory(userId, 'assistant', finalResponse);
    
    return finalResponse;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the chat service.";
  }
}
