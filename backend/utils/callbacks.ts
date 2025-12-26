/**
 * Shared Callbacks for All Agents
 * Provides caching, monitoring, and error tracking
 */

import { CallbackContext, LlmRequest, LlmResponse } from '@iqai/adk';
import { cache } from './cache.js';

/**
 * Before Agent Callback - Monitoring
 */
export const beforeAgentCallback = (ctx: CallbackContext) => {
  const timestamp = new Date().toISOString();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 [${timestamp}] Agent Starting: ${ctx.agentName}`);
  console.log(`📝 Session: ${ctx.sessionId}`);
  
  // Store start time for duration calculation
  (ctx as any)._startTime = Date.now();
  
  return undefined; // Continue execution
};

/**
 * After Agent Callback - Monitoring & Analytics
 */
export const afterAgentCallback = (ctx: CallbackContext) => {
  const duration = Date.now() - ((ctx as any)._startTime || Date.now());
  const timestamp = new Date().toISOString();
  
  console.log(`✅ [${timestamp}] Agent Completed: ${ctx.agentName}`);
  console.log(`⏱️ Duration: ${duration}ms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Could log to database/analytics here
  // logToAnalytics({ agent: ctx.agentName, duration, timestamp });
  
  return undefined; // Use original response
};

/**
 * Before Model Callback - Caching
 */
export const beforeModelCallback = ({ 
  callbackContext, 
  llmRequest 
}: {
  callbackContext: CallbackContext;
  llmRequest: LlmRequest;
}): LlmResponse | null => {
  console.log(`📤 Calling Gemini API for agent: ${callbackContext.agentName}...`);
  
  // Generate cache key from STATIC parts only (exclude dynamic data like prices)
  // Extract coin name from the user message
  const lastContent = llmRequest.contents[llmRequest.contents.length - 1];
  const userMessage = lastContent?.parts?.[0]?.text || '';
  
  const cacheKey = cache.generateKey({
    agent: callbackContext.agentName,
    message: userMessage // Only cache based on user message, not full contents
  });
  
  console.log(`🔑 Cache key: ${cacheKey.substring(0, 16)}... (from message: "${userMessage.substring(0, 40)}")`);
  
  // Check cache
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log(`💾 Returning cached response (skipped API call)`);
    console.log(`💰 Estimated savings: ${cache.estimateSavings()}`);
    return cached; // Skip API call, return cached response
  }
  
  console.log(`🔍 Cache miss, proceeding to Gemini API...`);
  
  // Store cache key in context for afterModelCallback
  (callbackContext as any)._cacheKey = cacheKey;
  
  return null; // Proceed to API call
};

/**
 * After Model Callback - Save to Cache
 */
export const afterModelCallback = ({ 
  callbackContext, 
  llmResponse 
}: {
  callbackContext: CallbackContext;
  llmResponse: LlmResponse;
}): LlmResponse | null => {
  console.log(`📥 Gemini API responded`);
  
  // Get cache key stored in beforeModelCallback
  const cacheKey = (callbackContext as any)._cacheKey;
  
  if (cacheKey && llmResponse) {
    // Save to cache with 1 hour TTL
    // For market data: shorter TTL (5 minutes = 300s)
    // For general chat: longer TTL (1 hour = 3600s)
    const ttl = callbackContext.agentName.includes('market') ? 300 : 3600;
    
    cache.set(cacheKey, llmResponse, ttl);
    console.log(`💾 Saved response to cache (key: ${cacheKey.substring(0, 8)}...)`);
  }
  
  return null; // Use original response
};

/**
 * Before Tool Callback - Monitoring
 */
export const beforeToolCallback = (
  tool: any,
  args: Record<string, any>,
  ctx: any
) => {
  console.log(`🔧 Calling tool: ${tool.name}`);
  console.log(`📝 Args: ${JSON.stringify(args).substring(0, 100)}...`);
  
  return null; // Proceed to tool execution
};

/**
 * After Tool Callback - Monitoring
 */
export const afterToolCallback = (
  tool: any,
  args: Record<string, any>,
  ctx: any,
  response: Record<string, any>
) => {
  console.log(`✅ Tool ${tool.name} completed`);
  
  return null; // Use original response
};

/**
 * Get all callbacks for an agent
 */
export const getCallbacks = () => ({
  beforeAgentCallback,
  afterAgentCallback,
  beforeModelCallback,
  afterModelCallback,
  beforeToolCallback,
  afterToolCallback
});
