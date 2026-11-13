import { AlarmConfig, RingtoneOption } from '../types';

const CLIENT_ID_KEY = 'selfx_alarm_client_id';
const RINGTONE_DB_NAME = 'selfx_alarm_media_db';
const RINGTONE_STORE_NAME = 'ringtones';

export function getOrCreateAlarmClientId(): string {
  try {
    let id = localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = 'selfx_client_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    return 'selfx_client_default';
  }
}

export function getLocalTodayDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// =========================================================================
// 1. IndexedDB Storage for Custom Uploaded Alarm Audio (No 5MB Limit)
// =========================================================================
function openRingtoneDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB unsupported'));
    }
    const req = indexedDB.open(RINGTONE_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(RINGTONE_STORE_NAME)) {
        db.createObjectStore(RINGTONE_STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomRingtoneDB(dataUrl: string): Promise<void> {
  try {
    const db = await openRingtoneDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RINGTONE_STORE_NAME, 'readwrite');
      tx.objectStore(RINGTONE_STORE_NAME).put(dataUrl, 'custom_alarm_audio');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('[alarmUtils] saveCustomRingtoneDB failed:', e);
  }
}

export async function getCustomRingtoneDB(): Promise<string | null> {
  try {
    const db = await openRingtoneDB();
    return await new Promise<string | null>((resolve) => {
      const tx = db.transaction(RINGTONE_STORE_NAME, 'readonly');
      const req = tx.objectStore(RINGTONE_STORE_NAME).get('custom_alarm_audio');
      req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteCustomRingtoneDB(): Promise<void> {
  try {
    const db = await openRingtoneDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(RINGTONE_STORE_NAME, 'readwrite');
      tx.objectStore(RINGTONE_STORE_NAME).delete('custom_alarm_audio');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

// =========================================================================
// 2. Real Looping WAV PCM Generator (Survives Screen Lock & Background)
// =========================================================================
function encodeWavFromSamples(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function buildRingtoneWavBlobUrl(ringtone: RingtoneOption): string {
  const sampleRate = 22050;
  const durationSec = ringtone === 'zen' ? 4.0 : ringtone === 'sunrise_melody' ? 6.0 : 4.0;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const samples = new Float32Array(totalSamples);

  const addNote = (
    startSec: number,
    durSec: number,
    freq: number,
    amp: number,
    type: 'sine' | 'triangle' | 'square' | 'saw' = 'sine',
    harmonicBoost = true
  ) => {
    const startIdx = Math.floor(startSec * sampleRate);
    const lenIdx = Math.floor(durSec * sampleRate);
    for (let i = 0; i < lenIdx && startIdx + i < totalSamples; i++) {
      const t = i / sampleRate;
      const envAttack = Math.min(1, t / 0.025);
      const envRelease = Math.pow(Math.max(0, 1 - t / durSec), 1.4);
      const env = envAttack * envRelease;
      const phase = 2 * Math.PI * freq * t;

      let wave = 0;
      if (type === 'sine') {
        wave = Math.sin(phase);
        if (harmonicBoost) {
          wave += 0.35 * Math.sin(phase * 2) + 0.15 * Math.sin(phase * 3);
        }
      } else if (type === 'triangle') {
        wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
      } else if (type === 'square') {
        wave = Math.sin(phase) >= 0 ? 1 : -1;
      } else {
        wave = 2 * ((freq * t) % 1) - 1;
      }

      samples[startIdx + i] += wave * amp * env;
    }
  };

  if (ringtone === 'sunrise_melody') {
    // Rich uplifting morning chime + warm harmonic chord pulse (6s loop)
    const melody = [
      { t: 0.0, f: 523.25, d: 0.55 }, // C5
      { t: 0.35, f: 659.25, d: 0.55 }, // E5
      { t: 0.7, f: 783.99, d: 0.65 }, // G5
      { t: 1.05, f: 1046.5, d: 0.9 }, // C6
      { t: 1.5, f: 987.77, d: 0.55 }, // B5
      { t: 1.85, f: 783.99, d: 0.8 }, // G5
      { t: 2.5, f: 587.33, d: 0.55 }, // D5
      { t: 2.85, f: 739.99, d: 0.55 }, // F#5
      { t: 3.2, f: 880.0, d: 0.65 }, // A5
      { t: 3.55, f: 1174.66, d: 0.95 }, // D6
      { t: 4.1, f: 1046.5, d: 0.7 }, // C6
      { t: 4.65, f: 783.99, d: 1.1 }, // G5
    ];
    melody.forEach((n) => addNote(n.t, n.d, n.f, 0.42, 'sine', true));
    // Warm bass pulse
    [0.0, 1.5, 2.5, 4.1].forEach((bt, idx) =>
      addNote(bt, 1.1, idx % 2 === 0 ? 261.63 : 293.66, 0.22, 'triangle', false)
    );
  } else if (ringtone === 'gentle_morning') {
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 783.99];
    notes.forEach((f, idx) => addNote(idx * 0.6, 0.75, f, 0.4, 'sine', true));
  } else if (ringtone === 'classic') {
    for (let i = 0; i < 8; i++) {
      addNote(i * 0.5, 0.28, 920, 0.55, 'square', false);
    }
  } else if (ringtone === 'siren') {
    for (let i = 0; i < totalSamples; i++) {
      const t = i / sampleRate;
      const sweep = 680 + Math.sin(t * 2 * Math.PI * 1.5) * 320;
      samples[i] = Math.sin(2 * Math.PI * sweep * t) * 0.65;
    }
  } else if (ringtone === 'military') {
    const bugle = [392, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5];
    bugle.forEach((f, idx) => addNote(idx * 0.48, 0.42, f, 0.52, 'saw', false));
  } else if (ringtone === 'zen') {
    addNote(0.0, 2.0, 523.25, 0.45, 'sine', true);
    addNote(2.0, 2.0, 659.25, 0.45, 'sine', true);
  } else {
    // buzz_badshah / energetic synth
    const notes = [329.63, 392.0, 440.0, 523.25, 493.88, 440.0, 392.0, 523.25];
    notes.forEach((f, idx) => addNote(idx * 0.45, 0.35, f, 0.52, 'triangle', true));
  }

  // Soft limiter to prevent clipping
  for (let i = 0; i < totalSamples; i++) {
    samples[i] = Math.tanh(samples[i]);
  }

  const blob = encodeWavFromSamples(samples, sampleRate);
  return URL.createObjectURL(blob);
}

function buildSilentKeepAliveWavUrl(): string {
  const sampleRate = 8000;
  const samples = new Float32Array(sampleRate * 4); // 4 seconds of near-silence
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.sin((2 * Math.PI * 20 * i) / sampleRate) * 0.0002;
  }
  return URL.createObjectURL(encodeWavFromSamples(samples, sampleRate));
}

// =========================================================================
// 3. Persistent Progressive Wake-Up Alarm Engine
// =========================================================================
class PersistentAlarmEngine {
  private audioEl: HTMLAudioElement | null = null;
  private generatedBlobUrl: string | null = null;
  private audioCtx: AudioContext | null = null;
  private synthIntervalId: any = null;
  private escalationIntervalId: any = null;
  private wakeLockSentinel: any = null;
  private startedAt = 0;
  private escalationEnabled = true;
  private activeRingtone: RingtoneOption = 'sunrise_melody';
  private activeCustomAudio: string | undefined;

  start(
    ringtone: RingtoneOption = 'sunrise_melody',
    customBase64?: string,
    options?: { escalationEnabled?: boolean; onTickSeconds?: (sec: number) => void }
  ) {
    this.stop();
    this.startedAt = Date.now();
    this.activeRingtone = ringtone;
    this.activeCustomAudio = customBase64;
    this.escalationEnabled = options?.escalationEnabled !== false;

    this.acquireWakeLock();
    this.setupMediaSession();

    // Layer A: Real looping HTML5 <audio loop> (most reliable on locked/background phones)
    try {
      let srcUrl: string;
      if (ringtone === 'phone_custom' && customBase64) {
        srcUrl = customBase64;
      } else {
        this.generatedBlobUrl = buildRingtoneWavBlobUrl(ringtone);
        srcUrl = this.generatedBlobUrl;
      }

      const audio = new Audio(srcUrl);
      audio.loop = true;
      (audio as any).playsInline = true;
      audio.volume = this.escalationEnabled ? 0.65 : 1.0;
      audio.play().catch((err) => {
        console.warn('[PersistentAlarmEngine] Primary <audio> play blocked, relying on WebAudio/retry:', err);
      });
      this.audioEl = audio;
    } catch (e) {
      console.warn('[PersistentAlarmEngine] <audio> init warning:', e);
    }

    // Layer B: Web Audio harmonic synthesizer backup + progressive escalation
    this.startSynthesizer(ringtone);

    // Layer C: Progressive escalation + spoken wake-up nudge every 20s (keeps ringing indefinitely until verified!)
    let lastSpokenStage = 0;
    this.escalationIntervalId = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.startedAt) / 1000);
      if (options?.onTickSeconds) options.onTickSeconds(elapsedSec);

      // Keep audio playing if OS paused it
      if (this.audioEl && this.audioEl.paused) {
        this.audioEl.play().catch(() => {});
      }

      if (this.audioEl) {
        if (!this.escalationEnabled) {
          this.audioEl.volume = 1.0;
        } else if (elapsedSec < 15) {
          this.audioEl.volume = 0.65;
        } else if (elapsedSec < 35) {
          this.audioEl.volume = 0.85;
        } else {
          this.audioEl.volume = 1.0;
        }
      }

      // Trigger motivational Bengali wake-up speech alert at 20s, 45s, 75s, 105s...
      if (this.escalationEnabled && elapsedSec >= 20) {
        const speechBucket = Math.floor((elapsedSec - 20) / 25) + 1;
        if (speechBucket > lastSpokenStage) {
          lastSpokenStage = speechBucket;
          this.speakWakeUpCue(elapsedSec);
        }
      }
    }, 1000);
  }

  private speakWakeUpCue(elapsedSec: number) {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      if (window.speechSynthesis.speaking) return;
      const msg =
        elapsedSec >= 60
          ? 'ওঠো! অনেকক্ষণ ধরে এলার্ম বাজছে! বিছানা ছেড়ে দাঁড়িয়ে চোখ সোজা করে সেলফি তোলো!'
          : 'গুড মর্নিং! উঠার সময় হয়েছে। দাঁড়িয়ে চোখ সোজা করে ক্যামেরায় সেলফি তুলে এলার্ম বন্ধ করো!';
      const utter = new SpeechSynthesisUtterance(msg);
      utter.lang = 'bn-BD';
      utter.rate = 1.05;
      utter.volume = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {}
  }

  private startSynthesizer(ringtone: RingtoneOption) {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.audioCtx = new Ctx();
    } catch {
      return;
    }

    let tick = 0;
    this.synthIntervalId = setInterval(() => {
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // After 35 seconds, if escalation is ON and user had gentle ringtone, add energetic high chime accent
      const elapsedSec = Math.floor((Date.now() - this.startedAt) / 1000);
      const volumeScale = !this.escalationEnabled ? 0.45 : elapsedSec > 35 ? 0.85 : elapsedSec > 15 ? 0.6 : 0.35;

      // Skip synth overlay when custom music is playing unless escalating past 40s
      if (ringtone === 'phone_custom' && this.activeCustomAudio && elapsedSec < 40) {
        tick++;
        return;
      }

      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const notes =
          ringtone === 'sunrise_melody' || ringtone === 'gentle_morning'
            ? [523.25, 659.25, 783.99, 1046.5, 987.77, 783.99]
            : ringtone === 'military'
            ? [392, 523.25, 659.25, 783.99]
            : ringtone === 'siren'
            ? [720 + Math.sin(tick * 0.8) * 260]
            : [880, 987.77, 880, 1046.5];

        osc.type = ringtone === 'siren' || ringtone === 'classic' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(notes[tick % notes.length], this.audioCtx.currentTime);
        gain.gain.setValueAtTime(volumeScale * 0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, this.audioCtx.currentTime + 0.42);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.45);
      } catch {}

      tick++;
    }, ringtone === 'zen' ? 1400 : 520);
  }

  private setupMediaSession() {
    try {
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: '🚨 SelfX ওয়েক-আপ এলার্ম',
          artist: 'দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে বন্ধ করুন',
          album: 'SelfX Morning Protocol',
          artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
        });
        navigator.mediaSession.playbackState = 'playing';
        // Refuse accidental pause/stop from lock-screen controls while alarm is active
        navigator.mediaSession.setActionHandler('pause', () => {
          if (this.audioEl && this.startedAt > 0) {
            this.audioEl.play().catch(() => {});
          }
        });
        navigator.mediaSession.setActionHandler('stop', () => {
          if (this.audioEl && this.startedAt > 0) {
            this.audioEl.play().catch(() => {});
          }
        });
      }
    } catch {}
  }

  private async acquireWakeLock() {
    try {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      }
    } catch {}
  }

  stop() {
    this.startedAt = 0;
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
    if (this.escalationIntervalId) {
      clearInterval(this.escalationIntervalId);
      this.escalationIntervalId = null;
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.src = '';
      } catch {}
      this.audioEl = null;
    }
    if (this.generatedBlobUrl) {
      try {
        URL.revokeObjectURL(this.generatedBlobUrl);
      } catch {}
      this.generatedBlobUrl = null;
    }
    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch {}
      this.audioCtx = null;
    }
    if (this.wakeLockSentinel) {
      try {
        this.wakeLockSentinel.release();
      } catch {}
      this.wakeLockSentinel = null;
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
    } catch {}
  }
}

export const persistentAlarmPlayer = new PersistentAlarmEngine();

// =========================================================================
// 4. Background Tab / Lock-Screen Keep-Alive Guard
// =========================================================================
class BackgroundAlarmGuard {
  private silentEl: HTMLAudioElement | null = null;
  private silentUrl: string | null = null;
  private active = false;

  enable(): boolean {
    if (this.active && this.silentEl) {
      if (this.silentEl.paused) {
        this.silentEl.play().catch(() => {});
      }
      return true;
    }
    try {
      this.silentUrl = buildSilentKeepAliveWavUrl();
      const audio = new Audio(this.silentUrl);
      audio.loop = true;
      (audio as any).playsInline = true;
      audio.volume = 0.001;
      audio.play().catch(() => {});
      this.silentEl = audio;
      this.active = true;
      return true;
    } catch {
      return false;
    }
  }

  disable() {
    this.active = false;
    if (this.silentEl) {
      try {
        this.silentEl.pause();
        this.silentEl.src = '';
      } catch {}
      this.silentEl = null;
    }
    if (this.silentUrl) {
      try {
        URL.revokeObjectURL(this.silentUrl);
      } catch {}
      this.silentUrl = null;
    }
  }

  isActive(): boolean {
    return this.active;
  }
}

export const backgroundAlarmGuard = new BackgroundAlarmGuard();

// =========================================================================
// 5. Web Push Subscription + Server & Native Android Alarm Sync
// =========================================================================
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerAlarmPushSubscription(): Promise<PushSubscriptionJSON | null> {
  try {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }
    if ('Notification' in window && Notification.permission !== 'granted') {
      return null;
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const res = await fetch('/api/alarm/vapid-public-key');
      const data = await res.json();
      if (!data?.publicKey) return null;
      const appServerKey = urlBase64ToUint8Array(data.publicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });
    }

    // Also try registering periodic background sync when supported by Chrome Android
    try {
      const anyReg = reg as any;
      if (anyReg.periodicSync && 'permissions' in navigator) {
        const perm = await (navigator.permissions as any).query({ name: 'periodic-background-sync' });
        if (perm.state === 'granted') {
          await anyReg.periodicSync.register('selfx-alarm-check', { minInterval: 15 * 60 * 1000 });
        }
      }
    } catch {}

    return sub.toJSON();
  } catch (e) {
    console.warn('[alarmUtils] Push subscribe warning:', e);
    return null;
  }
}

export async function syncAlarmScheduleToBackend(alarm: AlarmConfig): Promise<{ hasPush: boolean }> {
  const clientId = getOrCreateAlarmClientId();
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // 1. Sync to Native Android AlarmManager if inside Android APK WebView
  try {
    const bridge = (window as any).AndroidNativeBridge;
    if (bridge) {
      if (alarm.enabled && alarm.time && typeof bridge.scheduleNativeAlarm === 'function') {
        const [h, m] = alarm.time.split(':').map((n) => parseInt(n, 10) || 0);
        bridge.scheduleNativeAlarm(h, m, alarm.label || 'SelfX ওয়েক-আপ এলার্ম');
      } else if (!alarm.enabled && typeof bridge.cancelNativeAlarm === 'function') {
        bridge.cancelNativeAlarm();
      }
    }
  } catch {}

  // 2. Sync to PWA Service Worker IndexedDB
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SAVE_ALARM_SCHEDULE',
        schedule: {
          enabled: alarm.enabled,
          time: alarm.time,
          label: alarm.label || 'সকালের ওয়েক-আপ এলার্ম',
          lastDismissedDate: alarm.lastDismissedDate || '',
        },
      });
    }
  } catch {}

  // 3. Subscribe Web Push (if Notification granted) and save schedule to backend server
  let subscription: PushSubscriptionJSON | null = null;
  if (alarm.enabled) {
    subscription = await registerAlarmPushSubscription();
  }

  try {
    const res = await fetch('/api/alarm/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        time: alarm.time,
        enabled: alarm.enabled,
        label: alarm.label || 'সকালের ওয়েক-আপ এলার্ম',
        ringtone: alarm.ringtone,
        timezoneOffsetMinutes,
        subscription,
        lastDismissedDate: alarm.lastDismissedDate,
      }),
    });
    const data = await res.json();
    return { hasPush: Boolean(data?.hasPushSubscription) };
  } catch {
    return { hasPush: Boolean(subscription) };
  }
}

export async function notifyBackendAlarmDismissed(): Promise<void> {
  const clientId = getOrCreateAlarmClientId();
  const todayStr = getLocalTodayDateStr();

  try {
    const bridge = (window as any).AndroidNativeBridge;
    if (bridge && typeof bridge.stopNativeAlarmService === 'function') {
      bridge.stopNativeAlarmService();
    }
  } catch {}

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SAVE_ALARM_SCHEDULE',
        schedule: { lastDismissedDate: todayStr },
      });
    }
  } catch {}

  try {
    await fetch('/api/alarm/dismissed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, dateStr: todayStr }),
    });
  } catch {}
}

export async function sendTestAlarmPush(delaySeconds = 0, timeLabel?: string): Promise<{ ok: boolean; message: string }> {
  try {
    const clientId = getOrCreateAlarmClientId();
    const subscription = await registerAlarmPushSubscription();
    if (!subscription) {
      return {
        ok: false,
        message: 'প্রথমে ব্রাউজারের Notification Permission অন করুন।',
      };
    }

    const res = await fetch('/api/alarm/test-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        subscription,
        delaySeconds,
        time: timeLabel || 'TEST',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      return { ok: false, message: data?.error || 'Push পাঠানো যায়নি।' };
    }
    return {
      ok: true,
      message: data.message || 'টেস্ট পুশ পাঠানো হয়েছে! স্ক্রিন লক বা অ্যাপের বাইরে থাকলেও নোটিফিকেশন আসবে।',
    };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'নেটওয়ার্ক ত্রুটি।' };
  }
}
