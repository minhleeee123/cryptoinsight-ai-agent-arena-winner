import { config } from 'dotenv';
import { AgentBuilder } from '@iqai/adk';
import { z } from 'zod';

config({ path: '.env.local' });

console.log('🧪 DEBUG ADK Structured Output\n');

async function testSimpleSchema() {
  console.log('Testing simple schema...\n');
  
  const simpleSchema = z.object({
    name: z.string(),
    value: z.number()
  });
  
  try {
    const builder = AgentBuilder
      .create("test")
      .withModel("gemini-2.5-flash")
      .withInstruction("Return name='test' and value=42");
    
    // @ts-ignore
    const { runner } = await builder.buildWithSchema(simpleSchema);
    
    const result = await runner.ask("Give me the data");
    
    console.log('Result type:', typeof result);
    console.log('Result:', result);
    console.log('Result JSON:', JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

testSimpleSchema();
