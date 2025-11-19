# cybersec connect (Legacy Version)
> **⚠️ Legacy Code**  
> This is the very old codebase (pre-current version) for www.g24sec.space.  
> It is provided here for historical/reference purposes and may not receive updates.

---

## 🚀 Overview

A Node.js/Express web application powering g24sec.space.  
Handles user authentication (Google & GitHub), media uploads, news feeds, AI integrations, and more.

---

## 📦 Features

- OAuth login with **Google** & **GitHub**  
- Session management & JWT-based APIs  
- Image uploads & transformations via **ImageKit**  
- News aggregation (optional - NewsAPI can be configured)  
- Email notifications via **SMTP** (supports any provider - Brevo, Gmail, SendGrid, etc.)  
- AI integrations via **Hugging Face** (free tier available)
- Security entity extraction using **CyberSecBERT** model

---

## 📋 Prerequisites

- **Node.js** (>= 18.x) & **npm**  
- **PostgreSQL**  
- OAuth apps registered for:
  - **Google** (CLIENT_ID & CLIENT_SECRET)  
  - **GitHub** (CLIENT_ID & CLIENT_SECRET)  
- Accounts / API keys for:
  - **SMTP Email Service** (optional - Brevo, Gmail, SendGrid, etc.)  
  - **ImageKit**  
  - **Hugging Face** (optional - free tier available for AI)

---

## ⚙️ Setup & Deployment

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Kyle6012/g24sec-space-legacy.git
   cd g24sec-space-legacy
   ```
2. **Install dependecies**
   ```bash
   npm install
   ```
3. **Configure Environment**
   
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and fill in all required values:
   - **Database:** Configure PostgreSQL connection details
   - **OAuth:** Register apps with Google & GitHub to get CLIENT_ID and CLIENT_SECRET
   - **Services:** Sign up for accounts and get API keys:
     - [ImageKit](https://imagekit.io) - Image uploads & CDN
     - **SMTP Email** (optional) - Configure SMTP settings for email notifications:
       - Default: [Brevo](https://www.brevo.com) (smtp-relay.brevo.com)
       - Or use: Gmail, SendGrid, Mailgun, etc.
     - [Hugging Face](https://huggingface.co/settings/tokens) - AI integration (optional, free tier available)
   - **Secrets:** Generate strong random values for `SESSION_SECRET` and `JWT_SECRET`
     ```bash
     # Generate secrets (Linux/Mac)
     openssl rand -base64 32
     
     # Or use Node.js
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```
   
4. **Start server**
   ```bash
   npm start
   ```
5. **Access**
   Open your browser at localhost:3000 (or your configured BASE_URL).

## ☁️ Deployment tips
   - Any Node-capable host (Heroku, Vercel, DigitalOcean, etc.) will work.

   - Push to your Git provider, connect the repo in your host dashboard, and mirror the same ENV variables in the host’s settings.

   - On deploy, the host will run npm install & npm start automatically.


## 🤝 Contributing

1. Fork & clone

2. Create a feature branch

3. Commit & push

4. Open a pull request

Please note this is legacy code; contributions may not be merged into the current mainline.

## 🔒 Security

- Do not commit your `.env` or any secret keys to GitHub.

- Rotate credentials regularly.

- Use strong, unique values for `SESSION_SECRET` & `JWT_SECRET`.

## 🤖 AI Integration

The platform includes two AI-powered features:

### 1. G24Sec AI Chat Assistant

A cybersecurity-focused AI assistant that can answer questions and provide guidance on security topics. The assistant is powered by Hugging Face models and includes:

- Primary model: Configurable via `HUGGINGFACE_MODEL` environment variable
- Fallback model: Automatically used if the primary model fails
- Robust error handling and retry logic
- Specialized cybersecurity knowledge

### 2. Security Entity Extraction

A tool powered by a Named Entity Recognition (NER) model that can identify security-related entities in text.

### Features

- Extract security entities from logs, threat reports, and other text
- Identifies entities such as:
  - IP addresses
  - Domain names
  - CVE identifiers
  - Malware names
  - File hashes
  - URLs
  - Port numbers
  - And more

### Usage

1. Navigate to `/ai/entity-extraction` in the application
2. Paste your security text into the input field
3. Click "Extract Entities"
4. View the categorized results

### API Endpoint

You can also use the API endpoint directly:

```bash
POST /ai/extract-entities
Content-Type: application/json

{
  "text": "Your security text here..."
}
```

Response format:

```json
{
  "entities": {
    "ipAddresses": ["192.168.1.1", "10.0.0.1"],
    "domains": ["malicious-domain.com"],
    "cves": ["CVE-2023-1234"],
    "malware": ["Emotet"],
    "hashes": ["5f4dcc3b5aa765d61d8327deb882cf99"],
    "urls": ["https://malicious-site.com/payload"],
    "ports": ["445"],
    "other": [{"type": "tool", "value": "mimikatz"}]
  }
}
```

### Configuration

The CyberSecBERT model can be configured in your `.env` file:

```
# Primary AI model for chat
HUGGINGFACE_MODEL=meta-llama/Llama-3.2-3B-Instruct
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Optional fallback model (used if primary model fails)
# FALLBACK_MODEL=microsoft/Phi-3-mini-4k-instruct

# Entity extraction model
CYBERSECBERT_MODEL=dslim/bert-base-NER
```

You can use other models from Hugging Face that support the required functionality.

### Setting Up the AI Integration

To set up the AI integration, follow these steps:

1. Get a Hugging Face API key from [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

2. Run the setup scripts:

```bash
# Configure Hugging Face API and model selection
npm run setup-huggingface

# Create the G24 AI user in the database
npm run setup-ai
```

3. Start the server and navigate to the chat interface

4. Find and message the "g24_ai" user to start chatting with the AI assistant

## 📑 License
This project is released under the Apache-2.0 license.

