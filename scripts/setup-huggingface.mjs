import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to read existing .env file or create a new one based on template
async function setupEnvFile() {
  try {
    console.log('🚀 Setting up Hugging Face API for your G24Sec application...');
    
    // Check if .env file exists
    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found existing .env file');
    } catch (err) {
      // If .env doesn't exist, use template
      const templatePath = path.join(rootDir, 'env-template.txt');
      try {
        envContent = fs.readFileSync(templatePath, 'utf8');
        console.log('✅ Using env-template.txt as base configuration');
      } catch (templateErr) {
        console.error('❌ Could not find env-template.txt');
        envContent = '# Hugging Face API (Optional)\nHUGGINGFACE_API_KEY=\n\n# Hugging Face Model (Optional)\nHUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct\n';
      }
    }

    // Ask for Hugging Face API key
    const apiKey = await new Promise((resolve) => {
      rl.question('Enter your Hugging Face API key (leave empty to skip): ', (answer) => {
        resolve(answer.trim());
      });
    });

    // Ask for model selection
    console.log('\nRecommended models:');
    console.log('1. meta-llama/Llama-3.2-3B-Instruct (Default, fast, good for chat)');
    console.log('2. microsoft/Phi-3-mini-4k-instruct (Very lightweight, very fast)');
    console.log('3. mistralai/Mistral-7B-Instruct-v0.2 (Higher quality, slower)');
    console.log('4. google/gemma-2-2b-it (Good balance)');
    
    const modelChoice = await new Promise((resolve) => {
      rl.question('Select a model (1-4) or enter a custom model name: ', (answer) => {
        resolve(answer.trim());
      });
    });

    // Map choice to model name
    let modelName;
    switch (modelChoice) {
      case '1':
        modelName = 'meta-llama/Llama-3.2-3B-Instruct';
        break;
      case '2':
        modelName = 'microsoft/Phi-3-mini-4k-instruct';
        break;
      case '3':
        modelName = 'mistralai/Mistral-7B-Instruct-v0.2';
        break;
      case '4':
        modelName = 'google/gemma-2-2b-it';
        break;
      default:
        modelName = modelChoice || 'meta-llama/Llama-3.2-3B-Instruct';
    }

    // Update or add Hugging Face configuration in .env content
    if (apiKey) {
      if (envContent.includes('HUGGINGFACE_API_KEY=')) {
        envContent = envContent.replace(/HUGGINGFACE_API_KEY=.*(\r?\n|$)/g, `HUGGINGFACE_API_KEY=${apiKey}$1`);
      } else {
        envContent += `\n# Hugging Face API Key\nHUGGINGFACE_API_KEY=${apiKey}\n`;
      }
      console.log('✅ Added API key to configuration');
    }

    if (modelName) {
      if (envContent.includes('HUGGINGFACE_MODEL=')) {
        envContent = envContent.replace(/HUGGINGFACE_MODEL=.*(\r?\n|$)/g, `HUGGINGFACE_MODEL=${modelName}$1`);
      } else {
        envContent += `\n# Hugging Face Model\nHUGGINGFACE_MODEL=${modelName}\n`;
      }
      console.log(`✅ Set model to: ${modelName}`);
    }

    // Write updated content to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Successfully updated .env file');
    
    console.log('\n🎉 Setup complete! Next steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Log in to your application');
    console.log('3. Start a chat with the "g24_ai" user');
    console.log('4. The first message may take 20-60 seconds to process');
    console.log('5. Check server logs for [AI Chat] messages\n');

  } catch (error) {
    console.error('❌ Error setting up configuration:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupEnvFile();
