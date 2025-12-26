// Transaction Agent with IQ ADK
import { AgentBuilder } from '@iqai/adk';
import { z } from 'zod';
import { TransactionData } from '../types.js';
import { getCallbacks } from '../utils/callbacks.js';

const transactionSchema = z.object({
  type: z.enum(["SEND", "SWAP"]),
  token: z.string().optional(),
  targetToken: z.string().optional(),
  amount: z.number().optional(),
  toAddress: z.string().optional(),
  network: z.string().optional(),
  summary: z.string()
});

export async function createTransactionPreview(userText: string): Promise<TransactionData> {
  const systemPrompt = `
      You are a Web3 Transaction Agent. Your job is to extract transaction details for SEND or SWAP operations.
      
      RULES:
      1. **Supported Types**: Only 'SEND' or 'SWAP'. Ignore 'BUY' or 'SELL'.
      2. **No Guessing**: If the user does not provide a piece of information (like address, amount, or network), return null for that field. **DO NOT** make up addresses or amounts.
      3. **Network Standardization**: You MUST normalize the network name to one of the following exact strings if detected:
         - "Ethereum Mainnet" (for ETH, Mainnet)
         - "Sepolia Testnet" (for Sepolia, Testnet)
         - "Binance Smart Chain" (for BSC, BNB Chain, Binance)
         - "Polygon" (for Matic, Polygon PoS)
         - "Avalanche C-Chain" (for Avax, Avalanche)
      4. **Extraction**:
         - 'token': The asset being sent or swapped from.
         - 'targetToken': The asset being received (only for SWAP).
         - 'amount': The numerical value.
         - 'toAddress': The recipient wallet address (only for SEND).
         - 'network': The blockchain network.
      
      Examples:
      - "Send ETH" -> { type: "SEND", token: "ETH", amount: null, toAddress: null, network: "Ethereum Mainnet" }
      - "Swap 1 BNB to USDT on BSC" -> { type: "SWAP", token: "BNB", targetToken: "USDT", amount: 1, network: "Binance Smart Chain" }
      - "Send 10 MATIC to 0x123... on Polygon" -> { type: "SEND", token: "MATIC", amount: 10, toAddress: "0x123...", network: "Polygon" }
    `;

  const callbacks = getCallbacks();
  const builder = AgentBuilder
    .create("transaction_parser")
    .withModel("gemini-2.5-flash")
    .withInstruction(systemPrompt)
    .withBeforeAgentCallback(callbacks.beforeAgentCallback)
    .withAfterAgentCallback(callbacks.afterAgentCallback)
    .withBeforeModelCallback(callbacks.beforeModelCallback)
    .withAfterModelCallback(callbacks.afterModelCallback);

  try {
    // @ts-ignore
    const { runner } = await builder.buildWithSchema(transactionSchema);
    const response = await runner.ask(`Parse this transaction request: "${userText}"`);
    
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
    return parsedResult as TransactionData;
  } catch (error: any) {
    console.error("Transaction Parse Error:", error);
    
    // Handle quota errors specifically
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('API quota exceeded. Please try again in a few seconds.');
    }
    
    throw error;
  }
}
