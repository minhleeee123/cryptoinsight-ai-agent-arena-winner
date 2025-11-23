/**
 * SIMPLE TEST: Verify ADK is working
 */

import { config } from 'dotenv';
import { AgentBuilder } from '@iqai/adk';
import { z } from 'zod';

config({ path: '.env.local' });

console.log('🧪 SIMPLE ADK TEST\n');
console.log('API Key present:', !!process.env.GOOGLE_API_KEY);

async function test1_basicAgent() {
  console.log('\n1️⃣ Testing basic agent (no schema)...');
  try {
    const { runner } = await AgentBuilder
      .create("test_agent")
      .withModel("gemini-2.5-flash")
      .withInstruction("You are a helpful assistant.")
      .build();
    
    const response = await runner.ask("What is 2 + 2? Answer in one sentence.");
    console.log('✅ Response:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

async function test2_withSchema() {
  console.log('\n2️⃣ Testing agent with Zod schema...');
  try {
    const mathSchema = z.object({
      question: z.string(),
      answer: z.number(),
      explanation: z.string()
    });

    const { runner } = await AgentBuilder
      .create("math_agent")
      .withModel("gemini-2.5-flash")
      .withInstruction("You are a math assistant. Solve the problem and provide structured output.")
      .buildWithSchema(mathSchema);
    
    const response = await runner.ask("What is 15 + 27?");
    console.log('✅ Response:', response);
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    if (error.stack) console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    return false;
  }
}

async function test3_cryptoLike() {
  console.log('\n3️⃣ Testing crypto-like structured output...');
  try {
    const cryptoSimpleSchema = z.object({
      coinName: z.string(),
      currentPrice: z.number(),
      summary: z.string()
    });

    const systemInstruction = `
      You are a crypto analyst.
      For Bitcoin: price is around $45,000
      Provide the coin name, price, and a brief summary.
    `;

    const { runner } = await AgentBuilder
      .create("crypto_simple")
      .withModel("gemini-2.5-flash")
      .withInstruction(systemInstruction)
      .buildWithSchema(cryptoSimpleSchema);
    
    const response = await runner.ask("Give me Bitcoin data");
    console.log('✅ Response:', JSON.stringify(response, null, 2));
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    return false;
  }
}

async function runTests() {
  const results = [];
  
  results.push(await test1_basicAgent());
  await new Promise(r => setTimeout(r, 1000));
  
  results.push(await test2_withSchema());
  await new Promise(r => setTimeout(r, 1000));
  
  results.push(await test3_cryptoLike());
  
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r).length;
  console.log(`RESULTS: ${passed}/${results.length} passed`);
  console.log('='.repeat(60));
}

runTests().catch(console.error);
