import express from "express";
import fs from "fs";
import path from "path";
import * as webpushPkg from "web-push";
import { GoogleGenAI, Type } from "@google/genai";

const webpush = ((webpushPkg as any).default || webpushPkg) as typeof import("web-push");

interface StoredAlarmSchedule {
  clientId: string;
  time: string; // "HH:MM"
  enabled: boolean;
  label?: string;
  ringtone?: string;
  timezoneOffsetMinutes: number; // JS Date.getTimezoneOffset() (UTC - Local in mins)
  subscription?: any;
  lastFiredKey?: string; // "YYYY-MM-DD_HH:MM"
  lastFollowupCount?: number;
  lastFollowupSentAt?: number;
  lastDismissedDate?: string; // "YYYY-MM-DD"
  updatedAt: number;
}

const VAPID_FILE = path.join(process.cwd(), "alarm_vapid_keys.json");
const SCHEDULES_FILE = path.join(process.cwd(), "alarm_schedules.json");

function loadOrCreateVapidKeys(): { publicKey: string; privateKey: string } {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    return {
      publicKey: process.env.VAPID_PUBLIC_KEY,
      privateKey: process.env.VAPID_PRIVATE_KEY,
    };
  }
  try {
    if (fs.existsSync(VAPID_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
      if (parsed?.publicKey && parsed?.privateKey) {
        return { publicKey: parsed.publicKey, privateKey: parsed.privateKey };
      }
    }
  } catch (e) {}

  const keys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(VAPID_FILE, JSON.stringify(keys, null, 2));
  } catch (e) {
    console.warn("[alarmServer] Could not persist VAPID keys:", e);
  }
  return keys;
}

function readSchedules(): Record<string, StoredAlarmSchedule> {
  try {
    if (fs.existsSync(SCHEDULES_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SCHEDULES_FILE, "utf8"));
      if (raw && typeof raw === "object") return raw;
    }
  } catch (e) {}
  return {};
}

function writeSchedules(map: Record<string, StoredAlarmSchedule>) {
  try {
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(map, null, 2));
  } catch (e) {
    console.warn("[alarmServer] Failed to write schedules:", e);
  }
}

function getClientLocalParts(timezoneOffsetMinutes: number, nowMs: number = Date.now()) {
  // JS getTimezoneOffset() returns (UTC - Local) in minutes, e.g., -360 for UTC+6.
  const offset = Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : -360;
  const localDateObj = new Date(nowMs - offset * 60_000);
  const year = localDateObj.getUTCFullYear();
  const month = String(localDateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localDateObj.getUTCDate()).padStart(2, "0");
  const hours = String(localDateObj.getUTCHours()).padStart(2, "0");
  const minutes = String(localDateObj.getUTCMinutes()).padStart(2, "0");
  return {
    dateStr: `${year}-${month}-${day}`,
    hhmm: `${hours}:${minutes}`,
    totalMinutes: localDateObj.getUTCHours() * 60 + localDateObj.getUTCMinutes(),
  };
}

function normalizeHHMM(rawTime: string): string {
  const parts = String(rawTime || "05:30").split(":");
  const h = String(Math.min(23, Math.max(0, parseInt(parts[0] || "5", 10) || 0))).padStart(2, "0");
  const m = String(Math.min(59, Math.max(0, parseInt(parts[1] || "30", 10) || 0))).padStart(2, "0");
  return `${h}:${m}`;
}

export function registerAlarmRoutes(app: express.Express, ai: GoogleGenAI) {
  const vapid = loadOrCreateVapidKeys();
  try {
    webpush.setVapidDetails("mailto:alarm@selfx.app", vapid.publicKey, vapid.privateKey);
  } catch (e) {
    console.warn("[alarmServer] Failed to configure webpush VAPID:", e);
  }

  let schedulesCache: Record<string, StoredAlarmSchedule> = readSchedules();

  async function sendAlarmPush(
    schedule: StoredAlarmSchedule,
    isFollowup: boolean = false,
    attemptNum: number = 1
  ): Promise<boolean> {
    if (!schedule.subscription || !schedule.subscription.endpoint) return false;
    const payload = JSON.stringify({
      type: "ALARM_RING",
      title: isFollowup
        ? `🚨 (${attemptNum}) এখনো ওঠেননি! এলার্ম বাজছে!`
        : `🚨 SelfX এলার্ম (${schedule.time})`,
      body: schedule.label
        ? `${schedule.label} — দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে এলার্ম বন্ধ করুন!`
        : "ঘুম থেকে উঠুন! দাঁড়িয়ে চোখ সোজা করে ক্যামেরায় সেলফি তুলে এলার্ম বন্ধ করুন।",
      time: schedule.time,
      ringtone: schedule.ringtone || "sunrise_melody",
      url: "/?alarm_ring=1",
      triggeredAt: Date.now(),
    });

    try {
      await webpush.sendNotification(schedule.subscription, payload, {
        TTL: 300,
        urgency: "high",
      });
      return true;
    } catch (err: any) {
      const code = err?.statusCode;
      if (code === 404 || code === 410) {
        // Subscription expired/gone; keep schedule metadata but drop stale subscription
        if (schedulesCache[schedule.clientId]) {
          delete schedulesCache[schedule.clientId].subscription;
          writeSchedules(schedulesCache);
        }
      } else {
        console.warn("[alarmServer] Web push send error:", err?.message || err);
      }
      return false;
    }
  }

  // Background alarm push checker (runs every 10s so closed/background PWAs wake up on exact time)
  const intervalHandle = setInterval(async () => {
    const nowMs = Date.now();
    let changed = false;

    for (const id of Object.keys(schedulesCache)) {
      const s = schedulesCache[id];
      if (!s || !s.enabled || !s.time || !s.subscription?.endpoint) continue;

      const targetTime = normalizeHHMM(s.time);
      const local = getClientLocalParts(s.timezoneOffsetMinutes, nowMs);

      if (s.lastDismissedDate === local.dateStr) continue;

      const fireKey = `${local.dateStr}_${targetTime}`;

      // 1. Exact minute fire
      if (local.hhmm === targetTime && s.lastFiredKey !== fireKey) {
        s.lastFiredKey = fireKey;
        s.lastFollowupCount = 0;
        s.lastFollowupSentAt = nowMs;
        changed = true;
        sendAlarmPush(s, false, 1).catch(() => {});
        continue;
      }

      // 2. Persistent outside-app wake-up nudges (+75s and +165s after fire if not dismissed yet)
      if (
        s.lastFiredKey === fireKey &&
        s.lastFollowupSentAt &&
        (s.lastFollowupCount || 0) < 3 &&
        nowMs - s.lastFollowupSentAt >= 70_000
      ) {
        const nextCount = (s.lastFollowupCount || 0) + 1;
        s.lastFollowupCount = nextCount;
        s.lastFollowupSentAt = nowMs;
        changed = true;
        sendAlarmPush(s, true, nextCount + 1).catch(() => {});
      }
    }

    if (changed) {
      writeSchedules(schedulesCache);
    }
  }, 10_000);

  if (typeof intervalHandle.unref === "function") {
    intervalHandle.unref();
  }

  // 1. Public VAPID Key for browser PushManager.subscribe
  app.get("/api/alarm/vapid-public-key", (_req, res) => {
    res.json({ success: true, publicKey: vapid.publicKey });
  });

  // 2. Sync/Save alarm schedule + push subscription
  app.post("/api/alarm/schedule", (req, res) => {
    try {
      const {
        clientId,
        time,
        enabled,
        label,
        ringtone,
        timezoneOffsetMinutes,
        subscription,
        lastDismissedDate,
      } = req.body || {};

      if (!clientId || typeof clientId !== "string") {
        return res.status(400).json({ success: false, error: "clientId is required" });
      }

      const prev = schedulesCache[clientId];
      const normTime = normalizeHHMM(time || prev?.time || "05:30");
      const timeChanged = prev && prev.time !== normTime;

      const updated: StoredAlarmSchedule = {
        clientId,
        time: normTime,
        enabled: Boolean(enabled),
        label: label || prev?.label || "সকালের ওয়েক-আপ এলার্ম",
        ringtone: ringtone || prev?.ringtone || "sunrise_melody",
        timezoneOffsetMinutes:
          typeof timezoneOffsetMinutes === "number"
            ? timezoneOffsetMinutes
            : prev?.timezoneOffsetMinutes ?? -360,
        subscription: subscription?.endpoint ? subscription : prev?.subscription,
        lastFiredKey: timeChanged ? undefined : prev?.lastFiredKey,
        lastFollowupCount: timeChanged ? 0 : prev?.lastFollowupCount,
        lastDismissedDate:
          typeof lastDismissedDate === "string"
            ? lastDismissedDate
            : timeChanged
            ? undefined
            : prev?.lastDismissedDate,
        updatedAt: Date.now(),
      };

      schedulesCache[clientId] = updated;
      writeSchedules(schedulesCache);

      res.json({
        success: true,
        hasPushSubscription: Boolean(updated.subscription?.endpoint),
        time: updated.time,
        enabled: updated.enabled,
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Failed to save alarm schedule" });
    }
  });

  // 3. Mark today's alarm as dismissed after verified selfie
  app.post("/api/alarm/dismissed", (req, res) => {
    try {
      const { clientId, dateStr } = req.body || {};
      if (!clientId || !schedulesCache[clientId]) {
        return res.json({ success: true });
      }
      const local = getClientLocalParts(schedulesCache[clientId].timezoneOffsetMinutes);
      schedulesCache[clientId].lastDismissedDate = dateStr || local.dateStr;
      schedulesCache[clientId].lastFollowupCount = 99;
      writeSchedules(schedulesCache);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Failed" });
    }
  });

  // 4. Send an immediate Test Push Notification (for testing outside the app)
  app.post("/api/alarm/test-push", async (req, res) => {
    try {
      const { clientId, subscription, delaySeconds = 0, time } = req.body || {};
      const targetSub = subscription?.endpoint
        ? subscription
        : clientId && schedulesCache[clientId]?.subscription;

      if (!targetSub?.endpoint) {
        return res.status(400).json({
          success: false,
          error: "Push subscription পাওয়া যায়নি। নোটিফিকেশন পারমিশন অন করে আবার চেষ্টা করুন।",
        });
      }

      const sendNow = async () => {
        const tempSchedule: StoredAlarmSchedule = {
          clientId: clientId || "test",
          time: time || "TEST",
          enabled: true,
          label: "বাইরে থেকে টেস্ট এলার্ম! সেলফি দিয়ে বন্ধ করুন",
          timezoneOffsetMinutes: -360,
          subscription: targetSub,
          updatedAt: Date.now(),
        };
        return await sendAlarmPush(tempSchedule, false, 1);
      };

      const delayMs = Math.min(30_000, Math.max(0, Number(delaySeconds) * 1000 || 0));
      if (delayMs > 0) {
        setTimeout(() => {
          sendNow().catch(() => {});
        }, delayMs);
        return res.json({
          success: true,
          scheduled: true,
          delaySeconds: Math.round(delayMs / 1000),
          message: `${Math.round(delayMs / 1000)} সেকেন্ড পর ব্যাকগ্রাউন্ড পুশ পাঠানো হবে! এখন অ্যাপ মিনিমাইজ বা বন্ধ করতে পারেন।`,
        });
      }

      const ok = await sendNow();
      if (!ok) {
        return res.status(502).json({
          success: false,
          error: "Push ডেলিভারি ব্যর্থ হয়েছে। ব্রাউজার নোটিফিকেশন ও ইন্টারনেট চেক করুন।",
        });
      }
      res.json({ success: true, sent: true });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Test push failed" });
    }
  });

  // 5. Standing + Eyes Open + Looking Straight Selfie Verification via Gemini Vision
  app.post("/api/alarm/verify-wakeup-selfie", async (req, res) => {
    try {
      const { imageBase64 } = req.body || {};
      if (!imageBase64 || typeof imageBase64 !== "string") {
        return res.status(400).json({
          success: false,
          verified: false,
          error: "সেলফি ছবি পাওয়া যায়নি। ক্যামেরা দিয়ে ছবি তুলুন।",
        });
      }

      const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      const mimeType = match ? match[1] : "image/jpeg";
      const cleanBase64 = match ? match[2] : imageBase64.replace(/^data:image\/\w+;base64,/, "");

      if (cleanBase64.length < 1500) {
        return res.status(400).json({
          success: false,
          verified: false,
          reasonBn: "ছবিটি অস্পষ্ট বা ফাঁকা মনে হচ্ছে। পর্যাপ্ত আলোতে দাঁড়িয়ে আবার সেলফি তুলুন।",
          checklist: {
            faceDetected: false,
            eyesOpenStraight: false,
            standingPosture: false,
            goodLighting: false,
          },
        });
      }

      const promptText = `You are a strict Wake-Up Alarm Anti-Cheat Vision Verifier.
The user MUST be physically awake, STANDING UP out of bed, with BOTH EYES CLEARLY OPEN and LOOKING STRAIGHT at the front camera to turn off their morning alarm.

Inspect this selfie carefully and evaluate ALL 4 rules honestly:
1. faceDetected: Is there a real, clear, live human face visible (NOT a blank wall, dark ceiling, hand covering the camera, pillow, or photo of a phone/monitor screen)?
2. eyesOpenStraight: Are BOTH eyes visibly open, alert, and looking straight/directly toward the camera lens with an upright head? (If eyes are closed, squinting in sleep, looking sideways/down, or wearing dark sunglasses -> false).
3. standingPosture: Does the head angle, shoulder/upper-body framing, and background indicate the person is UPRIGHT / STANDING UP out of bed? (If lying down on a pillow, head resting on mattress/bedsheet, blanket pulled up around neck in bed, or ceiling-view from lying flat on back -> false!). Note: If upper torso/shoulders are upright against a vertical room/wall/door/standing background with no pillow/bed directly behind the head, return true.
4. goodLighting: Is there enough light to clearly see the face and open eyes?

Set "verified": true ONLY if faceDetected == true AND eyesOpenStraight == true AND standingPosture == true AND goodLighting == true AND confidence >= 65.
Provide a direct, helpful, encouraging Bengali message in "reasonBn" telling the user either congratulations (if verified) or EXACTLY what failed (e.g., lying down/pillow visible, eyes closed/not looking straight, too dark, face not visible).`;

      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: {
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: promptText },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              faceDetected: { type: Type.BOOLEAN },
              eyesOpenStraight: { type: Type.BOOLEAN },
              standingPosture: { type: Type.BOOLEAN },
              goodLighting: { type: Type.BOOLEAN },
              reasonBn: { type: Type.STRING },
            },
            required: [
              "verified",
              "confidence",
              "faceDetected",
              "eyesOpenStraight",
              "standingPosture",
              "goodLighting",
              "reasonBn",
            ],
          },
        },
      });

      const rawText = (response.text ?? "{}").trim();
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        const brace = rawText.indexOf("{");
        const end = rawText.lastIndexOf("}");
        if (brace !== -1 && end > brace) {
          parsed = JSON.parse(rawText.slice(brace, end + 1));
        }
      }

      const faceDetected = Boolean(parsed.faceDetected);
      const eyesOpenStraight = Boolean(parsed.eyesOpenStraight);
      const standingPosture = Boolean(parsed.standingPosture);
      const goodLighting = Boolean(parsed.goodLighting);
      const confidence = Number(parsed.confidence ?? 0);

      const finalVerified =
        Boolean(parsed.verified) &&
        faceDetected &&
        eyesOpenStraight &&
        standingPosture &&
        goodLighting &&
        confidence >= 60;

      let reasonBn = typeof parsed.reasonBn === "string" ? parsed.reasonBn.trim() : "";
      if (!reasonBn) {
        if (finalVerified) {
          reasonBn = "✅ দারুণ! আপনি দাঁড়িয়ে চোখ সোজা করে সফলভাবে ভেরিফাই হয়েছেন। শুভ সকাল!";
        } else if (!faceDetected) {
          reasonBn = "❌ ক্যামেরায় আপনার মুখ স্পষ্ট দেখা যাচ্ছে না। সরাসরি ক্যামেরার সামনে আসুন।";
        } else if (!goodLighting) {
          reasonBn = "❌ আলো অনেক কম! রুমের লাইট অন করে আবার সেলফি তুলুন।";
        } else if (!standingPosture) {
          reasonBn = "❌ আপনাকে এখনো শোয়া/বসা বা বালিশে হেলান দেওয়া অবস্থায় মনে হচ্ছে — বিছানা ছেড়ে উঠে দাঁড়িয়ে সেলফি দিন!";
        } else if (!eyesOpenStraight) {
          reasonBn = "❌ চোখ পুরোপুরি খুলে সরাসরি ক্যামেরার লেন্সের দিকে সোজা তাকান!";
        } else {
          reasonBn = "❌ যাচাই সম্পন্ন হয়নি। সোজা হয়ে দাঁড়িয়ে চোখ খুলে আরেকটি পরিষ্কার সেলফি দিন।";
        }
      }

      return res.json({
        success: true,
        verified: finalVerified,
        confidence,
        reasonBn,
        checklist: {
          faceDetected,
          eyesOpenStraight,
          standingPosture,
          goodLighting,
        },
      });
    } catch (err: any) {
      console.error("[alarmServer] verify-wakeup-selfie error:", err?.message || err);
      return res.status(502).json({
        success: false,
        verified: false,
        error: "AI সেলফি যাচাইয়ে সাময়িক সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      });
    }
  });
}
