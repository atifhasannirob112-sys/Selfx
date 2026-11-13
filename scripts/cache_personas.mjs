import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const cacheDir = path.join(process.cwd(), 'public', 'media', 'voice_cache');
fs.mkdirSync(cacheDir, { recursive: true });

const voices = [
  {
    name: 'Fenrir',
    sample: 'কী অবস্থা দোস্ত! কোনো চিন্তা করিস না, সোজা হয়ে দাঁড়া। নিজের লক্ষ্যে ফোকাস কর!',
    style: 'Deep, confident, cool 22-year-old male best friend with a commanding masculine baritone voice, authentic colloquial Dhaka Bengali, charismatic alpha presence, calm confidence, brotherly loyalty, real human breath, punchy vocal rhythm, zero robotic tone, and supreme masculine charm.'
  },
  {
    name: 'Puck',
    sample: 'কী অবস্থা দোস্ত! পুরা ফায়ার মোডে কাজ করবি, চিল কর!',
    style: 'Super energetic, enthusiastic, and confident 20-year-old young Bangladeshi male best friend speaking natural colloquial Dhaka Bengali with lively brotherly warmth, real human breath, punchy vocal rhythm, zero robotic tone, and high-energy motivation.'
  },
  {
    name: 'Charon',
    sample: 'ধৈর্য রাখো দোস্ত, শান্ত মাথায় পরিকল্পনামতো কাজ শেষ করো।',
    style: 'Deep, calm, wise, and confident 23-year-old male leader and best friend speaking natural colloquial Bengali with rich baritone clarity, inspiring personality, grounded composure, and mature brotherly care.'
  },
  {
    name: 'Zephyr',
    sample: 'আরেহ প্যারা নাই দোস্ত! চলো কাজটা এখনই উড়িয়ে দিই!',
    style: 'Fast, witty, sharp, modern young male best friend speaking colloquial Bengali with playful swagger, bright cadence, and spontaneous human laughter and pauses.'
  }
];

async function run() {
  for (const v of voices) {
    const norm = v.sample.replace(/[*#_~`\[\]()\-+]/g, '').trim().toLowerCase();
    const hash = crypto.createHash('md5').update(norm + '_' + v.name + '_energetic').digest('hex');
    const fp = path.join(cacheDir, hash + '.wav');
    console.log(`Generating voice sample for ${v.name} -> ${hash}.wav`);
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [{
          role: 'user',
          parts: [{ text: v.sample, speechMetadata: { style: v.style } }]
        }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: v.name } } }
        }
      });
      const b64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (b64) {
        fs.writeFileSync(fp, Buffer.from(b64, 'base64'));
        console.log(`Saved ${v.name}: ${fp} (${fs.statSync(fp).size} bytes)`);
      }
    } catch (err) {
      console.error(`Error for ${v.name}:`, err?.message || err);
    }
  }
  console.log('All persona samples processed successfully!');
}

run();
