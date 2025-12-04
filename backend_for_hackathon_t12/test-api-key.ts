// Test Gemini API Key
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCCXyqNsqe1Ng2_15VH8V7QfI6usBCtuxM';

async function testApiKey() {
  console.log('🧪 Testing Gemini API Key...\n');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('📤 Sending test request...');
    const result = await model.generateContent('Say hello in Vietnamese');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Key is VALID!\n');
    console.log('📝 Response:', text);
    console.log('\n✨ You can use this API key safely.');
    
  } catch (error: any) {
    console.error('❌ API Key Test FAILED!\n');
    
    if (error.message?.includes('429')) {
      console.error('🚫 Error: Quota exceeded');
      console.error('💡 This API key has reached its usage limit.');
    } else if (error.message?.includes('400')) {
      console.error('🚫 Error: Invalid API key');
      console.error('💡 The API key format is invalid or not activated.');
    } else if (error.message?.includes('403')) {
      console.error('🚫 Error: API not enabled');
      console.error('💡 Enable Gemini API at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
    } else {
      console.error('🚫 Error:', error.message);
    }
    
    process.exit(1);
  }
}

testApiKey();
