import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlarmClock,
  Camera,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sun,
  UserCheck,
  Volume2,
  XCircle,
} from 'lucide-react';
import { AlarmConfig, MathProblem } from '../types';
import { generateMathProblem } from '../utils';

interface SelfieChecklist {
  faceDetected: boolean;
  eyesOpenStraight: boolean;
  standingPosture: boolean;
  goodLighting: boolean;
}

interface WakeUpSelfieModalProps {
  alarm: AlarmConfig;
  alarmRoast: string;
  strobe: boolean;
  onEnsureAudioPlaying: () => void;
  onVerifiedDismiss: (summary: {
    verificationType: 'selfie' | 'selfie_and_math' | 'math';
    solvedProblem: string;
    snapshotUrl?: string;
  }) => void;
}

export default function WakeUpSelfieModal({
  alarm,
  alarmRoast,
  strobe,
  onEnsureAudioPlaying,
  onVerifiedDismiss,
}: WakeUpSelfieModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [elapsedSec, setElapsedSec] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<SelfieChecklist | null>(null);
  const [verificationPassed, setVerificationPassed] = useState(false);

  // Secondary Math stage (if challengeType === 'selfie_and_math', or offline/camera hardware fallback)
  const [mathStageActive, setMathStageActive] = useState(
    alarm.challengeType === 'math'
  );
  const [mathProblemsRemaining, setMathProblemsRemaining] = useState(
    alarm.challengeType === 'selfie_and_math' ? 1 : 3
  );
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() =>
    generateMathProblem()
  );
  const [userAnswer, setUserAnswer] = useState('');
  const [mathError, setMathError] = useState(false);
  const [verifiedSnapshot, setVerifiedSnapshot] = useState<string | undefined>(undefined);
  const [showEmergencyMathOption, setShowEmergencyMathOption] = useState(false);

  // Live ringing timer
  useEffect(() => {
    const startTs = alarm.triggeredAt || Date.now();
    const timer = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startTs) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [alarm.triggeredAt]);

  // Start Front Camera automatically
  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('এই ব্রাউজারে লাইভ ক্যামেরা পাওয়া যায়নি। নিচের ক্যামেরা বাটন দিয়ে সেলফি তুলুন।');
        setShowEmergencyMathOption(true);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 960 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCameraReady(true);
    } catch (err: any) {
      console.warn('[WakeUpSelfieModal] Camera start error:', err);
      setCameraError(
        'ক্যামেরা চালু করা যায়নি! পারমিশন দিন অথবা নিচের "ফোন ক্যামেরা দিয়ে সেলফি" বাটন চাপুন।'
      );
      setShowEmergencyMathOption(true);
    }
  };

  useEffect(() => {
    if (!mathStageActive) {
      startCamera();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mathStageActive]);

  // Hands-free 3-second countdown capture
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      setCountdown(null);
      captureAndVerifyFromVideo();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const formatDuration = (total: number) => {
    const m = String(Math.floor(total / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const verifyCapturedBase64 = async (dataUrl: string) => {
    onEnsureAudioPlaying();
    setCapturedPreview(dataUrl);
    setIsVerifying(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/alarm/verify-wakeup-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });

      const data = await res.json();
      if (data?.checklist) {
        setChecklist(data.checklist);
      }

      if (!res.ok) {
        setShowEmergencyMathOption(true);
      }

      if (res.ok && data?.verified) {
        setVerificationPassed(true);
        setFeedbackMsg(
          data.reasonBn ||
            '✅ দারুণ! দাঁড়িয়ে চোখ সোজা করে সেলফি যাচাই সফল হয়েছে!'
        );
        setVerifiedSnapshot(dataUrl);

        if (alarm.challengeType === 'selfie_and_math') {
          setTimeout(() => {
            setMathProblemsRemaining(1);
            setCurrentProblem(generateMathProblem());
            setMathStageActive(true);
          }, 900);
        } else {
          setTimeout(() => {
            onVerifiedDismiss({
              verificationType: 'selfie',
              solvedProblem: 'দাঁড়িয়ে চোখ সোজা করে সেলফি যাচাই সম্পন্ন',
              snapshotUrl: dataUrl,
            });
          }, 700);
        }
      } else {
        setVerificationPassed(false);
        setFeedbackMsg(
          data?.reasonBn ||
            data?.error ||
            '❌ যাচাই হয়নি! বিছানা থেকে উঠে দাঁড়িয়ে চোখ খোলা রেখে সরাসরি ক্যামেরায় সেলফি দিন।'
        );
        // Resume live camera view after short pause
        setTimeout(() => {
          setCapturedPreview(null);
        }, 1200);
      }
    } catch (err) {
      setVerificationPassed(false);
      setFeedbackMsg(
        '⚠️ ইন্টারনেট বা সার্ভার সংযোগ পাওয়া যায়নি। নেট চেক করে আবার চেষ্টা করুন অথবা অফলাইন ম্যাথ ব্যবহার করুন।'
      );
      setShowEmergencyMathOption(true);
      setCapturedPreview(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const captureAndVerifyFromVideo = () => {
    onEnsureAudioPlaying();
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      fileInputRef.current?.click();
      return;
    }

    const maxW = 720;
    const scale = Math.min(1, maxW / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror horizontally to match front camera selfie natural preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Quick darkness / covered-camera check
    try {
      const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let totalLum = 0;
      const step = 16 * 4;
      let count = 0;
      for (let i = 0; i < sample.length; i += step) {
        totalLum += 0.299 * sample[i] + 0.587 * sample[i + 1] + 0.114 * sample[i + 2];
        count++;
      }
      const avgLum = count > 0 ? totalLum / count : 255;
      if (avgLum < 14) {
        setChecklist({
          faceDetected: false,
          eyesOpenStraight: false,
          standingPosture: false,
          goodLighting: false,
        });
        setFeedbackMsg('❌ ক্যামেরা ঢাকা বা রুম একেবারে অন্ধকার! রুমের লাইট অন করে দাঁড়িয়ে সেলফি দিন।');
        return;
      }
    } catch {}

    const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
    verifyCapturedBase64(dataUrl);
  };

  const handleNativeFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    onEnsureAudioPlaying();
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      // Downscale via canvas to keep payload fast & reliable
      const img = new Image();
      img.onload = () => {
        const maxW = 760;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          verifyCapturedBase64(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          verifyCapturedBase64(reader.result as string);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleMathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnsureAudioPlaying();
    const parsed = parseInt(userAnswer.trim(), 10);
    if (parsed === currentProblem.answer) {
      if (mathProblemsRemaining <= 1) {
        onVerifiedDismiss({
          verificationType: verifiedSnapshot ? 'selfie_and_math' : 'math',
          solvedProblem: verifiedSnapshot
            ? `Selfie + Math (${currentProblem.question})`
            : `Offline Math (${currentProblem.question})`,
          snapshotUrl: verifiedSnapshot,
        });
      } else {
        setMathProblemsRemaining((n) => n - 1);
        setUserAnswer('');
        setCurrentProblem(generateMathProblem());
      }
    } else {
      setMathError(true);
      setUserAnswer('');
      setTimeout(() => {
        setMathError(false);
        setCurrentProblem(generateMathProblem());
      }, 700);
    }
  };

  const ringStageLabel =
    elapsedSec < 20
      ? '🎵 মর্নিং টিউন বাজছে'
      : elapsedSec < 45
      ? '🔊 সাউন্ড ও ভয়েস বাড়ছে!'
      : '🚨 ফুল পাওয়ার ওয়েক-আপ অ্যালার্ম!';

  return (
    <motion.div
      id="global-wakeup-lockdown-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onEnsureAudioPlaying}
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center p-3 sm:p-4 backdrop-blur-3xl overflow-y-auto transition-colors duration-300 ${
        strobe ? 'bg-zinc-950/98' : 'bg-red-950/95'
      }`}
    >
      <div
        id="lockdown-panel"
        className="max-w-md w-full bg-[#0b0b0e] border border-red-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.28)] relative my-auto"
      >
        {/* Top Alarm Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400">
              <AlarmClock className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-display font-black text-red-400 tracking-wide">
                এলার্ম বাজছে! ({alarm.time})
              </h3>
              <p className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>{ringStageLabel}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-mono text-zinc-500 uppercase">বাজছে</span>
            <span className="text-sm font-mono font-bold text-red-300 bg-red-950/60 border border-red-500/30 px-2.5 py-1 rounded-lg">
              {formatDuration(elapsedSec)}
            </span>
          </div>
        </div>

        {/* Roast / Wake-up motivation */}
        <div className="bg-red-950/25 border border-red-500/20 px-3.5 py-2.5 rounded-xl text-center">
          <p className="text-xs text-red-100/90 font-medium leading-relaxed">
            {alarmRoast || 'বিছানা ছাড়ুন চ্যাম্পিয়ন! দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে দিন শুরু করুন!'}
          </p>
        </div>

        {!mathStageActive ? (
          <div className="space-y-3.5">
            {/* Strict Standing + Eyes Open Instructions */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>এলার্ম বন্ধ করার শর্ত (Standing Eyes-Open Selfie):</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-zinc-200 font-medium pt-0.5">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 text-center">
                  🧍 ১. উঠে দাঁড়ান
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 text-center">
                  👀 ২. চোখ সোজা ও খোলা
                </div>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-1.5 text-center">
                  💡 ৩. পর্যাপ্ত আলো
                </div>
              </div>
            </div>

            {/* Camera Preview Window */}
            <div className="relative w-full aspect-[3/4] max-h-[340px] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-inner flex items-center justify-center">
              {capturedPreview ? (
                <img
                  src={capturedPreview}
                  alt="Captured Wakeup Selfie"
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  className="w-full h-full object-cover -scale-x-100"
                />
              )}

              {/* Alignment Overlay Guide */}
              {!capturedPreview && cameraReady && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  {/* Face & Eye Oval Guide */}
                  <div className="w-40 h-52 rounded-[999px] border-2 border-dashed border-amber-400/75 shadow-[0_0_0_9999px_rgba(0,0,0,0.32)] flex flex-col items-center justify-center relative">
                    {/* Eye-level horizontal line */}
                    <div className="w-28 h-[1px] bg-emerald-400/70 -translate-y-4 relative">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono bg-black/70 text-emerald-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                        👀 চোখ এখানে সোজা রাখুন
                      </span>
                    </div>
                  </div>
                  <span className="mt-3 text-[10px] font-bold bg-black/75 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                    দাঁড়িয়ে মাথা ও কাঁধ সোজা রাখুন
                  </span>
                </div>
              )}

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-7xl font-black text-amber-400 animate-ping">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Camera loading / error state */}
              {!cameraReady && !capturedPreview && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-5 text-center gap-3">
                  {cameraError ? (
                    <>
                      <Camera className="w-10 h-10 text-amber-400" />
                      <p className="text-xs text-zinc-200 leading-relaxed">{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold rounded-xl border border-zinc-700 cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>ক্যামেরা রিট্রাই করুন</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <p className="text-xs text-zinc-300">ফ্রন্ট ক্যামেরা চালু হচ্ছে...</p>
                    </>
                  )}
                </div>
              )}

              {/* Verifying Spinner Overlay */}
              {isVerifying && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-center p-4">
                  <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                  <p className="text-sm font-bold text-amber-300">
                    AI যাচাই করছে: আপনি কি দাঁড়িয়ে চোখ সোজা করে আছেন?
                  </p>
                </div>
              )}
            </div>

            {/* Live AI Checklist Result */}
            {checklist && (
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  { ok: checklist.faceDetected, label: 'মুখ সনাক্ত হয়েছে', Icon: UserCheck },
                  { ok: checklist.eyesOpenStraight, label: 'চোখ খোলা ও সোজা দৃষ্টি', Icon: Eye },
                  { ok: checklist.standingPosture, label: 'দাঁড়িয়ে থাকা ভঙ্গি', Icon: ShieldAlert },
                  { ok: checklist.goodLighting, label: 'পর্যাপ্ত আলো', Icon: Sun },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                      item.ok
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/50 border-red-500/40 text-red-300'
                    }`}
                  >
                    {item.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                    )}
                    <span className="truncate font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold text-center border ${
                  verificationPassed
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border-red-500/40 text-red-200'
                }`}
              >
                {feedbackMsg}
              </div>
            )}

            {/* Hidden Native Camera Input Fallback */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleNativeFileCapture}
              className="hidden"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isVerifying || verificationPassed}
                onClick={cameraReady ? captureAndVerifyFromVideo : () => fileInputRef.current?.click()}
                className="sm:col-span-2 w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 disabled:opacity-60 text-zinc-950 font-black text-sm rounded-2xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>
                  {cameraReady
                    ? '📸 সেলফি তুলে এলার্ম বন্ধ করুন'
                    : '📸 ফোন ক্যামেরা দিয়ে সেলফি তুলুন'}
                </span>
              </button>

              {cameraReady && (
                <button
                  type="button"
                  disabled={isVerifying || countdown !== null || verificationPassed}
                  onClick={() => {
                    onEnsureAudioPlaying();
                    setCountdown(3);
                  }}
                  className="py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 cursor-pointer transition-all"
                >
                  ⏱️ ৩ সেকেন্ড টাইমার সেলফি
                </button>
              )}

              <button
                type="button"
                disabled={isVerifying || verificationPassed}
                onClick={() => fileInputRef.current?.click()}
                className={`${
                  cameraReady ? '' : 'sm:col-span-2'
                } py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 cursor-pointer transition-all`}
              >
                📱 ডিভাইস ক্যামেরা ওপেন
              </button>
            </div>

            {showEmergencyMathOption && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMathProblemsRemaining(3);
                    setCurrentProblem(generateMathProblem());
                    setMathStageActive(true);
                  }}
                  className="text-[11px] text-amber-400/80 hover:text-amber-300 underline cursor-pointer"
                >
                  ক্যামেরা বা নেট না থাকলে ৩টি অংক সমাধান করে বন্ধ করুন
                </button>
              </div>
            )}
          </div>
        ) : (
          /* MATH CHALLENGE STAGE (Hardcore Selfie+Math or Hardware Fallback) */
          <div className="space-y-4">
            <div className="text-center space-y-1.5">
              <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block font-bold">
                🧠 গণিত যাচাই (বাকি: {mathProblemsRemaining}টি)
              </span>
              <p className="text-xs text-zinc-400">
                {verifiedSnapshot
                  ? 'সেলফি যাচাই পাস হয়েছে! এবার নিচের অংকটি সমাধান করলেই এলার্ম বন্ধ হবে:'
                  : 'এলার্ম বন্ধ করতে নিচের অংকগুলোর সঠিক উত্তর দিন:'}
              </p>

              <div className="bg-zinc-900 border border-zinc-800 py-5 rounded-2xl text-zinc-100 font-display font-black text-3xl text-center relative overflow-hidden tracking-wider">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                {currentProblem.question}
              </div>
            </div>

            <form onSubmit={handleMathSubmit} className="space-y-3">
              <input
                type="number"
                required
                autoFocus
                placeholder="উত্তরটি এখানে লিখুন..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className={`w-full py-3 px-4 bg-zinc-900 border text-center text-lg font-mono rounded-xl focus:outline-none transition-all ${
                  mathError
                    ? 'border-red-500 text-red-400'
                    : 'border-zinc-800 focus:border-amber-500 text-zinc-100'
                }`}
              />
              {mathError && (
                <p className="text-xs text-red-400 text-center font-bold">
                  ❌ ভুল উত্তর! নতুন অংক লোড হচ্ছে...
                </p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-400 hover:to-gold-400 text-zinc-950 font-black text-sm rounded-xl cursor-pointer shadow-lg"
              >
                ✓ উত্তর জমা দিন
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
