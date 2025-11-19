import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Get Hugging Face configuration from .env
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || "meta-llama/Llama-3.2-3B-Instruct";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || null;
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

// Test message
const TEST_MESSAGE = "What is cybersecurity?";

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000;
const MAX_TIMEOUT = 60000;

/**
 * Test the Hugging Face AI model
 */
async function testAI() {
  console.log("🧪 Testing Hugging Face AI Integration");
  console.log(`📋 Configuration:`);
  console.log(`   - Model: ${HUGGINGFACE_MODEL}`);
  console.log(`   - API Key: ${HUGGINGFACE_API_KEY ? "Configured ✓" : "Not configured ✗"}`);
  console.log(`   - Test Message: "${TEST_MESSAGE}"\n`);
  
  try {
    const systemPrompt = "You are G24 AI, a cybersecurity assistant. Provide a brief response.";
    const fullPrompt = `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${TEST_MESSAGE} [/INST]`;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (HUGGINGFACE_API_KEY) {
      headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
    }
    
    console.log("🔄 Sending request to Hugging Face API...");
    
    // Retry logic for handling model loading
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt + 1}/${MAX_RETRIES}...`);
        
        const response = await axios.post(
          HUGGINGFACE_API_URL,
          {
            inputs: fullPrompt,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false,
              do_sample: true
            }
          },
          { 
            headers,
            timeout: MAX_TIMEOUT
          }
        );
        
        // Handle model loading response
        if (response.data.error) {
          if (response.data.error.includes('loading') || response.data.estimated_time) {
            const waitTime = response.data.estimated_time || RETRY_DELAY;
            console.log(`⏳ Model is loading, waiting ${waitTime}ms...`);
            if (attempt < MAX_RETRIES - 1) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }
          throw new Error(response.data.error);
        }
        
        // Handle Hugging Face API response format
        let aiResponse;
        if (Array.isArray(response.data) && response.data.length > 0) {
          aiResponse = response.data[0].generated_text || response.data[0].text || "";
        } else if (response.data.generated_text) {
          aiResponse = response.data.generated_text;
        } else if (typeof response.data === 'string') {
          aiResponse = response.data;
        } else {
          throw new Error("Invalid response format from AI.");
        }
        
        // Clean up the response
        let assistantResponse = aiResponse.trim();
        
        if (assistantResponse.includes('[/INST]')) {
          assistantResponse = assistantResponse.split('[/INST]').pop().trim();
        }
        
        assistantResponse = assistantResponse.replace(/^Assistant:\s*/i, '').trim();
        
        if (!assistantResponse) {
          throw new Error("Empty response from AI.");
        }
        
        console.log("\n✅ Success! AI responded:\n");
        console.log("-------------------------");
        console.log(assistantResponse);
        console.log("-------------------------\n");
        
        console.log("🎉 The AI integration is working correctly!");
        console.log("📝 Next steps:");
        console.log("1. Start your server: npm start");
        console.log("2. Log in to your application");
        console.log("3. Start a chat with the 'g24_ai' user");
        
        return;
        
      } catch (err) {
        lastError = err;
        
        if (err.response?.status === 503) {
          const estimatedTime = err.response.data?.estimated_time || RETRY_DELAY;
          console.log(`⏳ Model loading, retry ${attempt + 1}/${MAX_RETRIES} in ${estimatedTime}ms`);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(resolve => setTimeout(resolve, estimatedTime));
            continue;
          }
        } else if (err.response?.status === 429) {
          console.error("❌ Rate limit exceeded. Consider adding an API key.");
          break;
        } else if (err.code === 'ECONNABORTED') {
          console.error("❌ Request timed out. The model might be taking too long to load.");
          break;
        }
      }
    }
    
    // If all retries failed
    if (lastError) {
      console.error("❌ Error:", lastError.message);
      
      if (lastError.response?.status === 401) {
        console.error("🔑 Authentication failed. Check your API key.");
      } else if (lastError.response?.status === 404) {
        console.error("🔍 Model not found. Check the model name in your configuration.");
      } else if (!HUGGINGFACE_API_KEY) {
        console.log("\n💡 Tip: Adding a Hugging Face API key may improve reliability.");
        console.log("   Run: node scripts/setup-huggingface.mjs");
      }
    }
    
  } catch (err) {
    console.error("❌ Unexpected error:", err.message);
  }
}

// Run the test
testAI();
