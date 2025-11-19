import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Hugging Face Model Configuration
// You can change the model by setting HUGGINGFACE_MODEL in .env
// Recommended free models:
// - meta-llama/Llama-3.2-3B-Instruct (fast, good for chat)
// - microsoft/Phi-3-mini-4k-instruct (lightweight, fast)
// - mistralai/Mistral-7B-Instruct-v0.2 (better quality, slower)
// - google/gemma-2-2b-it (good balance)
const DEFAULT_MODEL = "meta-llama/Llama-3.2-3B-Instruct";
const HUGGINGFACE_MODEL = process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || null;
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`;

// Fallback model in case the primary model fails
const FALLBACK_MODEL = "microsoft/Phi-3-mini-4k-instruct";
const FALLBACK_API_URL = `https://api-inference.huggingface.co/models/${FALLBACK_MODEL}`;

// Retry configuration for cold model starts
const MAX_RETRIES = 5; // Increased from 3 to 5 for better handling of cold starts
const RETRY_DELAY = 3000; // Increased from 2 to 3 seconds
const MAX_TIMEOUT = 60000; // 60 seconds maximum timeout

/**
 * Setup and configure Hugging Face AI model for chat
 * @param {Object} userM - User object with fullname and username
 * @param {string} message - User's message
 * @returns {Promise<string>} AI response
 */
// CyberSecBERT model configuration for security entity extraction
// Using a more reliable NER model for cybersecurity text
const CYBERSECBERT_MODEL = process.env.CYBERSECBERT_MODEL || "dslim/bert-base-NER";
// Note: While not specifically trained for cybersecurity, this is a reliable NER model
// that can extract entities like IPs, domains, etc. from text
const CYBERSECBERT_API_URL = `https://api-inference.huggingface.co/models/${CYBERSECBERT_MODEL}`;

/**
 * Extract security entities from text using CyberSecBERT
 * @param {string} text - The text to analyze for security entities
 * @returns {Promise<Object>} Extracted entities categorized by type
 */
export const extractSecurityEntities = async (text) => {
    try {
        console.log(`[Security Entity Extraction] Using model: ${CYBERSECBERT_MODEL}`);
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add API key if available
        if (HUGGINGFACE_API_KEY) {
            headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
        }
        
        // Retry logic for handling model loading
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await axios.post(
                    CYBERSECBERT_API_URL,
                    {
                        inputs: text,
                        parameters: {
                            // NER task parameters
                            aggregation_strategy: "simple"
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
                        console.log(`[Security Entity Extraction] Model is loading, waiting ${waitTime}ms...`);
                        if (attempt < MAX_RETRIES - 1) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue;
                        }
                    }
                    throw new Error(response.data.error);
                }
                
                // Process and categorize the entities
                const entities = Array.isArray(response.data) ? response.data : [];
                
                // Organize entities by type
                const categorizedEntities = {
                    ipAddresses: [],
                    domains: [],
                    cves: [],
                    malware: [],
                    ports: [],
                    hashes: [],
                    urls: [],
                    other: []
                };
                
                // Regular expressions for security-related entities
                const regexPatterns = {
                    ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
                    ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/,
                    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/i,
                    cve: /\bCVE-\d{4}-\d{4,}\b/i,
                    port: /\b\d{1,5}\b/,
                    md5: /\b[a-fA-F0-9]{32}\b/,
                    sha1: /\b[a-fA-F0-9]{40}\b/,
                    sha256: /\b[a-fA-F0-9]{64}\b/,
                    url: /\bhttps?:\/\/[^\s]+\b/
                };
                
                // Process entities from the NER model
                entities.forEach(entity => {
                    // The dslim/bert-base-NER model returns entities in this format
                    const { entity_group, word } = entity;
                    
                    // First, try to categorize based on entity_group from the model
                    let categorized = false;
                    
                    // For the dslim/bert-base-NER model, we need to do additional processing
                    // as it uses generic entity types like PER, LOC, ORG, MISC
                    
                    // Try to identify security entities using regex patterns
                    if (regexPatterns.ipv4.test(word) || regexPatterns.ipv6.test(word)) {
                        categorizedEntities.ipAddresses.push(word);
                        categorized = true;
                    } else if (regexPatterns.cve.test(word)) {
                        categorizedEntities.cves.push(word);
                        categorized = true;
                    } else if (regexPatterns.md5.test(word) || regexPatterns.sha1.test(word) || regexPatterns.sha256.test(word)) {
                        categorizedEntities.hashes.push(word);
                        categorized = true;
                    } else if (regexPatterns.url.test(word)) {
                        categorizedEntities.urls.push(word);
                        categorized = true;
                    } else if (regexPatterns.domain.test(word)) {
                        categorizedEntities.domains.push(word);
                        categorized = true;
                    } else if (regexPatterns.port.test(word) && parseInt(word) <= 65535) {
                        // Only add as port if it's a valid port number (0-65535)
                        categorizedEntities.ports.push(word);
                        categorized = true;
                    }
                    
                    // If not categorized by regex, use the model's entity_group
                    if (!categorized) {
                        // Map the model's entity types to our categories
                        switch(entity_group) {
                            case 'LOC':
                                // Location could be a domain in security context
                                if (word.includes('.')) {
                                    categorizedEntities.domains.push(word);
                                } else {
                                    categorizedEntities.other.push({
                                        type: 'Location',
                                        value: word
                                    });
                                }
                                break;
                            case 'ORG':
                                // Organization could be a malware group or vendor
                                categorizedEntities.other.push({
                                    type: 'Organization',
                                    value: word
                                });
                                break;
                            case 'PER':
                                // Person names are usually not security entities
                                categorizedEntities.other.push({
                                    type: 'Person',
                                    value: word
                                });
                                break;
                            case 'MISC':
                                // Miscellaneous could include malware names
                                if (/virus|trojan|worm|ransomware|malware|exploit|backdoor/i.test(word)) {
                                    categorizedEntities.malware.push(word);
                                } else {
                                    categorizedEntities.other.push({
                                        type: 'Miscellaneous',
                                        value: word
                                    });
                                }
                                break;
                            default:
                                categorizedEntities.other.push({
                                    type: entity_group,
                                    value: word
                                });
                        }
                    }
                });
                
                // Additional processing: scan the full text for security patterns that the NER model might have missed
                const scanForPatterns = (text, patterns, category) => {
                    for (const [type, regex] of Object.entries(patterns)) {
                        const matches = text.match(new RegExp(regex, 'g')) || [];
                        matches.forEach(match => {
                            // Only add if not already in the category
                            if (!categorizedEntities[category].includes(match)) {
                                categorizedEntities[category].push(match);
                            }
                        });
                    }
                };
                
                // Scan for IPs, domains, CVEs, etc. that might have been missed
                scanForPatterns(text, {
                    ipv4: regexPatterns.ipv4.source,
                    ipv6: regexPatterns.ipv6.source
                }, 'ipAddresses');
                
                scanForPatterns(text, {
                    cve: regexPatterns.cve.source
                }, 'cves');
                
                scanForPatterns(text, {
                    domain: regexPatterns.domain.source
                }, 'domains');
                
                // Look for common malware names in the text
                const malwarePatterns = /\b(emotet|ryuk|wannacry|petya|notpetya|locky|cryptolocker|trickbot|maze|revil|darkside|conti|blackmatter)\b/gi;
                const malwareMatches = text.match(malwarePatterns) || [];
                malwareMatches.forEach(match => {
                    if (!categorizedEntities.malware.includes(match)) {
                        categorizedEntities.malware.push(match);
                    }
                });
                
                // Remove duplicates from all categories
                Object.keys(categorizedEntities).forEach(key => {
                    if (Array.isArray(categorizedEntities[key])) {
                        categorizedEntities[key] = [...new Set(categorizedEntities[key])];
                    }
                });
                
                // Filter out false positives
                // For example, remove common words from domains
                const commonWords = ['com', 'org', 'net', 'io', 'gov', 'edu'];
                categorizedEntities.domains = categorizedEntities.domains.filter(domain => {
                    return !commonWords.includes(domain.toLowerCase());
                });
                
                console.log(`[Security Entity Extraction] Extracted ${entities.length} entities`);
                return categorizedEntities;
                
            } catch (err) {
                lastError = err;
                
                // Handle specific error cases
                if (err.response?.status === 503) {
                    // Model is loading
                    const estimatedTime = err.response.data?.estimated_time || RETRY_DELAY;
                    console.log(`[Security Entity Extraction] Model loading, retry ${attempt + 1}/${MAX_RETRIES} in ${estimatedTime}ms`);
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise(resolve => setTimeout(resolve, estimatedTime));
                        continue;
                    }
                } else if (err.response?.status === 429) {
                    // Rate limit exceeded
                    throw new Error("Entity extraction service is currently busy. Please try again in a moment.");
                } else if (err.code === 'ECONNABORTED') {
                    // Timeout
                    throw new Error("Entity extraction request timed out. Please try again.");
                }
                
                // If it's not a retryable error, throw immediately
                throw err;
            }
        }
        
        // If all retries failed
        throw lastError;

    } catch (err) {
        console.error("[Security Entity Extraction] Error:", err.message);
        throw new Error(`Failed to extract security entities: ${err.message}`);
    }
};

/**
 * Enhanced chatWithAI function that integrates with Hugging Face models
 * Includes fallback mechanisms and improved error handling
 * @param {Object} userM - User object with fullname and username
 * @param {string} message - User's message
 * @returns {Promise<string>} AI response
 */
export const chatWithAI = async (userM, message) => {
    try {
        // Format the user message with identity information
        const Umessage = "Full name: " + userM.fullname + " G24 username: " + userM.username + " message: " + message;
        console.log(`[AI Chat] User: ${userM.username}, Model: ${HUGGINGFACE_MODEL}`);
        
        // Comprehensive system prompt for the G24 AI assistant
        const systemPrompt = `You are G24 AI, a cybersecurity assistant developed by the G24 team. Your username is 'g24_ai'.

Your primary role is to guide users in:
- Ethical hacking and penetration testing
- Cybersecurity best practices and threat mitigation
- Security tool usage and configuration
- Vulnerability assessment and remediation
- Digital forensics and incident response

When providing technical guidance:
1. Always prioritize ethical and legal approaches
2. Explain security concepts clearly for all skill levels
3. Provide practical, actionable advice
4. Include relevant code examples when helpful

When including code, format it inside proper Markdown blocks with HTML-style elements for clarity. Specifically, wrap code in <pre><code class="language-[type]"></code></pre> tags, and ensure a 'copy' button is provided for ease of use.

If asked about the G24 team:
- Lead engineer: Meshack Bahati (expertise in penetration testing and secure coding)
- Co-founder: Mark Waweru (expertise in network security and cryptography)

Every message sent to you includes the user's name and username to help you personalize your responses.`;
        
        // Format prompt for instruct models
        const fullPrompt = `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${Umessage} [/INST]`;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add API key if available (recommended for better rate limits)
        if (HUGGINGFACE_API_KEY) {
            headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
        }
        
        // Retry logic for handling model loading
        let lastError;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await axios.post(
                    HUGGINGFACE_API_URL,
                    {
                        inputs: fullPrompt,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            top_p: 0.9,
                            return_full_text: false,
                            do_sample: true
                        }
                    },
                    { 
                        headers,
                        timeout: MAX_TIMEOUT // Use the MAX_TIMEOUT constant for model loading
                    }
                );
                
                // Handle model loading response
                if (response.data.error) {
                    if (response.data.error.includes('loading') || response.data.estimated_time) {
                        const waitTime = response.data.estimated_time || RETRY_DELAY;
                        console.log(`[AI Chat] Model is loading, waiting ${waitTime}ms...`);
                        if (attempt < MAX_RETRIES - 1) {
                            await new Promise(resolve => setTimeout(resolve, waitTime));
                            continue;
                        }
                    }
                    throw new Error(response.data.error);
                }
                
                // Log successful model response
                console.log(`[AI Chat] Successfully received response from ${HUGGINGFACE_MODEL}`);
                
                // Handle Hugging Face API response format
                let aiResponse;
                if (Array.isArray(response.data) && response.data.length > 0) {
                    // Standard format: [{"generated_text": "..."}]
                    aiResponse = response.data[0].generated_text || response.data[0].text || "";
                } else if (response.data.generated_text) {
                    // Alternative format: {"generated_text": "..."}
                    aiResponse = response.data.generated_text;
                } else if (typeof response.data === 'string') {
                    // Direct string response
                    aiResponse = response.data;
                } else {
                    throw new Error("Invalid response format from AI.");
                }
                
                // Clean up the response - remove prompt if included
                let assistantResponse = aiResponse.trim();
                
                // Remove the prompt template if it was included in response
                if (assistantResponse.includes('[/INST]')) {
                    assistantResponse = assistantResponse.split('[/INST]').pop().trim();
                }
                
                // Remove any remaining prompt artifacts
                assistantResponse = assistantResponse.replace(/^Assistant:\s*/i, '').trim();
                
                if (!assistantResponse) {
                    throw new Error("Empty response from AI.");
                }
                
                console.log(`[AI Chat] Response generated successfully (${assistantResponse.length} chars)`);
                return assistantResponse;
                
            } catch (err) {
                lastError = err;
                
                // Handle specific error cases
                if (err.response?.status === 503) {
                    // Model is loading
                    const estimatedTime = err.response.data?.estimated_time || RETRY_DELAY;
                    console.log(`[AI Chat] Model loading, retry ${attempt + 1}/${MAX_RETRIES} in ${estimatedTime}ms`);
                    if (attempt < MAX_RETRIES - 1) {
                        await new Promise(resolve => setTimeout(resolve, estimatedTime));
                        continue;
                    }
                } else if (err.response?.status === 429) {
                    // Rate limit exceeded
                    throw new Error("AI service is currently busy. Please try again in a moment.");
                } else if (err.code === 'ECONNABORTED') {
                    // Timeout
                    throw new Error("AI request timed out. Please try again.");
                }
                
                // If it's not a retryable error, throw immediately
                throw err;
            }
        }
        
        // If all retries failed with the primary model, try the fallback model
        console.log(`[AI Chat] Primary model ${HUGGINGFACE_MODEL} failed after ${MAX_RETRIES} attempts. Trying fallback model ${FALLBACK_MODEL}...`);
        return await tryFallbackModel(userM, message, systemPrompt);

    } catch (err) {
        console.error("[AI Chat] Error:", err.message);
        
        // Provide more detailed user-friendly error messages
        if (err.message.includes('busy') || err.message.includes('429')) {
            return "G24Sec AI is currently busy due to high demand. Please try again in a moment. If this persists, consider adding a Hugging Face API key for better rate limits.";
        }
        
        if (err.message.includes('timeout') || err.code === 'ECONNABORTED') {
            return "G24Sec AI request timed out. The model might be loading (this can take 20-60 seconds on first use). Please try again in a moment.";
        }
        
        if (err.message.includes('loading')) {
            return "G24Sec AI model is currently loading. This typically takes 20-60 seconds on first use. Please try again shortly.";
        }
        
        if (err.response?.status === 404) {
            return "The selected AI model was not found. Please check your HUGGINGFACE_MODEL environment variable.";
        }
        
        if (err.message === 'FALLBACK_FAILED') {
            return "G24Sec AI is experiencing technical difficulties. Our team has been notified. Please try again later.";
        }
        
        // Generic error message for other cases
        return "G24Sec AI is temporarily unavailable. Please try again in a moment. If the issue persists, check server logs for more details.";
    }
};

/**
 * Attempt to use the fallback model when the primary model fails
 * @param {Object} userM - User object with fullname and username
 * @param {string} message - User's message
 * @param {string} systemPrompt - System prompt for the AI
 * @returns {Promise<string>} AI response from fallback model
 */
async function tryFallbackModel(userM, message, systemPrompt) {
    try {
        const Umessage = "Full name: " + userM.fullname + " G24 username: " + userM.username + " message: " + message;
        console.log(`[AI Chat] Attempting fallback with model: ${FALLBACK_MODEL}`);
        
        // Format prompt for instruct models
        const fullPrompt = `<s>[INST] <<SYS>>\n${systemPrompt}\n<</SYS>>\n\n${Umessage} [/INST]`;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add API key if available
        if (HUGGINGFACE_API_KEY) {
            headers['Authorization'] = `Bearer ${HUGGINGFACE_API_KEY}`;
        }
        
        // Single attempt with the fallback model
        const response = await axios.post(
            FALLBACK_API_URL,
            {
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 500,
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
        
        // Process the response
        let aiResponse;
        if (Array.isArray(response.data) && response.data.length > 0) {
            aiResponse = response.data[0].generated_text || response.data[0].text || "";
        } else if (response.data.generated_text) {
            aiResponse = response.data.generated_text;
        } else if (typeof response.data === 'string') {
            aiResponse = response.data;
        } else {
            throw new Error("Invalid response format from fallback AI.");
        }
        
        // Clean up the response
        let assistantResponse = aiResponse.trim();
        
        if (assistantResponse.includes('[/INST]')) {
            assistantResponse = assistantResponse.split('[/INST]').pop().trim();
        }
        
        assistantResponse = assistantResponse.replace(/^Assistant:\s*/i, '').trim();
        
        if (!assistantResponse) {
            throw new Error("Empty response from fallback AI.");
        }
        
        console.log(`[AI Chat] Fallback model response generated successfully (${assistantResponse.length} chars)`);
        return assistantResponse;
        
    } catch (fallbackErr) {
        console.error("[AI Chat] Fallback model error:", fallbackErr.message);
        throw new Error('FALLBACK_FAILED');
    }
}
