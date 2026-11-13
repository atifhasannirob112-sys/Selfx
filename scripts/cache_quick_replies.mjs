import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const cacheDir = path.join(process.cwd(), 'public', 'media', 'voice_cache');
fs.mkdirSync(cacheDir, { recursive: true });

const PHRASES = [
  "হেই দোস্ত! কী খবর তোর? দিনকাল কেমন যাচ্ছে বল!",
  "হেই দোস্ত! কী অবস্থা তোর? মন খুলে বল!",
  "এইতো মামা বিন্দাস আছি! তোর কী হাল বল?",
  "আরেহ দোস্ত আছি দারুণ! তোর দিনকাল কেমন চলছে?",
  "কী অবস্থা দোস্ত! দিনকাল কেমন যাচ্ছে? কোনো হেল্প লাগলে বল!",
  "এইতো ভাই, চিল মোডে আছি! তোর কী খবর বল?",
  "আরেহ থ্যাংকস কিসের দোস্ত! আমি তো তোর বেস্ট ফ্রেন্ড!",
  "আরেহ থ্যাংকস কিসের দোস্ত! চিল কর!",
  "দোস্ত তোর কথাটা শুনলাম! বল কী করতে পারি তোর জন্য?",
  "সাবাশ দোস্ত! তুই কাজের মানুষ, এক টানে কাজ শেষ করে ফেললি!"
];

const VOICES = [
  {
    name: 'Fenrir',
    style: 'Deep, confident, cool 22-year-old male best friend with a commanding masculine baritone voice, authentic colloquial Dhaka Bengali, charismatic alpha presence, calm confidence, brotherly loyalty, real human breath, punchy vocal rhythm, zero robotic tone, and supreme masculine charm.'
  },
  {
    name: 'Puck',
    style: 'Super energetic, enthusiastic, and confident 20-year-old young Bangladeshi male best friend speaking natural colloquial Dhaka Bengali with lively brotherly warmth, real human breath, punchy vocal rhythm, zero robotic tone, and high-energy motivation.'
  }
];

async function run() {
  console.log(`Starting pre-cache of ${PHRASES.length} phrases for ${VOICES.length} voices...`);
  for (const v of VOICES) {
    for (const phrase of PHRASES) {
      const norm = phrase.replace(/[*#_~`\[\]()\-+]/g, '').trim().toLowerCase();
      const hash = crypto.createHash('md5').update(norm + '_' + v.name + '_energetic').digest('hex');
      const fp = path.join(cacheDir, hash + '.wav');
      if (fs.existsSync(fp)) {
        console.log(`Already cached [${v.name}]: ${phrase.substring(0, 20)}`);
        continue;
      }
      try {
        console.log(`Generating [${v.name}]: ${phrase.substring(0, 25)}...`);
        const res = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [{
            role: 'user',
            parts: [{ text: phrase, speechMetadata: { style: v.style } }]
          }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v.name } } }
          }
        });
        const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (b64) {
          fs.writeFileSync(fp, Buffer.from(b64, 'base64'));
          console.log(`Saved [${v.name}] -> ${hash}.wav (${fs.statSync(fp).size} bytes)`);
        }
      } catch (err) {
        console.warn(`Error generating for [${v.name}] ${phrase.substring(0, 20)}:`, err?.message || err);
      }
    }
  }
  console.log('Pre-caching quick replies finished!');
}

run();
