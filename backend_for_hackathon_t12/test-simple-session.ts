// Simple Session Test - Basic conversation memory
import 'dotenv/config';
import { chatWithModel } from './agents/chatAgent.js';

console.log('🧪 Simple Session Memory Test\n');
console.log('=' .repeat(60));

async function testSimpleConversation() {
  const userId = 'test-user-simple';
  
  try {
    // Conversation 1
    console.log('\n💬 User: "My favorite color is blue"');
    const response1 = await chatWithModel(
      "My favorite color is blue",
      userId
    );
    console.log(`🤖 AI: ${response1}\n`);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Conversation 2 - Should remember blue
    console.log('💬 User: "What is my favorite color?"');
    const response2 = await chatWithModel(
      "What is my favorite color?",
      userId
    );
    console.log(`🤖 AI: ${response2}\n`);
    
    // Check if AI remembered
    if (response2.toLowerCase().includes('blue')) {
      console.log('✅ SUCCESS: AI remembered "blue"!');
    } else {
      console.log('❌ FAILED: AI did not remember "blue"');
      console.log('Response was:', response2);
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Conversation 3
    console.log('\n💬 User: "I like pizza"');
    const response3 = await chatWithModel(
      "I like pizza",
      userId
    );
    console.log(`🤖 AI: ${response3}\n`);
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Conversation 4 - Should remember both blue and pizza
    console.log('💬 User: "What do you know about me?"');
    const response4 = await chatWithModel(
      "What do you know about me?",
      userId
    );
    console.log(`🤖 AI: ${response4}\n`);
    
    const remembersBlue = response4.toLowerCase().includes('blue');
    const remembersPizza = response4.toLowerCase().includes('pizza');
    
    console.log('\n📊 Memory Check:');
    console.log(`  Blue: ${remembersBlue ? '✅' : '❌'}`);
    console.log(`  Pizza: ${remembersPizza ? '✅' : '❌'}`);
    
    if (remembersBlue && remembersPizza) {
      console.log('\n🎉 PERFECT: AI has working session memory!');
    } else if (remembersBlue || remembersPizza) {
      console.log('\n⚠️ PARTIAL: AI remembered some things');
    } else {
      console.log('\n❌ FAILED: No session memory working');
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error);
    process.exit(1);
  }
}

testSimpleConversation();
