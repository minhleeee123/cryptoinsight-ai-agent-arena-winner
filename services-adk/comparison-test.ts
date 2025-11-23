/**
 * COMPARISON TEST: Original vs ADK Implementation
 * 
 * This test compares the original geminiService.ts with the new ADK version
 * to validate functionality and performance.
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

// Check if API key is loaded
if (!process.env.API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error('❌ ERROR: API keys not found in .env.local');
  console.error('Please ensure .env.local contains:');
  console.error('  API_KEY=your_key_here');
  console.error('  GOOGLE_API_KEY=your_key_here');
  process.exit(1);
}

console.log('✅ API Keys loaded successfully\n');

import { analyzeCoin as analyzeCoinOriginal } from '../services/geminiService';
import { analyzeCoin as analyzeCoinADK } from '../services-adk/geminiService';

console.log('='.repeat(80));
console.log('COMPARISON TEST: Original vs IQ ADK Implementation');
console.log('='.repeat(80));

async function testAnalyzeCoin() {
  console.log('\n📊 TEST: analyzeCoin("Bitcoin")');
  console.log('-'.repeat(80));
  
  const testCoin = "Bitcoin";
  
  // Test Original
  console.log('\n🔵 Testing ORIGINAL implementation...');
  const startOriginal = Date.now();
  try {
    const resultOriginal = await analyzeCoinOriginal(testCoin);
    const timeOriginal = Date.now() - startOriginal;
    
    console.log('✅ Original Success');
    console.log(`   Time: ${timeOriginal}ms`);
    console.log(`   Coin: ${resultOriginal.coinName}`);
    console.log(`   Price: $${resultOriginal.currentPrice}`);
    console.log(`   Sentiment: ${resultOriginal.sentimentScore}/100`);
    console.log(`   Price History Points: ${resultOriginal.priceHistory.length}`);
    console.log(`   Summary: ${resultOriginal.summary.slice(0, 100)}...`);
  } catch (error: any) {
    console.error('❌ Original Failed:', error.message);
  }
  
  // Wait a bit to avoid rate limits
  console.log('\n⏳ Waiting 2 seconds to avoid rate limits...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test ADK
  console.log('\n🟢 Testing ADK implementation...');
  const startADK = Date.now();
  try {
    const resultADK = await analyzeCoinADK(testCoin);
    const timeADK = Date.now() - startADK;
    
    console.log('✅ ADK Success');
    console.log(`   Time: ${timeADK}ms`);
    console.log(`   Coin: ${resultADK.coinName}`);
    console.log(`   Price: $${resultADK.currentPrice}`);
    console.log(`   Sentiment: ${resultADK.sentimentScore}/100`);
    console.log(`   Price History Points: ${resultADK.priceHistory.length}`);
    console.log(`   Summary: ${resultADK.summary.slice(0, 100)}...`);
  } catch (error: any) {
    console.error('❌ ADK Failed:', error.message);
  }
}

async function testMultipleCoins() {
  console.log('\n\n📈 TEST: Multiple Coins Analysis');
  console.log('-'.repeat(80));
  
  const coins = ["Ethereum", "Solana"];
  
  for (const coin of coins) {
    console.log(`\n🪙 Testing: ${coin}`);
    
    // Test Original
    console.log('  🔵 Original...');
    try {
      const start = Date.now();
      const result = await analyzeCoinOriginal(coin);
      console.log(`     ✅ ${Date.now() - start}ms - ${result.coinName}: $${result.currentPrice}`);
    } catch (error: any) {
      console.log(`     ❌ Failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test ADK
    console.log('  🟢 ADK...');
    try {
      const start = Date.now();
      const result = await analyzeCoinADK(coin);
      console.log(`     ✅ ${Date.now() - start}ms - ${result.coinName}: $${result.currentPrice}`);
    } catch (error: any) {
      console.log(`     ❌ Failed: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function runComparison() {
  console.log('\n🚀 Starting Comparison Tests...\n');
  
  try {
    await testAnalyzeCoin();
    await testMultipleCoins();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPARISON COMPLETE');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log('  - Both implementations should return similar data structure');
    console.log('  - ADK may have slightly higher latency due to agent initialization');
    console.log('  - ADK provides better error handling and type safety with Zod');
    console.log('  - Original is lighter weight for simple requests');
    console.log('  - ADK is better for complex workflows and conversation memory\n');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  }
}

// Run comparison
runComparison().catch(console.error);
