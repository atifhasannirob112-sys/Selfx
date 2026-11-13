import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

const cacheDir = path.join(process.cwd(), 'public', 'media', 'voice_cache');
fs.mkdirSync(cacheDir, { recursive: true });

function getHash(text, voice = 'Puck', style = 'energetic') {
  return crypto.createHash('md5').update(text.trim().toLowerCase() + '_' + voice + '_' + style).digest('hex');
}

const PHRASES = [
  "কী অবস্থা নীরব? দিনকাল কেমন যাচ্ছে তোর? মন দিয়া কাজ কর দোস্ত!",
  "এইতো মামা বিন্দাস আছি, তোর দিনকাল কেমন যাইতেছে ক?",
  "আরেহ দোস্ত আছি দারুণ! তোর কী অবস্থা বল?",
  "এইতো ভাই, চিল মোডে আছি! তুই কী করতেছিস?",
  "হেই দোস্ত! কী অবস্থা তোর? মন খুলে বল!",
  "হেই দোস্ত! কী করতেছিস এখন বল?",
  "হ্যাঁ দোস্ত শুনছি, কী হইছে মন খুলে বল!",
  "মামা আছি তো! কী চাস তাড়াতাড়ি ক!",
  "তোর সাথে আড্ডা দিচ্ছি মামা, কোনো কাজকাম থাকলে বল!",
  "শুইনা ভালো লাগলো মামা, এভাবেই চিল মোডে থাকিস!",
  "কী হইছে দোস্ত? কে প্যারা দিলো তোরে, আমারে ক!",
  "আইলসামি বাদ দে মামা, চোখে মুখে পানি দিয়া কাজে বস!",
  "সাবাশ মামা! তাড়াতাড়ি পড়তে বস, ফোকাস নড়চড় করিস না!",
  "সাবাশ দোস্ত! মনোযোগ দিয়ে পড়, পড়া শেষ করে জানাস!",
  "শুভ রাত্রি মামা, ঘুম থেকে উঠে আবার ফায়ার মোডে নামবি!",
  "গভীর শ্বাস নে দোস্ত, ছোট এক কাপ চা খেয়ে ফোকাস কর!",
  "আরেহ থ্যাংকস কিসের দোস্ত! আমি তো তোর বেস্ট ফ্রেন্ড!",
  "আরেহ থ্যাংকস কিসের দোস্ত! চিল কর!",
  "ফায়ার ব্রো! পুরা এনার্জি দিয়ে ওয়ার্কআউট শেষ করবি!",
  "ভালো সিদ্ধান্ত মামা! এক গ্লাস পানি খেয়ে এনার্জি বাড়া!",
  "কিরে দোস্ত, কী খবর তোর? সোজাসাপ্টা ক কী করবি!",
  "আরেহ দোস্ত! আমাকে ডিফল্ট ডিজিটাল অ্যাসিস্ট্যান্ট হিসেবে সিলেক্ট করে নিলি, এখন স্ক্রিনের বাইরে থেকেও ডাকলেই সাথে সাথে হাজির!",
  "শুনছি দোস্ত, মন খুলে বলো..."
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log(`Starting pre-cache generation for ${PHRASES.length} phrases...`);
  for (let i = 0; i < PHRASES.length; i++) {
    const text = PHRASES[i];
    const hash = getHash(text, 'Puck', 'energetic');
    const filePath = path.join(cacheDir, hash + '.wav');
    if (fs.existsSync(filePath)) {
      console.log(`[${i+1}/${PHRASES.length}] Already cached: ${text.substring(0, 25)}`);
      continue;
    }

    try {
      console.log(`[${i+1}/${PHRASES.length}] Generating for: ${text.substring(0, 25)}...`);
      const res = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text,
                speechMetadata: {
                  style: 'Super energetic, enthusiastic, and confident 20-year-old young Bangladeshi man speaking natural colloquial Dhaka Bengali with lively brotherly warmth, real human breath, punchy vocal rhythm, zero robotic tone, and high-energy motivation.'
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }
            }
          }
        }
      });

      const base64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64) {
        fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
        console.log(`Saved ${hash}.wav (${fs.statSync(filePath).size} bytes)`);
      }
      // Wait to respect rate limits
      await sleep(21000);
    } catch (err) {
      console.error(`Error for ${text.substring(0, 20)}:`, err?.message || err);
      await sleep(15000);
    }
  }
  console.log('Pre-cache script completed!');
}

run();
