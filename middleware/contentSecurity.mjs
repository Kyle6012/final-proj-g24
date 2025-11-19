import axios from 'axios';

// Simple rule-based pre-filter (optional but fast)
const FORBIDDEN = /\b(killall|die\s+(you|all)|nigger|fag|retard|fuck|ass)\b/gi;

// Google Perspective API key (set in .env)
const PERSPECTIVE_KEY = process.env.PERSPECTIVE_API_KEY;
const THRESHOLD       = 0.85;   // 0-1  (≥ 85 % toxic is blocked)

/**
 * Middleware: verifyPostContent
 * Runs BEFORE controller.  Blocks on:
 *  1. Regex blacklist
 *  2. Google Perspective (optional)
 *  3. Empty title/content
 */
export async function verifyPostContent(req, res, next) {
  try {
    const { title = '', content = '' } = req.fields || {};
    const text = `${title} ${content}`.trim();

    if (!text) {
      return res.status(400).json({ message: 'Post must contain title or content.' });
    }

    // 1. Fast regex filter
    if (FORBIDDEN.test(text)) {
      return res.status(400).json({ message: 'Content violates community guidelines (hate-speech).' });
    }

    // 2. Perspective (only if key exists)
    if (PERSPECTIVE_KEY) {
      const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_KEY}`;
      const payload = {
        comment: { text },
        requestedAttributes: { TOXICITY: {} },
        languages: ['en'],
      };
      const { data } = await axios.post(url, payload);
      const score = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
      if (score >= THRESHOLD) {
        return res.status(400).json({ message: 'Content appears toxic and cannot be posted.' });
      }
    }

    next(); // all good
  } catch (err) {
    console.error('[ContentSecurity] ', err.message);
    // Fail-closed: block on API error to avoid silent bypass
    return res.status(500).json({ message: 'Content verification unavailable. Try again later.' });
  }
}