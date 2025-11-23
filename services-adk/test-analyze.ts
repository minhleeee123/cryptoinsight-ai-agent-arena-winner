import { config } from 'dotenv';
config({ path: '.env.local' });

import { analyzeCoin } from '../services-adk/geminiService';

console.log('🧪 Testing ADK analyzeCoin\n');

async function test() {
  try {
    console.log('Analyzing Bitcoin...\n');
    const result = await analyzeCoin("Bitcoin");
    
    console.log('✅ Success!');
    console.log('\nFull Result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n📊 Summary:');
    console.log(`  Coin: ${result.coinName}`);
    console.log(`  Price: $${result.currentPrice}`);
    console.log(`  Sentiment: ${result.sentimentScore}/100`);
    console.log(`  Price History: ${result.priceHistory?.length || 0} points`);
    console.log(`  Long/Short: ${result.longShortRatio?.length || 0} points`);
    console.log(`  Tokenomics: ${result.tokenomics?.length || 0} items`);
    console.log(`  Project Scores: ${result.projectScores?.length || 0} metrics`);
    console.log(`\n  Summary: ${result.summary}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

test();
