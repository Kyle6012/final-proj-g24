# Cybersec Connect

A Node.js/Express web application for cybersecurity enthusiasts. Handles user authentication, media uploads, news feeds, AI integrations, and more.

---

## 🚀 Overview

This is a Node.js/Express web application that provides a platform for cybersecurity professionals and enthusiasts to connect, share information, and collaborate. It features email-based authentication, image uploads, news aggregation, and AI-powered tools.

---

## 📦 Features

- **Email-based authentication:** Secure user authentication with email verification and password reset.
- **Session management:** JWT-based APIs for secure and scalable session management.
- **Image uploads:** Image uploads and transformations via ImageKit.
- **News aggregation:** Optional news aggregation with NewsAPI.
- **Email notifications:** SMTP support for email notifications (Brevo, Gmail, SendGrid, etc.).
- **AI integrations:** Hugging Face integration for AI-powered features.
- **Security entity extraction:** CyberSecBERT model for extracting security entities from text.

---

## 📋 Prerequisites

- **Node.js** (>= 18.x) & **npm**
- **PostgreSQL**
- Accounts / API keys for:
  - **SMTP Email Service** (optional)
  - **ImageKit**
  - **Hugging Face** (optional)

---

## ⚙️ Setup & Deployment

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/cybersec-connect.git
    cd cybersec-connect
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Configure PostgreSQL**
    - Install PostgreSQL on your machine.
    - Create a new database and a user with a password.
    - Grant the user privileges to the database.
4.  **Configure Environment**
    - Create a `.env` file from the `.env.example`:
      ```bash
      cp .env.example .env
      ```
    - Edit the `.env` file and fill in the required values:
      - **Database:** Configure the PostgreSQL connection details.
      - **Services:** Sign up for accounts and get API keys for ImageKit, SMTP, and Hugging Face.
      - **Secrets:** Generate strong random values for `SESSION_SECRET` and `JWT_SECRET`.
5.  **Run Migrations**
    ```bash
    npm run migrate
    ```
6.  **Start server**
    ```bash
    npm start
    ```
7.  **Access**
    Open your browser at `http://localhost:3000` (or your configured `BASE_URL`).

---

## ☁️ Deployment

This application is configured for deployment on Vercel. The `vercel.json` file in the root directory contains the necessary configuration. To deploy, simply connect your Git repository to Vercel and the deployment will be handled automatically.

---

## 🤝 Contributing

Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## 🔒 Security

- Do not commit your `.env` file or any secret keys to GitHub.
- Rotate credentials regularly.
- Use strong, unique values for `SESSION_SECRET` and `JWT_SECRET`.

---

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
