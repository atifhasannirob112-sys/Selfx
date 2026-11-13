import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  Play,
  HelpCircle,
  Trophy,
  Music,
  Upload,
  Zap,
  Bell,
  Camera,
  ShieldCheck,
  Smartphone,
  Volume2,
  Send,
} from 'lucide-react';
import { AlarmConfig, RingtoneOption } from '../types';
import {
  alarmPlayer,
  triggerNotification,
  triggerOSAlarmNotification,
  requestNotificationPermission,
} from '../utils';
import {
  saveCustomRingtoneDB,
  deleteCustomRingtoneDB,
  syncAlarmScheduleToBackend,
  sendTestAlarmPush,
  backgroundAlarmGuard,
} from '../utils/alarmUtils';

interface AlarmSystemProps {
  alarm: AlarmConfig;
  setAlarm: React.Dispatch<React.SetStateAction<AlarmConfig>>;
  alarmRoast?: any;
  setAlarmRoast?: any;
  onEarnPoints?: (amount: number, reason: string) => void;
}

export default function AlarmSystem({ alarm, setAlarm }: AlarmSystemProps) {
  const [timeInput, setTimeInput] = useState(alarm.time || '05:30');
  const [labelInput, setLabelInput] = useState(alarm.label || 'সকালের ওয়েক-আপ এলার্ম');
  const [isPlayingPreview, setIsPlayingPreview] = useState<RingtoneOption | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notiPermission, setNotiPermission] = useState<string>('default');
  const [pushReady, setPushReady] = useState(false);
  const [pushTesting, setPushTesting] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isNativeAndroid =
    typeof window !== 'undefined' &&
    Boolean((window as any).AndroidNativeBridge?.isNativeAndroid?.());

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotiPermission(Notification.permission);
    }
    syncAlarmScheduleToBackend(alarm).then((res) => {
      setPushReady(res.hasPush);
    });
  }, []);

  // Live clock every second for accurate countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alarm.time) {
      setTimeInput(alarm.time);
    }
  }, [alarm.time]);

  const handleRequestNotifications = async () => {
    const resp = await requestNotificationPermission();
    if (resp !== 'unsupported') {
      setNotiPermission(resp);
      if (resp === 'granted') {
        const res = await syncAlarmScheduleToBackend({ ...alarm, time: timeInput, enabled: true });
        setPushReady(res.hasPush);
        triggerOSAlarmNotification(
          '🎉 লক-স্ক্রিন ও ব্যাকগ্রাউন্ড অ্যালার্ম সক্রিয়!',
          'অ্যাপের বাইরে থাকলেও এলার্মের সময় আপনার ফোনে নোটিফিকেশন ও এলার্ম আসবে।'
        );
      }
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeInput(newTime);
    setAlarm((prev) => {
      const next: AlarmConfig = {
        ...prev,
        time: newTime,
        enabled: true,
        lastDismissedDate: undefined,
      };
      syncAlarmScheduleToBackend(next).then((r) => setPushReady(r.hasPush));
      return next;
    });
  };

  const handleSaveConfig = async () => {
    // Ask camera permission proactively so morning selfie camera opens instantly
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'user' }, audio: false })
          .then((s) => s.getTracks().forEach((t) => t.stop()))
          .catch(() => {});
      }
    } catch {}

    const nextAlarm: AlarmConfig = {
      ...alarm,
      time: timeInput,
      label: labelInput.trim() || 'সকালের ওয়েক-আপ এলার্ম',
      enabled: true,
      challengeType:
        alarm.challengeType === 'selfie_and_math' ? 'selfie_and_math' : 'standing_selfie',
      escalationEnabled: alarm.escalationEnabled !== false,
      lastDismissedDate: undefined,
    };

    setAlarm(nextAlarm);
    await handleRequestNotifications();
    const res = await syncAlarmScheduleToBackend(nextAlarm);
    setPushReady(res.hasPush);

    if (nextAlarm.backgroundGuardEnabled) {
      backgroundAlarmGuard.enable();
    }

    triggerNotification(
      '⏰ এলার্ম সেট হয়েছে!',
      `প্রতিদিন ${timeInput} এ এলার্ম বাজবে — বন্ধ করতে দাঁড়িয়ে চোখ সোজা করে সেলফি তুলতে হবে।`,
      true
    );
  };

  const handleSetOneMinuteTest = async () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 1000);
    const hours = String(futureDate.getHours()).padStart(2, '0');
    const minutes = String(futureDate.getMinutes()).padStart(2, '0');
    const oneMinTime = `${hours}:${minutes}`;

    setTimeInput(oneMinTime);
    const nextAlarm: AlarmConfig = {
      ...alarm,
      time: oneMinTime,
      label: '১ মিনিট টেস্ট এলার্ম',
      enabled: true,
      isTriggered: false,
      lastDismissedDate: undefined,
    };
    setAlarm(nextAlarm);
    await handleRequestNotifications();
    const res = await syncAlarmScheduleToBackend(nextAlarm);
    setPushReady(res.hasPush);

    if (nextAlarm.backgroundGuardEnabled) {
      backgroundAlarmGuard.enable();
    }

    triggerNotification(
      '⚡ ১ মিনিটের টেস্ট এলার্ম সেট হয়েছে!',
      `ঠিক ${oneMinTime} এ এলার্ম বাজবে! অ্যাপ মিনিমাইজ বা স্ক্রিন লক করেও পরীক্ষা করতে পারেন।`,
      true
    );
  };

  const handleToggleEnable = async () => {
    const nextEnabled = !alarm.enabled;
    const nextAlarm: AlarmConfig = {
      ...alarm,
      enabled: nextEnabled,
      lastDismissedDate: nextEnabled ? undefined : alarm.lastDismissedDate,
    };
    setAlarm(nextAlarm);

    if (nextEnabled) {
      await handleRequestNotifications();
      if (nextAlarm.backgroundGuardEnabled) {
        backgroundAlarmGuard.enable();
      }
    } else {
      backgroundAlarmGuard.disable();
    }
    const res = await syncAlarmScheduleToBackend(nextAlarm);
    setPushReady(res.hasPush);
  };

  const handleToggleBackgroundGuard = () => {
    const nextVal = !alarm.backgroundGuardEnabled;
    if (nextVal) {
      backgroundAlarmGuard.enable();
    } else {
      backgroundAlarmGuard.disable();
    }
    setAlarm((prev) => ({
      ...prev,
      backgroundGuardEnabled: nextVal,
    }));
  };

  const handleTestOutsidePush = async () => {
    setPushTesting(true);
    setPushStatusMsg(null);
    await handleRequestNotifications();
    const result = await sendTestAlarmPush(5, timeInput);
    setPushStatusMsg(result.message);
    setPushTesting(false);
  };

  const handleTestTrigger = () => {
    handleRequestNotifications();
    triggerOSAlarmNotification(
      '🚨 এলার্ম টেস্ট শুরু!',
      'দাঁড়িয়ে চোখ সোজা করে সেলফি দিয়ে এলার্ম বন্ধ করার টেস্ট করুন।'
    );
    setAlarm((prev) => ({
      ...prev,
      isTriggered: true,
      triggeredAt: Date.now(),
    }));
  };

  const handleRingtoneChange = (tone: RingtoneOption) => {
    setAlarm((prev) => ({
      ...prev,
      ringtone: tone,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('অডিও ফাইলের সাইজ ১৫ MB এর কম হতে হবে।');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('ফাইল পড়তে সমস্যা হয়েছে। অন্য একটি অডিও ফাইল চেষ্টা করুন।');
    };
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const audioDataUrl = reader.result;
        await saveCustomRingtoneDB(audioDataUrl);
        setAlarm((prev) => ({
          ...prev,
          ringtone: 'phone_custom',
          customRingtoneBase64: audioDataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = async () => {
    alarmPlayer.stop();
    setIsPlayingPreview(null);
    await deleteCustomRingtoneDB();
    setAlarm((prev) => ({
      ...prev,
      ringtone: 'sunrise_melody',
      customRingtoneBase64: undefined,
    }));
  };

  const handlePreviewToneByToggle = (tone: RingtoneOption) => {
    if (isPlayingPreview === tone) {
      alarmPlayer.stop();
      setIsPlayingPreview(null);
    } else {
      alarmPlayer.stop();
      alarmPlayer.start(tone, alarm.customRingtoneBase64, { escalationEnabled: false });
      setIsPlayingPreview(tone);
    }
  };

  useEffect(() => {
    return () => {
      alarmPlayer.stop();
    };
  }, []);

  const getRemainingTimeText = () => {
    if (!alarm.enabled || !alarm.time) return null;
    const [aHoursRaw, aMinutesRaw] = alarm.time.split(':');
    const targetH = parseInt(aHoursRaw || '0', 10);
    const targetM = parseInt(aMinutesRaw || '0', 10);

    const nowH = currentTime.getHours();
    const nowM = currentTime.getMinutes();
    const nowS = currentTime.getSeconds();

    const targetTotalSeconds = targetH * 3600 + targetM * 60;
    const nowTotalSeconds = nowH * 3600 + nowM * 60 + nowS;

    let diffSeconds = targetTotalSeconds - nowTotalSeconds;
    if (diffSeconds <= 0) {
      diffSeconds += 24 * 3600;
    }

    const diffHours = Math.floor(diffSeconds / 3600);
    const diffMinutes = Math.floor((diffSeconds % 3600) / 60);
    const diffRemSeconds = diffSeconds % 60;

    if (diffHours === 0 && diffMinutes === 0) {
      return `আর মাত্র ${diffRemSeconds} সেকেন্ড বাকি!`;
    }
    if (diffHours === 0) {
      return `আর ${diffMinutes} মিনিট ${diffRemSeconds} সেকেন্ড পর বাজবে`;
    }
    return `আর ${diffHours} ঘণ্টা ${diffMinutes} মিনিট পর বাজবে`;
  };

  const remainingText = getRemainingTimeText();

  const ringtoneOptions: { id: RingtoneOption; name: string; desc: string }[] = [
    { id: 'sunrise_melody', name: '🌅 মিষ্টি সকাল', desc: 'সুরেলা ও ধীরে বাড়ে' },
    { id: 'gentle_morning', name: '☀️ প্রভাত ধ্বনি', desc: 'সতেজ মর্নিং বেল' },
    { id: 'classic', name: '⏰ ক্লাসিক বীপ', desc: 'পরিষ্কার ডিজিটাল' },
    { id: 'siren', name: '🚨 জরুরি সাইরেন', desc: 'তীব্র ওয়েক-আপ' },
    { id: 'military', name: '🎺 আর্মি হর্ন', desc: 'শক্তিশালী বাগল' },
    { id: 'zen', name: '🔔 জেন ঘণ্টা', desc: 'গভীর মেডিটেশন' },
    { id: 'buzz_badshah', name: '⚡ এনার্জি বীট', desc: 'রিমিক্স রিদম' },
  ];

  return (
    <div id="alarm-system" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN ALARM CONFIG PANEL */}
        <div className="lg:col-span-2 bg-[#121214] border border-zinc-800 rounded-2xl p-5 sm:p-6 glow-gold space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold-500/10 rounded-xl border border-gold-500/20">
                <Clock className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-zinc-100">
                  স্মার্ট ওয়েক-আপ এলার্ম (Smart Selfie Alarm)
                </h3>
                <p className="text-xs text-zinc-400">
                  দাঁড়িয়ে চোখ সোজা করে সেলফি না তোলা পর্যন্ত অনেকক্ষণ বাজতে থাকবে
                </p>
              </div>
            </div>

            <button
              id="alarm-toggle-btn"
              onClick={handleToggleEnable}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer shrink-0 ${
                alarm.enabled
                  ? 'bg-gold-500 text-zinc-950 hover:bg-gold-400 shadow-[0_0_15px_rgba(226,179,7,0.35)]'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {alarm.enabled ? 'ALARM ON' : 'ALARM OFF'}
            </button>
          </div>

          {/* OUTSIDE-APP RELIABILITY MATRIX */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  অ্যাপের বাইরে অ্যালার্ম সুরক্ষা (Outside-App Engine)
                </h4>
              </div>
              {isNativeAndroid && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Native Android Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Layer 1: Notification & Web Push */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                  notiPermission === 'granted'
                    ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bell className="w-4 h-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">
                      {notiPermission === 'granted'
                        ? pushReady
                          ? '✅ ব্যাকগ্রাউন্ড Web Push চালু'
                          : '✅ নোটিফিকেশন চালু আছে'
                        : '⚠️ নোটিফিকেশন অন করুন'}
                    </p>
                    <p className="text-[10px] opacity-75 truncate">
                      অ্যাপ বন্ধ থাকলেও লক-স্ক্রিনে এলার্ম আসবে
                    </p>
                  </div>
                </div>
                {notiPermission !== 'granted' ? (
                  <button
                    type="button"
                    onClick={handleRequestNotifications}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[10px] rounded-lg cursor-pointer shrink-0"
                  >
                    অন করুন
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pushTesting}
                    onClick={handleTestOutsidePush}
                    className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold text-[10px] rounded-lg border border-emerald-500/40 cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>{pushTesting ? 'পাঠাচ্ছে...' : '৫সে টেস্ট পুশ'}</span>
                  </button>
                )}
              </div>

              {/* Layer 2: Background Audio Guard */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                  alarm.backgroundGuardEnabled
                    ? 'bg-sky-950/30 border-sky-500/40 text-sky-200'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Smartphone className="w-4 h-4 shrink-0 text-sky-400" />
                  <div className="min-w-0">
                    <p className="font-bold truncate">
                      ব্যাকগ্রাউন্ড অডিও গার্ড
                    </p>
                    <p className="text-[10px] opacity-75 truncate">
                      মিনিমাইজ বা স্ক্রিন অফেও সরাসরি রিং হবে
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleBackgroundGuard}
                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-lg border cursor-pointer shrink-0 transition-all ${
                    alarm.backgroundGuardEnabled
                      ? 'bg-sky-500 text-zinc-950 border-sky-400'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {alarm.backgroundGuardEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {pushStatusMsg && (
              <p className="text-[11px] text-emerald-300 bg-emerald-950/30 border border-emerald-500/25 px-3 py-2 rounded-lg">
                {pushStatusMsg}
              </p>
            )}
          </div>

          {/* QUICK 1-MINUTE TEST BAR */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-gold-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-zinc-100">
                  লাইভ টেস্ট করতে চান? (১ মিনিট পর এলার্ম)
                </span>
                <p className="text-[11px] text-zinc-400">
                  ১ মিনিট পর এলার্ম বাজবে — অ্যাপের বাইরে গিয়েও চেক করতে পারবেন।
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSetOneMinuteTest}
              className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 text-gold-300 text-xs font-bold rounded-lg border border-gold-500/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>১ মিনিট পর টেস্ট সেট</span>
            </button>
          </div>

          {/* TIME & LABEL CONFIGURATION */}
          <div className="bg-zinc-900/40 border border-zinc-800/70 p-4 sm:p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="w-full sm:flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                    এলার্মের সময় নির্বাচন করুন
                  </label>
                  {remainingText && alarm.enabled && (
                    <span className="text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      ⏳ {remainingText}
                    </span>
                  )}
                </div>
                <input
                  id="alarm-time-input"
                  type="time"
                  value={timeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-3xl font-mono text-gold-400 text-center tracking-widest focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="w-full sm:w-auto flex gap-2">
                <button
                  id="alarm-save-btn"
                  onClick={handleSaveConfig}
                  className="flex-1 sm:flex-none px-5 py-3.5 bg-gold-500 hover:bg-gold-400 text-zinc-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Apply & Set
                </button>
                <button
                  id="alarm-test-btn"
                  onClick={handleTestTrigger}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3.5 bg-red-950/50 hover:bg-red-900/50 text-red-200 font-bold text-xs sm:text-sm rounded-xl transition-all border border-red-500/30 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>Test Now</span>
                </button>
              </div>
            </div>

            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="এলার্মের নাম (যেমন: ফজরের নামাজ ও সকালের ওয়ার্কআউট)"
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-gold-500/60"
            />
          </div>

          {/* DISMISSAL CHALLENGE MODE */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs sm:text-sm font-semibold text-zinc-200">
                এলার্ম বন্ধ করার নিয়ম (Wake-Up Verification)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setAlarm((prev) => ({ ...prev, challengeType: 'standing_selfie' }))
                }
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  alarm.challengeType !== 'selfie_and_math'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-bold">
                  📸 দাঁড়িয়ে চোখ সোজা করে সেলফি (Recommended)
                </p>
                <p className="text-[10px] opacity-80 mt-0.5">
                  AI চেক করবে আপনি বিছানা ছেড়ে দাঁড়িয়েছেন এবং চোখ খোলা রেখে সোজা তাকিয়েছেন।
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  setAlarm((prev) => ({ ...prev, challengeType: 'selfie_and_math' }))
                }
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  alarm.challengeType === 'selfie_and_math'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-bold">📸 + 🧠 সেলফি + অংক (Hardcore)</p>
                <p className="text-[10px] opacity-80 mt-0.5">
                  প্রথমে দাঁড়িয়ে সেলফি, এরপর ১টি অংক সমাধান করলে এলার্ম বন্ধ হবে।
                </p>
              </button>
            </div>
          </div>

          {/* RINGTONES & LONG-RING ESCALATION */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-gold-400" />
                <h4 className="text-sm font-semibold text-zinc-200">
                  এলার্মের সুর ও দীর্ঘ সময় বাজানোর সেটিংস
                </h4>
              </div>

              <label className="flex items-center gap-2 text-[11px] text-amber-300 cursor-pointer select-none bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/25">
                <input
                  type="checkbox"
                  checked={alarm.escalationEnabled !== false}
                  onChange={(e) =>
                    setAlarm((prev) => ({
                      ...prev,
                      escalationEnabled: e.target.checked,
                    }))
                  }
                  className="accent-amber-500"
                />
                <Volume2 className="w-3.5 h-3.5" />
                <span>ধীরে ধীরে ভলিউম বাড়বে ও না থামা পর্যন্ত বাজবে</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ringtoneOptions.map((tone) => (
                <div
                  key={tone.id}
                  onClick={() => handleRingtoneChange(tone.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer text-center select-none transition-all ${
                    alarm.ringtone === tone.id
                      ? 'bg-gold-500/10 border-gold-500 text-gold-300 font-semibold'
                      : 'bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{tone.name}</p>
                  <p className="text-[10px] opacity-70 mt-0.5">{tone.desc}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewToneByToggle(tone.id);
                    }}
                    className="mt-1.5 text-[10px] uppercase font-mono tracking-wider text-zinc-400 hover:text-zinc-100"
                  >
                    {isPlayingPreview === tone.id ? '■ STOP' : '▶ TEST'}
                  </button>
                </div>
              ))}
            </div>

            {/* Custom Audio Upload */}
            <input
              id="alarm-audio-upload-input"
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              className={`p-4 rounded-xl border border-dashed text-center transition-all ${
                alarm.ringtone === 'phone_custom'
                  ? 'bg-gold-500/5 border-gold-500/50 text-gold-300'
                  : 'bg-[#121214] border-zinc-800 text-zinc-500'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-5 h-5 text-gold-400" />
                <p className="text-xs font-semibold text-zinc-200">
                  ফোন থেকে নিজের পছন্দের গান/সুর এলার্ম হিসেবে সেট করুন (সর্বোচ্চ ১৫ MB)
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById('alarm-audio-upload-input')?.click()
                    }
                    className="px-4 py-2 bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 text-xs font-bold rounded-lg border border-gold-500/30 cursor-pointer flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>অডিও ফাইল বেছে নিন</span>
                  </button>

                  {alarm.customRingtoneBase64 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handlePreviewToneByToggle('phone_custom')}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold rounded-lg border border-zinc-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {isPlayingPreview === 'phone_custom' ? '■ STOP' : '▶ TEST AUDIO'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveCustomAudio}
                        className="px-3 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-300 text-xs font-bold rounded-lg border border-red-500/20 cursor-pointer"
                      >
                        মুছে ফেলুন
                      </button>
                    </>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-400 mt-1">{uploadError}</p>
                )}

                {alarm.customRingtoneBase64 && !uploadError && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>কাস্টম অডিও সেট ও IndexedDB-তে সংরক্ষিত হয়েছে!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WAKE UP LOG HISTORY */}
        <div
          id="alarm-history-card"
          className="bg-[#121214] border border-zinc-800 rounded-2xl p-6 flex flex-col h-full"
        >
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Trophy className="w-5 h-5 text-gold-400" />
            <h3 className="font-display font-semibold text-sm text-zinc-300 uppercase tracking-widest block">
              Wake Up History
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-zinc-800 space-y-3">
            {!alarm.wakeUpHistory || alarm.wakeUpHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8 text-zinc-600">
                <HelpCircle className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs">এখনো কোনো রেকর্ড নেই</p>
                <p className="text-[10px] text-zinc-700 mt-1">
                  দাঁড়িয়ে চোখ সোজা করে সেলফি দিয়ে সকালের ঘুম ভাঙুন
                </p>
              </div>
            ) : (
              (alarm.wakeUpHistory || []).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center gap-3"
                >
                  {item.snapshotUrl && (
                    <img
                      src={item.snapshotUrl}
                      alt="Wake-up Selfie"
                      className="w-11 h-11 rounded-lg object-cover border border-emerald-500/30 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified Awake</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 font-medium truncate">
                      {item.date}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {item.solvedProblem}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
