import axios from 'axios';

const FORBIDDEN = /\b(killall|die\s+(you|all)|nigger|fag|retard|fuck|ass)\b/gi;
const KEY       = process.env.PERSPECTIVE_API_KEY;
const THRESHOLD = 0.85;

export async function screenText(text) {
  if (!text) return { ok: false, reason: 'Empty text.' };

  if (FORBIDDEN.test(text))
    return { ok: false, reason: 'Content violates community guidelines (hate-speech).' };

  if (KEY) {
    const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${KEY}`;
    const body = {
      comment: { text },
      requestedAttributes: { TOXICITY: {} },
      languages: ['en'],
    };
    const { data } = await axios.post(url, body);
    const score = data.attributeScores?.TOXICITY?.summaryScore?.value || 0;
    if (score >= THRESHOLD)
      return { ok: false, reason: 'Content appears toxic and cannot be posted.' };
  }
  return { ok: true };
}