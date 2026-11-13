import { MathProblem, HabitItem, RingtoneOption } from './types';
import { persistentAlarmPlayer } from './utils/alarmUtils';

export const alarmPlayer = {
  start(
    ringtone: RingtoneOption = 'sunrise_melody',
    customBase64?: string,
    options?: { escalationEnabled?: boolean; onTickSeconds?: (sec: number) => void }
  ) {
    persistentAlarmPlayer.start(ringtone, customBase64, options);
  },
  stop() {
    persistentAlarmPlayer.stop();
  }
};

// Generate a random math problem (simplified to only addition and subtraction as requested)
export function generateMathProblem(): MathProblem {
  const operations = ['+', '-'];
  const op = operations[Math.floor(Math.random() * operations.length)];
  let num1 = 0;
  let num2 = 0;
  let question = '';
  let answer = 0;

  if (op === '+') {
    num1 = Math.floor(Math.random() * 89) + 10; // e.g., 10 to 98
    num2 = Math.floor(Math.random() * 89) + 10; // e.g., 10 to 98
    question = `${num1} + ${num2}`;
    answer = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 89) + 10; // e.g., 10 to 98
    num2 = Math.floor(Math.random() * (num1 - 5)) + 5; // ensure positive and simple
    question = `${num1} - ${num2}`;
    answer = num1 - num2;
  }

  return { question, answer };
}

// Initial default habits builder
export const defaultHabits: HabitItem[] = [
  {
    id: 'hair-care',
    name: 'Hair Care',
    description: 'Scalp massage, oil treatments, cleansing, or brushing routine.',
    completed: false
  },
  {
    id: 'skin-care',
    name: 'Skin Care',
    description: 'Cleanse, moisturizer, active serums (retinol/vitamin C), and daily SPF.',
    completed: false
  },
  {
    id: 'body-fitness',
    name: 'Body Fitness',
    description: 'Core workout, strength lifting, posture work, or target body drills.',
    completed: false
  },
  {
    id: 'walk-run',
    name: 'Walk/Run (10k steps)',
    description: 'Get moving outdoor or tread mill, check smartband steps tracker.',
    completed: false
  },
  {
    id: 'face-exercises',
    name: 'Face Exercises',
    description: 'Mewing, jawline exercises, gua sha treatment, or lymphatic drainage.',
    completed: false
  },
  {
    id: 'talk-less',
    name: 'Talk Less/Listen More',
    description: 'Focus on thoughtful speaking, visual mystery, and active daily listening.',
    completed: false
  }
];

// Helper to check standard browser notification support and status
export function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve('unsupported');
}

// Dedicated High-Priority Lock Screen & OS Alarm Trigger
export function triggerOSAlarmNotification(title: string, body: string) {
  // 1. Trigger Vibration Pattern for mobile devices
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([600, 200, 600, 200, 800, 300, 1000]);
    } catch {}
  }

  // 2. Dispatch in-app event
  try {
    const event = new CustomEvent('in-app-notification', {
      detail: { title, body, timestamp: new Date(), isAlarm: true }
    });
    window.dispatchEvent(event);
  } catch {}

  // 3. Dispatch System & Lock-Screen Notification via Service Worker or Desktop Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const options: any = {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'selfx_alarm_' + Date.now(),
      requireInteraction: true,
      silent: false,
      renotify: true,
      vibrate: [600, 200, 600, 200, 800, 300, 1000]
    };

    // If ServiceWorker is active, use showNotification and postMessage for maximum background & mobile lockscreen reliability
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        try {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options
          });
        } catch {}
      }
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, options).catch(() => {
          try {
            new Notification(title, options);
          } catch {}
        });
      }).catch(() => {
        try {
          if (Notification.permission === 'granted') {
            new Notification(title, options);
          }
        } catch {}
      });
    } else if (Notification.permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (err) {
        console.warn("Direct notification spawn error:", err);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          try {
            new Notification(title, options);
          } catch {}
        }
      });
    }
  }
}

// Formats OS lock screen and notification shade alerts with concise, premium Bengali typography
export function formatBengaliLockNotification(rawTitle: string, rawBody: string): { title: string; body: string } {
  let title = rawTitle.trim();
  let body = rawBody.trim();

  const lowerT = title.toLowerCase();
  if (lowerT.includes('alarm') || title.includes('🚨') || title.includes('জাগুন')) {
    title = '✦ SelfX • জাগ্রত হোন';
  } else if (lowerT.includes('decree') || title.includes('ডিক্রি') || title.includes('কাজের সময়') || title.includes('নির্ধারিত কাজ')) {
    title = '✦ SelfX • কাজের তাগিদ';
  } else if (lowerT.includes('fajr') || lowerT.includes('prayer') || title.includes('সালাত') || title.includes('নামাজ')) {
    title = '✦ SelfX • সালাতের সময়';
  } else if (lowerT.includes('water') || title.includes('পানি') || lowerT.includes('hydrate')) {
    title = '✦ SelfX • পানি পান';
  } else if (lowerT.includes('gym') || lowerT.includes('workout') || title.includes('ব্যায়াম')) {
    title = '✦ SelfX • ওয়ার্কআউট স্মরণ';
  } else if (!title.startsWith('✦')) {
    title = `✦ SelfX • ${title}`;
  }

  // Ensure concise, premium body text suitable for Android/iOS lock screens
  if (body.length > 120) {
    body = body.slice(0, 117) + '...';
  }

  return { title, body };
}

/**
 * Evaluates whether a notification is an important alert or a genuine work/task reminder.
 * Prevents non-essential clutter / spam notifications from popping up on the user's screen or lock screen.
 */
export function isImportantOrWorkReminder(title: string = '', body: string = ''): boolean {
  if (!title && !body) return false;
  const t = (title || '').toLowerCase();
  const b = (body || '').toLowerCase();
  const combined = `${t} ${b}`;

  // 1. Clutter & spam blacklists that should NEVER popup on the display or sound chime
  const clutterKeywords = [
    'নেভিগেশন', 'navigation',
    'লাইক', 'like', '👍',
    'কপি', 'copied', 'clipboard', 'ক্লিপবোর্ড', 'পেস্ট',
    'xp', 'লেভেল আপ', 'level up',
    'অ্যালবাম', 'album', 'music saved', 'music deleted',
    'ডিলিট অপশন আনলক',
    'ক্রোম ট্যাব', 'chrome tab', 'লিংক কপি',
    'রিফ্রেশ সফল', 'refresh',
    'ai dj scanning',
    'ইন্সটলেশন', 'ইনস্টল সম্পন্ন', 'শর্টকাট রিমুভড', 'add to home screen',
    'অনলাইনে আছেন', 'অফলাইনে আছেন',
    'ভাষা পরিবর্তন', 'language switched',
    'ক্রাশ তালিকায়', 'crush',
    'স্বাগতম দোস্ত', 'নোটিফিকেশন চালু হইছে', 'notifications active',
    'সাউন্ড টেস্ট', 'ভেরিফিকেশন কোড', 'থিম ও ইন্টারফেস পরিবর্তন',
    'ছবি লোড হয়েছে', 'ছবি রিসেট', 'পাসওয়ার্ড সফলভাবে সেট', 'পাসওয়ার্ড পরিবর্তিত',
    'প্রোফাইল ওপেন', 'মেম্বার পাওয়া', 'আইডি পাওয়া যায়নি', 'chat opened', 'চ্যাট শুরু হয়েছে',
    'ভিডিও সনাক্ত', 'ভিডিও সিরিয়াল', 'video loaded', 'video too large',
    'story image', 'photo optimized', 'music removed', 'music linked', 'music selected',
    'শেয়ার করুন', 'ডাউনলোড', 'bio updated', 'friend request', 'friends connected',
    'কাজের নাম দিন', 'কাজের সময় সেট করা হয়েছে', 'টেস্ট অ্যালার্ট', 'দিকনির্দেশনা'
  ];

  const hasClutter = clutterKeywords.some(word => combined.includes(word));
  if (hasClutter) {
    return false;
  }

  // 2. Strict Essential Whitelist: ONLY alarms, prayer calls, actual task DUE alerts, and incoming DMs
  const isAlarmOrPrayer = 
    title.includes('🚨') ||
    combined.includes('matinal alarm') ||
    combined.includes('এলার্ম বেজে উঠেছে') ||
    combined.includes('নামাজের সময়') ||
    combined.includes('আজান') ||
    combined.includes('tahajjud') ||
    combined.includes('prayer time');

  const isRealTaskDue = 
    title.includes('⏰') ||
    title.includes('🚨') ||
    title.includes('রিমাইন্ডার') ||
    combined.includes('কাজের রিমাইন্ডার') ||
    combined.includes('কাজের সময় হয়েছে') ||
    combined.includes('কাজ রয়ে গিয়েছে') ||
    combined.includes('কাজ রয়ে গিয়েছে') ||
    combined.includes('কাজ বাকি') ||
    combined.includes('scheduled task is due') ||
    combined.includes('task is due now') ||
    combined.includes('decree ai') ||
    combined.includes('decree');

  const isRealIncomingChat = 
    title.includes('💬') && (combined.includes('থেকে নতুন মেসেজ') || combined.includes('new message from'));

  const isCriticalSecurityAlert = 
    combined.includes('পাসওয়ার্ড ভুল') ||
    combined.includes('জরুরি সতর্কতা') ||
    combined.includes('critical emergency');

  return isAlarmOrPrayer || isRealTaskDue || isRealIncomingChat || isCriticalSecurityAlert;
}

export function triggerNotification(title: string, body: string = '', forceOSNotification: boolean = false) {
  // Check if essential-only mode is active (default is true as requested)
  let onlyEssential = true;
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('selfx_only_essential_notifications');
      if (saved === 'false') {
        onlyEssential = false;
      }
    } catch {}
  }

  const isEssential = isImportantOrWorkReminder(title, body);

  // If user requested only important & work reminders, and this is clutter:
  if (onlyEssential && !isEssential) {
    // Suppress from display HUD, chime, and OS notifications.
    try {
      const inAppEvent = new CustomEvent('in-app-notification', {
        detail: { title, body, timestamp: new Date(), isSuppressedFromDisplay: true }
      });
      window.dispatchEvent(inAppEvent);
    } catch (err) {}
    return;
  }

  // 1. Always dispatch a window-wide Custom Event for in-app dynamic island notification HUD
  try {
    const inAppEvent = new CustomEvent('in-app-notification', {
      detail: { title, body, timestamp: new Date(), isSuppressedFromDisplay: false }
    });
    window.dispatchEvent(inAppEvent);
  } catch (err) {
    console.error("Failed to dispatch in-app notification event", err);
  }

  // Initialize last notification timestamp on window
  if (!(window as any)._lastNotificationTimestamps) {
    (window as any)._lastNotificationTimestamps = {};
  }

  const now = Date.now();
  const lowerTitle = title.toLowerCase();
  const lowerBody = body.toLowerCase();

  // Spam keyword filters
  const isSpam = 
    lowerTitle === 'saved' || 
    lowerTitle === 'removed' || 
    lowerTitle === 'deleted' || 
    lowerTitle.includes('মেসেজ পড়া হয়েছে');

  // Critical items that should bypass rate limits (like lookmaxing alarms, real-time incoming personal chats, decree reminders)
  const isDecreeAlert = 
    title.includes('👑') ||
    title.includes('📌') ||
    title.includes('⏰') ||
    title.includes('ডিক্রি') ||
    title.includes('কাজের') ||
    lowerTitle.includes('decree') ||
    lowerTitle.includes('task') ||
    lowerTitle.includes('reminder') ||
    lowerTitle.includes('গুরুত্বপূর্ণ');

  const isCriticalAlarm = 
    isDecreeAlert ||
    title.includes('🚨') || 
    lowerTitle.includes('alarm') || 
    lowerTitle.includes('matinal');

  // Sound chime
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();
      if (audioCtx) {
        // First crystal harmonic chime
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.09, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.25);

        // Delayed second higher harmony chime
        setTimeout(() => {
          try {
            if (audioCtx.state !== 'closed') {
              const osc2 = audioCtx.createOscillator();
              const gain2 = audioCtx.createGain();
              osc2.connect(gain2);
              gain2.connect(audioCtx.destination);
              osc2.type = 'sine';
              osc2.frequency.setValueAtTime(1600, audioCtx.currentTime);
              gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
              gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
              osc2.start();
              osc2.stop(audioCtx.currentTime + 0.4);
            }
          } catch {}
        }, 80);

        // Safely close audio context
        setTimeout(() => {
          try {
            if (audioCtx && audioCtx.state !== 'closed') {
              audioCtx.close().catch(() => {});
            }
          } catch {}
        }, 800);
      }
    }
  } catch (err) {
    console.log("Acoustic synthesized notification cue skipped or muted:", err);
  }

  // 3. Dispatch genuine OS level browser notification stream for lock-screen display
  if (!isSpam && typeof window !== 'undefined' && 'Notification' in window) {
    const { title: formattedTitle, body: formattedBody } = formatBengaliLockNotification(title, body);

    const notifyOptions: any = {
      body: formattedBody,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: isDecreeAlert ? 'decree_lock_screen_' + Date.now() : 'selfx_lock_' + Date.now(),
      silent: false,
      requireInteraction: true, // Crucial: Keeps notification persistent on Android / desktop lock screens
      vibrate: isCriticalAlarm ? [500, 200, 500, 200, 800] : [350, 150, 350, 150, 500],
      renotify: true,
      data: { url: '/', date: Date.now() },
      actions: [
        { action: 'open', title: '👀 ওপেন করুন' },
        { action: 'dismiss', title: '✕ সম্পন্ন' }
      ]
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(formattedTitle, notifyOptions).catch(() => {
          try {
            new Notification(formattedTitle, notifyOptions);
          } catch {}
        });
      }).catch(() => {
        try {
          if (Notification.permission === 'granted') {
            new Notification(formattedTitle, notifyOptions);
          }
        } catch {}
      });
    } else if (Notification.permission === 'granted') {
      try {
        new Notification(formattedTitle, notifyOptions);
      } catch (e) {
        console.log("Failed to spawn notification", e);
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          try {
            new Notification(formattedTitle, notifyOptions);
          } catch (err) {}
        }
      });
    }
  }
}

export async function enableLockScreenNotifications(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      triggerNotification("🔔 লক স্ক্রিন নোটিফিকেশন সচল হয়েছে", "এখন থেকে আপনার সকল গুরুত্বপূর্ণ ডিক্রি ও মেসেজ লক স্ক্রিনে ভেসে উঠবে।", true);
      return true;
    }
    return false;
  } catch (err) {
    console.error("Failed to request notification permission:", err);
    return false;
  }
}

// Dedicated high-power lock screen & in-app reminder trigger for Decree AI tasks
export function triggerDecreeLockScreenNotification(title: string, body: string) {
  // Always trigger with forceOSNotification = true
  triggerNotification(title, body, true);
}

// Dedicated Premium Concise Bengali Task Reminder (Anytime / Scheduled)
export function triggerPremiumTaskReminder(taskName: string, timeStr?: string) {
  const cleanTitle = `⏰ নির্ধারিত কাজের রিমাইন্ডার`;
  const cleanBody = timeStr 
    ? `❝ ${taskName} ❞ — সময়: ${timeStr}। ফোকাস রাখুন, কাজটি সম্পন্ন করুন!`
    : `❝ ${taskName} ❞ — আপনার এই কাজটি সম্পূর্ণ করার কথা ছিল, এখনই ফোকাস দিন!`;
  triggerNotification(cleanTitle, cleanBody, true);
}

// Format Date nicely
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// Localization support: Normal (Bengali/English mixture) vs English Only
export function getLanguage(): 'normal' | 'english' {
  try {
    return (localStorage.getItem('lookmax_lang') as 'normal' | 'english') || 'normal';
  } catch {
    return 'normal';
  }
}

export function setLanguage(lang: 'normal' | 'english') {
  try {
    localStorage.setItem('lookmax_lang', lang);
    window.dispatchEvent(new CustomEvent('lookmax_lang_changed', { detail: { language: lang } }));
  } catch (e) {
    console.error("Failed to write language setting", e);
  }
}

export function t(banglaText: string, englishText: string): string {
  return getLanguage() === 'english' ? englishText : banglaText;
}
