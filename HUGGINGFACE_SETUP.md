# Hugging Face AI Model Setup Guide

This guide will help you set up and configure the Hugging Face AI model for your G24Sec application.

## 🚀 Quick Start

The AI model is already configured and ready to use! It works **without any API key** using the free tier.

### Default Configuration
- **Model**: `meta-llama/Llama-3.2-3B-Instruct`
- **API Key**: Optional (works without it)
- **Status**: Ready to use

## 📋 Step-by-Step Setup

### 1. Basic Setup (No API Key Required)

The application works out of the box without any configuration. Just start the server:

```bash
npm start
```

The AI will use the default model (`meta-llama/Llama-3.2-3B-Instruct`) without authentication.

### 2. Optional: Get a Hugging Face API Key (Recommended)

An API key is **optional** but recommended for:
- Better rate limits
- Faster responses
- Access to more models
- Priority queue access

**Steps to get an API key:**

1. Visit [Hugging Face](https://huggingface.co/) and create a free account
2. Go to [Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Give it a name (e.g., "g24sec-ai")
5. Select "Read" permission
6. Copy the token

**Add to your `.env` file:**
```env
HUGGINGFACE_API_KEY=your_token_here
```

### 3. Choose a Different Model (Optional)

You can change the AI model by setting `HUGGINGFACE_MODEL` in your `.env` file.

**Recommended Free Models:**

#### Fast & Lightweight Models
- `meta-llama/Llama-3.2-3B-Instruct` (Default) - Fast, good for chat
- `microsoft/Phi-3-mini-4k-instruct` - Very lightweight, very fast

#### Better Quality Models (Slower)
- `mistralai/Mistral-7B-Instruct-v0.2` - Higher quality responses
- `google/gemma-2-2b-it` - Good balance of speed and quality

**To change model, add to `.env`:**
```env
HUGGINGFACE_MODEL=microsoft/Phi-3-mini-4k-instruct
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Optional: Hugging Face API Key (for better rate limits)
HUGGINGFACE_API_KEY=your_token_here

# Optional: Choose a different model
HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
```

### Model Parameters

The following parameters are configured in `controllers/aiController.mjs`:

- **max_new_tokens**: 500 (response length)
- **temperature**: 0.7 (creativity, 0-1)
- **top_p**: 0.9 (nucleus sampling)
- **timeout**: 45 seconds (for model loading)

You can modify these in the code if needed.

## 🎯 Features

### Automatic Retry Logic
- Handles model loading (cold starts)
- Retries up to 3 times automatically
- Waits for estimated loading time

### Error Handling
- Graceful handling of rate limits
- Timeout protection
- User-friendly error messages

### Response Cleaning
- Automatically removes prompt artifacts
- Cleans up model-specific formatting
- Returns clean, usable responses

## 🧪 Testing the AI

1. **Start your server:**
   ```bash
   npm start
   ```

2. **Test via chat:**
   - Log in to your application
   - Start a chat with "g24_ai" user
   - Send a message and wait for response

3. **Check logs:**
   - Look for `[AI Chat]` messages in your console
   - Monitor for any errors or warnings

## 📊 Model Comparison

| Model | Speed | Quality | Size | Best For |
|-------|-------|---------|------|----------|
| meta-llama/Llama-3.2-3B-Instruct | ⚡⚡⚡ | ⭐⭐⭐ | 3B | General chat, fast responses |
| microsoft/Phi-3-mini-4k-instruct | ⚡⚡⚡⚡ | ⭐⭐⭐ | 3.8B | Quick responses, lightweight |
| mistralai/Mistral-7B-Instruct-v0.2 | ⚡⚡ | ⭐⭐⭐⭐ | 7B | Better quality, detailed responses |
| google/gemma-2-2b-it | ⚡⚡⚡ | ⭐⭐⭐ | 2B | Balanced performance |

## ⚠️ Troubleshooting

### Model is Loading
- **Symptom**: First request takes 20-60 seconds
- **Cause**: Model is cold-starting (free tier)
- **Solution**: Wait for first response, subsequent requests are faster

### Rate Limit Errors
- **Symptom**: "AI service is currently busy"
- **Cause**: Too many requests without API key
- **Solution**: 
  - Wait a few seconds and retry
  - Get a free API key for better limits

### Timeout Errors
- **Symptom**: Request times out
- **Cause**: Model taking too long to respond
- **Solution**: 
  - Try a faster model (Phi-3-mini)
  - Check your internet connection
  - The system will retry automatically

### Empty Responses
- **Symptom**: AI returns empty or error message
- **Cause**: Model issue or malformed request
- **Solution**: 
  - Check console logs for errors
  - Try a different model
  - Verify API key is valid (if using one)

## 🔒 Security Notes

- API keys are stored in `.env` (never commit to git)
- Free tier models are public and safe
- All requests are made server-side (secure)
- No user data is sent to Hugging Face

## 📚 Additional Resources

- [Hugging Face Models](https://huggingface.co/models)
- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference)
- [Access Tokens](https://huggingface.co/settings/tokens)

## ✅ Quick Checklist

- [ ] Application starts without errors
- [ ] Can send messages to AI chat
- [ ] Receives responses (may take 20-60s first time)
- [ ] (Optional) Added API key to `.env`
- [ ] (Optional) Changed model if desired

## 🎉 You're All Set!

Your Hugging Face AI model is configured and ready to use. The system will automatically handle model loading, retries, and error recovery.

Enjoy your AI-powered cybersecurity assistant! 🚀

