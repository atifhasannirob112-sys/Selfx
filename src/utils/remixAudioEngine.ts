import { triggerNotification } from '../utils';

export interface MusicSegment {
  start: number;
  end: number;
  label: string;
  isInstrumental: boolean;
}

export interface InstrumentalWindow {
  start: number;
  end: number;
  avgRms: number;
  avgVocal: number;
}

export interface MusicAnalysis {
  bpm: number;
  beatOffset?: number;
  duration?: number;
  introAudioStart?: number;
  isMono?: boolean;
  isFullInstrumentalTrack?: boolean;
  vocalThreshold?: number;
  vocalTimeline?: number[]; // 0.5s frame resolution [0..1] vocal presence score
  rmsTimeline?: number[];   // 0.5s frame resolution RMS amplitude
  instrumentalWindows?: InstrumentalWindow[];
  energy: 'Low' | 'Medium' | 'High';
  vibe: string;
  segments: MusicSegment[];
  bestTransitionPoints: number[];
}

export interface MusicItem {
  id: string;
  name: string;
  dataUrl: string;
  addedAt: string;
  analysis?: MusicAnalysis;
}

export interface RemixSessionStatus {
  mode: 'normal' | 'remix';
  isPlaying: boolean;
  autoPaused: boolean;
  autoPauseReasons: string[];
  currentTrackId: string | null;
  sliceElapsed: number;
  isInstrumentalReady: boolean;
  isTransitioning: boolean;
  isInstrumentalTransitionActive: boolean;
  positions: Record<string, number>;
  durations: Record<string, number>;
  completedIds: Record<string, boolean>;
  remainingCount: number;
  totalSelectedCount: number;
}

const POSITIONS_STORAGE_KEY = 'bg_music_positions_v2';
const COMPLETED_STORAGE_KEY = 'bg_music_remix_completed_v2';
const DURATIONS_STORAGE_KEY = 'bg_music_durations_v2';
const REMIX_SELECTED_IDS_KEY = 'bg_music_remix_selected_ids_v1';

const TARGET_MASTER_GAIN = 0.14;
export const MAX_REMIX_SLICE_SECONDS = 90;  // Strict 1 minute 30 second maximum per track turn in Remix Mode
const MIN_PLAY_BEFORE_MIX_SEC = 22;         // Earliest point to search for a pure instrumental break
const FULL_INST_PHRASE_PLAY_SEC = 42;       // For 100% instrumental tracks, transition cleanly between 42s and 85s
const MIN_ACTIVE_INSTRUMENTAL_RMS = 0.018;  // Reject dead silence as an instrumental cue
const MIN_INST_WINDOW_SECONDS = 3.5;        // Minimum contiguous pure-instrumental duration for a clean mix
export const REMIX_CROSSFADE_SECONDS = 5.0; // Seamless 5.0s beat-locked crossfade (starts <= 85s, finishes <= 90s)
const NORMAL_CROSSFADE_SECONDS = 5.5;

// ============================================================================
// REAL FFT + SYLLABIC MODULATION + STEREO M/S + BEAT-GRID ANALYZER
// ============================================================================

function computeRadix2FFT(real: Float32Array, imag: Float32Array): void {
  const n = real.length;
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  for (let size = 2; size <= n; size <<= 1) {
    const halfSize = size >> 1;
    const angleStep = (-2 * Math.PI) / size;
    for (let i = 0; i < n; i += size) {
      for (let k = 0; k < halfSize; k++) {
        const angle = k * angleStep;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const evenIdx = i + k;
        const oddIdx = evenIdx + halfSize;
        const tr = real[oddIdx] * cosA - imag[oddIdx] * sinA;
        const ti = real[oddIdx] * sinA + imag[oddIdx] * cosA;
        real[oddIdx] = real[evenIdx] - tr;
        imag[oddIdx] = imag[evenIdx] - ti;
        real[evenIdx] += tr;
        imag[evenIdx] += ti;
      }
    }
  }
}

function getHannWindow(size: number): Float32Array {
  const win = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    win[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return win;
}

export interface AudioBufferLike {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  length: number;
  getChannelData(channel: number): Float32Array;
}

/**
 * Multi-feature AI DSP Audio Analyzer:
 * 1. Spectral Vocal-Band Share (280–2800 Hz vs Bass 35–220 Hz + Highs 3500–12000 Hz)
 * 2. Stereo Mid-Side Vocal Dominance (center-panned vocals vs wide stereo instruments)
 * 3. Syllabic Envelope Modulation (3–8 Hz sub-frame flux in vocal band via 50ms hops)
 * 4. Active-Music RMS Gate (never confuses dead silence with an instrumental groove)
 * 5. Autocorrelation Beat-Grid & Downbeat Phase Detection
 */
export function analyzeAudioBuffer(audioBuffer: AudioBufferLike): MusicAnalysis {
  const duration = audioBuffer.duration;
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const ch0 = audioBuffer.getChannelData(0);
  const ch1 = numChannels > 1 ? audioBuffer.getChannelData(1) : null;

  // 1. Detect leading non-silent audio start
  let introAudioStart = 0;
  const step100ms = Math.max(1, Math.floor(sampleRate * 0.1));
  const maxIntroScan = Math.min(ch0.length, Math.floor(sampleRate * 12));
  for (let pos = 0; pos < maxIntroScan; pos += step100ms) {
    let sumSq = 0;
    const end = Math.min(pos + step100ms, ch0.length);
    for (let k = pos; k < end; k++) {
      const s = ch1 ? 0.5 * (ch0[k] + ch1[k]) : ch0[k];
      sumSq += s * s;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, end - pos));
    if (rms > MIN_ACTIVE_INSTRUMENTAL_RMS) {
      introAudioStart = Math.max(0, Math.round((pos / sampleRate) * 10) / 10);
      break;
    }
  }

  // 2. Frame-by-frame (0.5s) Spectral + Stereo M/S + Syllabic Modulation Analysis
  const fftSize = 2048;
  const hann = getHannWindow(fftSize);
  const frameStep = Math.max(1, Math.floor(sampleRate * 0.5));
  const totalFrames = Math.max(1, Math.floor(ch0.length / frameStep));

  const realMid = new Float32Array(fftSize);
  const imagMid = new Float32Array(fftSize);
  const realSide = new Float32Array(fftSize);
  const imagSide = new Float32Array(fftSize);

  const rawVocalScores: number[] = [];
  const frameRmsList: number[] = [];
  let totalMidRms = 0;
  let totalSideRms = 0;

  const binHz = sampleRate / fftSize;
  const bassMinBin = Math.max(1, Math.floor(35 / binHz));
  const bassMaxBin = Math.min(fftSize / 2 - 1, Math.ceil(220 / binHz));
  const vocalMinBin = Math.max(1, Math.floor(280 / binHz));
  const vocalMaxBin = Math.min(fftSize / 2 - 1, Math.ceil(2800 / binHz));
  const highMinBin = Math.max(1, Math.floor(3500 / binHz));
  const highMaxBin = Math.min(fftSize / 2 - 1, Math.ceil(12000 / binHz));

  // Simple 1st-order bandpass helper weights for 50ms syllabic envelope check (10 sub-frames per 0.5s)
  const subStep = Math.max(1, Math.floor(frameStep / 10));

  for (let f = 0; f < totalFrames; f++) {
    const frameStart = f * frameStep;
    const center = Math.min(Math.max(0, ch0.length - fftSize), frameStart);
    let midSq = 0;
    let sideSq = 0;

    for (let i = 0; i < fftSize; i++) {
      const idx = center + i;
      const l = idx < ch0.length ? ch0[idx] : 0;
      const r = ch1 && idx < ch1.length ? ch1[idx] : l;
      const mid = 0.5 * (l + r);
      const side = ch1 ? 0.5 * (l - r) : 0;
      midSq += mid * mid;
      sideSq += side * side;
      realMid[i] = mid * hann[i];
      imagMid[i] = 0;
      realSide[i] = side * hann[i];
      imagSide[i] = 0;
    }

    const midRms = Math.sqrt(midSq / fftSize);
    const sideRms = Math.sqrt(sideSq / fftSize);
    totalMidRms += midRms;
    totalSideRms += sideRms;
    frameRmsList.push(Math.round(midRms * 10000) / 10000);

    if (midRms < 0.012) {
      rawVocalScores.push(0);
      continue;
    }

    computeRadix2FFT(realMid, imagMid);
    if (ch1) {
      computeRadix2FFT(realSide, imagSide);
    }

    let bassE = 0;
    let midVocalE = 0;
    let sideVocalE = 0;
    let highE = 0;
    let vocalPeakE = 0;

    for (let b = bassMinBin; b <= bassMaxBin; b++) {
      bassE += realMid[b] * realMid[b] + imagMid[b] * imagMid[b];
    }
    for (let b = vocalMinBin; b <= vocalMaxBin; b++) {
      const magSq = realMid[b] * realMid[b] + imagMid[b] * imagMid[b];
      midVocalE += magSq;
      if (magSq > vocalPeakE) vocalPeakE = magSq;
      if (ch1) {
        sideVocalE += realSide[b] * realSide[b] + imagSide[b] * imagSide[b];
      }
    }
    for (let b = highMinBin; b <= highMaxBin; b++) {
      highE += realMid[b] * realMid[b] + imagMid[b] * imagMid[b];
    }

    const totalBandE = bassE + midVocalE + highE + 1e-12;
    const vocalBandShare = midVocalE / totalBandE;

    // Harmonicity / tonal peak concentration in vocal band (distinguishes harmonic voice from noisy percussion)
    const vocalBinsCount = Math.max(1, vocalMaxBin - vocalMinBin + 1);
    const avgVocalBinE = midVocalE / vocalBinsCount;
    const harmonicPeakFactor = Math.min(1, (vocalPeakE / (avgVocalBinE + 1e-12)) / 18);

    // Stereo Mid-Side vocal dominance: center-panned vocals have low sideVocalE relative to midVocalE
    let centerDominance = 0.5;
    if (ch1 && midVocalE > 1e-12) {
      const sideRatio = sideVocalE / (midVocalE + 1e-12);
      centerDominance = Math.max(0, Math.min(1, 1 - sideRatio * 1.45));
    }

    // Sub-frame syllabic modulation (50ms envelope variation inside this 0.5s window)
    let modFlux = 0;
    let prevSubRms = 0;
    for (let s = 0; s < 10; s++) {
      const sStart = Math.min(ch0.length - 1, frameStart + s * subStep);
      const sEnd = Math.min(ch0.length, sStart + subStep);
      let sum = 0;
      for (let k = sStart; k < sEnd; k++) {
        const m = ch1 ? 0.5 * (ch0[k] + ch1[k]) : ch0[k];
        sum += m * m;
      }
      const subRms = Math.sqrt(sum / Math.max(1, sEnd - sStart));
      if (s > 0) {
        modFlux += Math.abs(subRms - prevSubRms);
      }
      prevSubRms = subRms;
    }
    const normSyllableMod = Math.min(1, (modFlux / (midRms * 10 + 1e-9)) * 2.2);

    // Combined multi-feature vocal likelihood score [0..1]
    const rawScore = ch1
      ? vocalBandShare * 0.42 +
        centerDominance * vocalBandShare * 0.55 +
        harmonicPeakFactor * vocalBandShare * 0.25 +
        normSyllableMod * vocalBandShare * 0.20
      : vocalBandShare * 0.72 + harmonicPeakFactor * vocalBandShare * 0.25 + normSyllableMod * vocalBandShare * 0.20;

    rawVocalScores.push(Math.max(0, Math.min(1, rawScore)));
  }

  const isMono = !ch1 || totalSideRms / (totalMidRms + 1e-9) < 0.03;

  // Smooth vocal timeline (3-frame weighted moving average)
  const vocalTimeline: number[] = rawVocalScores.map((_, idx) => {
    const prev = rawVocalScores[Math.max(0, idx - 1)];
    const curr = rawVocalScores[idx];
    const next = rawVocalScores[Math.min(rawVocalScores.length - 1, idx + 1)];
    return Math.round(((prev + curr * 2 + next) / 4) * 1000) / 1000;
  });

  // Strict adaptive vocal threshold on active frames
  const activeScores = vocalTimeline
    .filter((_, idx) => frameRmsList[idx] >= MIN_ACTIVE_INSTRUMENTAL_RMS)
    .sort((a, b) => a - b);

  const p25 = activeScores.length > 0 ? activeScores[Math.floor(activeScores.length * 0.25)] : 0.22;
  const p75 = activeScores.length > 0 ? activeScores[Math.floor(activeScores.length * 0.75)] : 0.58;
  const scoreSpread = p75 - p25;

  // If spread is tiny and scores are all low, track is likely 100% instrumental
  const vocalThreshold =
    scoreSpread < 0.08 && p75 < 0.34
      ? 0.38
      : Math.max(0.22, Math.min(0.56, p25 + scoreSpread * 0.42));

  // Label frames strictly: active audio AND vocalScore below threshold
  const frameIsPureInst = vocalTimeline.map((score, idx) => {
    const rms = frameRmsList[idx];
    if (rms < MIN_ACTIVE_INSTRUMENTAL_RMS) return false; // silence is NOT an active instrumental transition point
    return score < vocalThreshold;
  });

  // De-glitch single-frame (0.5s) blips inside sustained sections
  for (let i = 1; i < frameIsPureInst.length - 1; i++) {
    if (
      frameRmsList[i] >= MIN_ACTIVE_INSTRUMENTAL_RMS &&
      frameIsPureInst[i] !== frameIsPureInst[i - 1] &&
      frameIsPureInst[i] !== frameIsPureInst[i + 1]
    ) {
      frameIsPureInst[i] = frameIsPureInst[i - 1];
    }
  }

  const activeFrameCount = frameRmsList.filter((r) => r >= MIN_ACTIVE_INSTRUMENTAL_RMS).length;
  const instActiveCount = frameIsPureInst.filter(Boolean).length;
  const isFullInstrumentalTrack =
    activeFrameCount > 0 && instActiveCount / activeFrameCount >= 0.85;

  // Extract verified contiguous active instrumental windows (>= 3.5s)
  const instrumentalWindows: InstrumentalWindow[] = [];
  {
    let wStart = -1;
    for (let i = 0; i <= frameIsPureInst.length; i++) {
      const active = i < frameIsPureInst.length && frameIsPureInst[i];
      if (active && wStart === -1) {
        wStart = i;
      } else if (!active && wStart !== -1) {
        const startSec = Math.round(wStart * 0.5 * 10) / 10;
        const endSec = Math.min(Math.round(duration * 10) / 10, Math.round(i * 0.5 * 10) / 10);
        if (endSec - startSec >= 3.5) {
          let rmsSum = 0;
          let vocSum = 0;
          for (let k = wStart; k < i; k++) {
            rmsSum += frameRmsList[k];
            vocSum += vocalTimeline[k];
          }
          const cnt = Math.max(1, i - wStart);
          instrumentalWindows.push({
            start: startSec,
            end: endSec,
            avgRms: Math.round((rmsSum / cnt) * 10000) / 10000,
            avgVocal: Math.round((vocSum / cnt) * 1000) / 1000
          });
        }
        wStart = -1;
      }
    }
  }

  // Build readable segments for UI & transition points
  const segments: MusicSegment[] = [];
  const bestTransitionPoints: number[] = [];

  if (frameIsPureInst.length > 0) {
    let segStartFrame = 0;
    let currentInst = frameIsPureInst[0];
    let instIdx = 1;
    let vocalIdx = 1;

    const pushSegment = (startF: number, endF: number, isInst: boolean) => {
      const startSec = Math.round(startF * 0.5 * 10) / 10;
      const endSec = Math.min(Math.round(duration * 10) / 10, Math.round(endF * 0.5 * 10) / 10);
      if (endSec - startSec < 1.0 && segments.length > 0) {
        segments[segments.length - 1].end = endSec;
        return;
      }
      let label: string;
      if (isInst) {
        if (startSec < 6) label = 'Intro (Instrumental Tune)';
        else if (endSec >= duration - 6) label = 'Outro (Beat & Fade)';
        else label = `Instrumental Bridge #${instIdx++}`;
      } else {
        label = `Vocal / Lyrics Section #${vocalIdx++}`;
      }
      segments.push({ start: startSec, end: endSec, label, isInstrumental: isInst });
      if (isInst && endSec - startSec >= 3.5) {
        bestTransitionPoints.push(Math.round((startSec + Math.min(3.0, (endSec - startSec) * 0.25)) * 10) / 10);
      }
    };

    for (let i = 1; i < frameIsPureInst.length; i++) {
      if (frameIsPureInst[i] !== currentInst) {
        pushSegment(segStartFrame, i, currentInst);
        segStartFrame = i;
        currentInst = frameIsPureInst[i];
      }
    }
    pushSegment(segStartFrame, frameIsPureInst.length, currentInst);
  }

  // 3. Real Beat Grid & BPM Detection via Onset Energy Autocorrelation
  let bpm = 112;
  let beatOffset = 0;
  try {
    const hopSec = 0.02; // 50 Hz onset envelope
    const hopSamples = Math.max(1, Math.floor(sampleRate * hopSec));
    const maxOnsetSamples = Math.min(ch0.length, Math.floor(sampleRate * 90));
    const numHops = Math.floor(maxOnsetSamples / hopSamples);

    if (numHops > 200) {
      const hopEnergy = new Float32Array(numHops);
      // 1-pole 220Hz low-pass isolates kick/bass rhythm pulse from vocal syllable modulation
      const lpAlpha = Math.min(0.99, (2 * Math.PI * 220) / Math.max(1, sampleRate));
      let lpState = 0;
      for (let h = 0; h < numHops; h++) {
        const start = h * hopSamples;
        const end = Math.min(start + hopSamples, ch0.length);
        let e = 0;
        for (let k = start; k < end; k++) {
          const s = ch1 ? 0.5 * (ch0[k] + ch1[k]) : ch0[k];
          lpState += lpAlpha * (s - lpState);
          e += lpState * lpState;
        }
        hopEnergy[h] = Math.sqrt(e / Math.max(1, end - start));
      }

      const onsets = new Float32Array(numHops);
      for (let h = 1; h < numHops; h++) {
        const diff = hopEnergy[h] - hopEnergy[h - 1];
        onsets[h] = diff > 0 ? diff : 0;
      }

      const minLag = Math.max(1, Math.floor(60 / (170 * hopSec)));
      const maxLag = Math.min(numHops - 1, Math.ceil(60 / (65 * hopSec)));

      let bestLag = minLag;
      let bestCorr = -1;
      const corrByLag = new Float32Array(maxLag + 1);

      for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0;
        const limit = numHops - lag;
        for (let h = 0; h < limit; h++) {
          sum += onsets[h] * onsets[h + lag];
        }
        const candidateBpm = 60 / (lag * hopSec);
        const tempoBias = candidateBpm >= 88 && candidateBpm <= 145 ? 1.12 : 1.0;
        const score = (sum / Math.max(1, limit)) * tempoBias;
        corrByLag[lag] = score;
        if (score > bestCorr) {
          bestCorr = score;
          bestLag = lag;
        }
      }

      const y0 = bestLag > minLag ? corrByLag[bestLag - 1] : corrByLag[bestLag];
      const y1 = corrByLag[bestLag];
      const y2 = bestLag < maxLag ? corrByLag[bestLag + 1] : corrByLag[bestLag];
      const denom = y0 - 2 * y1 + y2;
      const delta = Math.abs(denom) > 1e-9 ? Math.max(-0.5, Math.min(0.5, (0.5 * (y0 - y2)) / denom)) : 0;
      const refinedLag = bestLag + delta;

      const detectedBpm = Math.round(60 / (refinedLag * hopSec));
      if (detectedBpm >= 60 && detectedBpm <= 185) {
        bpm = detectedBpm;
      }

      const beatInterval = 60 / bpm;
      const phaseSteps = 20;
      let bestPhase = 0;
      let bestPhaseScore = -1;
      for (let p = 0; p < phaseSteps; p++) {
        const offsetSec = (p / phaseSteps) * beatInterval;
        let combScore = 0;
        for (let t = offsetSec; t < Math.min(duration, 25); t += beatInterval) {
          const hopIdx = Math.min(numHops - 1, Math.round(t / hopSec));
          const prevIdx = Math.max(0, hopIdx - 1);
          const nextIdx = Math.min(numHops - 1, hopIdx + 1);
          combScore += onsets[hopIdx] + 0.5 * (onsets[prevIdx] + onsets[nextIdx]);
        }
        if (combScore > bestPhaseScore) {
          bestPhaseScore = combScore;
          bestPhase = offsetSec;
        }
      }
      beatOffset = Math.round(bestPhase * 1000) / 1000;
    }
  } catch (err) {
    console.warn('Beat-grid detection fallback:', err);
  }

  const maxRms = Math.max(...frameRmsList, 0.01);
  const avgNormRms = frameRmsList.reduce((a, b) => a + b / maxRms, 0) / Math.max(1, frameRmsList.length);
  const energy: 'Low' | 'Medium' | 'High' = avgNormRms > 0.48 ? 'High' : avgNormRms > 0.28 ? 'Medium' : 'Low';

  let vibe = 'Smooth Chill';
  if (bpm > 125) vibe = 'High-Energy Anthem';
  else if (bpm > 105) vibe = 'Rhythmic Focus Beats';
  else if (bpm > 88) vibe = 'Chill Harmonic Vibe';

  return {
    bpm,
    beatOffset,
    duration,
    introAudioStart,
    isMono,
    isFullInstrumentalTrack,
    vocalThreshold,
    vocalTimeline,
    rmsTimeline: frameRmsList,
    instrumentalWindows,
    energy,
    vibe,
    segments,
    bestTransitionPoints
  };
}

export async function analyzeAudioStructure(dataUrl: string): Promise<MusicAnalysis> {
  let tempCtx: AudioContext | null = null;
  try {
    const response = await fetch(dataUrl);
    const arrayBuffer = await response.arrayBuffer();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }
    tempCtx = new AudioContextClass();
    const currentCtx = tempCtx;
    const audioBuffer = await currentCtx.decodeAudioData(arrayBuffer).catch(() => {
      return new Promise<AudioBuffer>((resolve, reject) => {
        currentCtx.decodeAudioData(arrayBuffer, resolve, reject);
      });
    });

    return analyzeAudioBuffer(audioBuffer);
  } catch (err) {
    console.warn('PCM Analysis decoding error, returning safe metadata:', err);
    return {
      bpm: 108,
      beatOffset: 0,
      introAudioStart: 0,
      isMono: false,
      isFullInstrumentalTrack: false,
      vocalThreshold: 0.34,
      energy: 'Medium',
      vibe: 'Melodic Instrumental Wave',
      segments: [
        { start: 0, end: 15, label: 'Intro (Instrumental Tune)', isInstrumental: true },
        { start: 15, end: 65, label: 'Vocal / Lyrics Section', isInstrumental: false },
        { start: 65, end: 100, label: 'Chorus (High Energy)', isInstrumental: false },
        { start: 100, end: 125, label: 'Instrumental Bridge', isInstrumental: true },
        { start: 125, end: 165, label: 'Verse 2 / Build-up', isInstrumental: false },
        { start: 165, end: 195, label: 'Outro (Beat & Fade)', isInstrumental: true }
      ],
      instrumentalWindows: [
        { start: 1.5, end: 15, avgRms: 0.1, avgVocal: 0.15 },
        { start: 100, end: 125, avgRms: 0.12, avgVocal: 0.15 },
        { start: 165, end: 195, avgRms: 0.1, avgVocal: 0.15 }
      ],
      bestTransitionPoints: [3, 106, 170]
    };
  } finally {
    if (tempCtx && tempCtx.state !== 'closed') {
      try {
        tempCtx.close().catch(() => {});
      } catch {}
    }
  }
}

// ============================================================================
// INTELLIGENT INSTRUMENTAL CUEING, BEAT MATCHING & REMIX QUEUE HELPERS
// ============================================================================

/**
 * Harmonic / Octave-folded Beat Matching.
 * e.g., 70 BPM matches 140 BPM at 1.00x, 118 BPM matches 124 BPM at 0.952x.
 */
export function computeBeatMatchRatio(currentBpm?: number, nextBpm?: number): number {
  if (!currentBpm || !nextBpm || currentBpm < 45 || nextBpm < 45) return 1.0;

  const candidates = [nextBpm, nextBpm * 2, nextBpm / 2];
  let bestBpm = nextBpm;
  let minDiff = Infinity;

  for (const cand of candidates) {
    if (cand < 45 || cand > 220) continue;
    const diff = Math.abs(cand - currentBpm);
    if (diff < minDiff) {
      minDiff = diff;
      bestBpm = cand;
    }
  }

  const rawRatio = currentBpm / bestBpm;
  return Math.max(0.92, Math.min(1.08, Math.round(rawRatio * 1000) / 1000));
}

/**
 * Quantizes a target cue timestamp within +-maxShiftSec onto the track's beat grid.
 */
export function alignPositionToBeatGrid(
  targetTime: number,
  analysis?: MusicAnalysis,
  maxShiftSec = 0.35
): number {
  if (!analysis || !analysis.bpm || analysis.bpm <= 0) return Math.max(0, targetTime);
  const beatInterval = 60 / analysis.bpm;
  const offset = analysis.beatOffset || 0;
  const n = Math.round((targetTime - offset) / beatInterval);
  const snapped = offset + n * beatInterval;
  if (Math.abs(snapped - targetTime) <= maxShiftSec && snapped >= 0) {
    return Math.round(snapped * 1000) / 1000;
  }
  return Math.max(0, targetTime);
}

/**
 * Strictly checks if a window [startSec, endSec] is verified active instrumental
 * (no vocals AND real audible music RMS >= MIN_ACTIVE_INSTRUMENTAL_RMS).
 */
export function isWindowInstrumental(
  analysis: MusicAnalysis | undefined,
  startSec: number,
  endSec: number
): boolean {
  if (!analysis) return false;
  if (analysis.vocalTimeline && analysis.vocalTimeline.length > 0) {
    const threshold = analysis.vocalThreshold ?? 0.34;
    const startIdx = Math.max(0, Math.floor(startSec / 0.5));
    const endIdx = Math.min(analysis.vocalTimeline.length - 1, Math.floor(endSec / 0.5));
    if (endIdx < startIdx) return false;

    let vocalSum = 0;
    let maxVocalInWindow = 0;
    let rmsSum = 0;
    let count = 0;

    for (let i = startIdx; i <= endIdx; i++) {
      const v = analysis.vocalTimeline[i];
      vocalSum += v;
      if (v > maxVocalInWindow) maxVocalInWindow = v;
      if (analysis.rmsTimeline && analysis.rmsTimeline[i] !== undefined) {
        rmsSum += analysis.rmsTimeline[i];
      } else {
        rmsSum += 0.05;
      }
      count++;
    }

    if (count === 0) return false;
    const avgVocal = vocalSum / count;
    const avgRms = rmsSum / count;

    // Must have real instruments audible AND no vocal peak exceeding threshold + slight margin
    return (
      avgRms >= MIN_ACTIVE_INSTRUMENTAL_RMS &&
      avgVocal < threshold &&
      maxVocalInWindow < threshold + 0.08
    );
  }

  if (analysis.segments && analysis.segments.length > 0) {
    const mid = (startSec + endSec) * 0.5;
    const seg = analysis.segments.find((s) => mid >= s.start && mid <= s.end);
    return seg ? seg.isInstrumental && seg.end - mid >= 2.5 : false;
  }

  return false;
}

/**
 * Selects the best Instrumental Entry point for the incoming track in Remix Mode.
 * Rule: "পরবর্তী গানও তার প্রথম অংশ থেকে নয়, বরং যেখানে Instrumental চলছে সেই উপযুক্ত অংশ থেকে শুরু হবে।"
 * - Never enters on dead silence or at 0:00 fade-in.
 * - Prefers an active instrumental groove/intro/bridge (>= 4.5s long, zero vocals, strong instruments)
 *   inside the first 60% of the track so the track still has rich content to play forward.
 * - Snaps cleanly onto the track's beat grid.
 */
export function findBestInstrumentalEntry(analysis: MusicAnalysis | undefined): number {
  if (!analysis) return 0;
  const dur = analysis.duration || 180;
  const windows = (analysis.instrumentalWindows || []).filter(
    (w) => w.end - w.start >= MIN_INST_WINDOW_SECONDS && w.start < dur * 0.72
  );

  if (windows.length > 0) {
    // Prefer an early active instrumental section (e.g. established groove past initial 0:00 fade-in, or first instrumental bridge)
    // Score each window: balance strong instrumental RMS, low vocal bleed, and earlier placement so song plays forward nicely.
    let bestCue = windows[0].start;
    let bestScore = -Infinity;

    for (const w of windows) {
      const len = w.end - w.start;
      // Enter slightly inside the established groove (not at 0.0s fade-in!) while keeping >= 4.5s of instrumental ahead
      const maxOffsetInside = Math.max(0, len - 4.5);
      const grooveOffset = w.start < 2.0 ? Math.min(maxOffsetInside, Math.max(2.0, (analysis.introAudioStart || 0) + 1.5)) : Math.min(maxOffsetInside, 1.0);
      const candidateTime = w.start + grooveOffset;

      const rmsScore = Math.min(1, w.avgRms / 0.15) * 1.4;
      const purityScore = (1 - w.avgVocal) * 2.0;
      const earlyBonus = w.start < dur * 0.45 ? 1.0 : 0.2;
      const notZeroBonus = candidateTime >= 1.5 ? 0.5 : 0;

      const total = rmsScore + purityScore + earlyBonus + notZeroBonus;
      if (total > bestScore) {
        bestScore = total;
        bestCue = candidateTime;
      }
    }

    return alignPositionToBeatGrid(bestCue, analysis, 0.35);
  }

  // Fallback using segments if instrumentalWindows wasn't populated
  const instSeg = (analysis.segments || []).find(
    (s) => s.isInstrumental && s.end - s.start >= 4.0 && s.start < dur * 0.65
  );
  if (instSeg) {
    const offset = instSeg.start < 1.5 ? Math.min(2.5, Math.max(0, instSeg.end - instSeg.start - 4.0)) : 0.5;
    return alignPositionToBeatGrid(instSeg.start + offset, analysis, 0.35);
  }

  // Last-resort lowest-vocal pocket in first 55% of vocalTimeline
  if (analysis.vocalTimeline && analysis.vocalTimeline.length >= 10) {
    const searchLimit = Math.min(analysis.vocalTimeline.length - 8, Math.floor((dur * 0.55) / 0.5));
    let bestIdx = Math.min(4, searchLimit);
    let lowestVocal = Infinity;
    for (let i = 2; i <= searchLimit; i++) {
      let vSum = 0;
      let rSum = 0;
      for (let k = 0; k < 8; k++) {
        vSum += analysis.vocalTimeline[i + k];
        rSum += analysis.rmsTimeline?.[i + k] ?? 0.05;
      }
      if (rSum / 8 >= MIN_ACTIVE_INSTRUMENTAL_RMS && vSum < lowestVocal) {
        lowestVocal = vSum;
        bestIdx = i;
      }
    }
    return alignPositionToBeatGrid(bestIdx * 0.5, analysis, 0.35);
  }

  return Math.max(0, analysis.introAudioStart || 0);
}

export interface OutgoingCuePlan {
  cueTime: number;
  isPureInstrumental: boolean;
  crossfadeSec: number;
}

/**
 * Computes the optimal outgoing transition cue strictly BEFORE the 1:30 (90s) max ceiling.
 * - Priority 1: Verified pure instrumental window (>= 3.5s active music, zero vocals) inside [minPlay..85s].
 * - Priority 2: Natural outro if track ends before sliceStart + 85s.
 * - Priority 3: Vocal-heavy tracks with no pure instrumental pocket before 1:30 -> selects lowest-vocal,
 *   beat-aligned rhythm pocket inside [52s..85s] and flags isPureInstrumental=false so Web Audio DSP
 *   vocal elimination removes vocals/lyrics during the 5.0s crossfade (never stuck past 1:30!).
 */
export function findBestOutgoingInstrumentalCue(
  analysis: MusicAnalysis | undefined,
  sliceStart: number,
  trackDuration?: number,
  currentTimeSec?: number
): OutgoingCuePlan {
  const crossfadeSec = REMIX_CROSSFADE_SECONDS;
  const maxOffsetFromSlice = MAX_REMIX_SLICE_SECONDS - crossfadeSec; // 85.0s
  const minOffset = analysis?.isFullInstrumentalTrack ? FULL_INST_PHRASE_PLAY_SEC : MIN_PLAY_BEFORE_MIX_SEC;

  const baseEarliest = sliceStart + minOffset;
  let latestCue = sliceStart + maxOffsetFromSlice;

  if (trackDuration && isFinite(trackDuration) && trackDuration > crossfadeSec + 2) {
    const naturalOutroCue = Math.max(0, trackDuration - crossfadeSec);
    if (naturalOutroCue < latestCue) {
      latestCue = naturalOutroCue;
    }
  }

  const earliestCue =
    currentTimeSec !== undefined && isFinite(currentTimeSec)
      ? Math.min(latestCue, Math.max(baseEarliest, currentTimeSec - 0.5))
      : baseEarliest;

  if (latestCue <= sliceStart + 1) {
    return {
      cueTime: Math.max(0, latestCue),
      isPureInstrumental: true,
      crossfadeSec: Math.min(crossfadeSec, Math.max(2.0, (trackDuration || 10) * 0.4))
    };
  }

  // Priority 1: Verified pure active instrumental window inside [earliestCue .. latestCue]
  if (analysis?.instrumentalWindows && analysis.instrumentalWindows.length > 0) {
    let bestCue = -1;
    let bestScore = -Infinity;

    for (const w of analysis.instrumentalWindows) {
      const ovStart = Math.max(earliestCue, w.start);
      const ovEnd = Math.min(latestCue + crossfadeSec, w.end);
      const ovLen = ovEnd - ovStart;
      if (ovLen >= 3.5) {
        const candidateRaw = Math.min(latestCue, ovStart + Math.min(0.6, Math.max(0, ovLen - 4.0) * 0.25));
        const snapped = alignPositionToBeatGrid(candidateRaw, analysis, 0.35);
        const clamped = Math.min(latestCue, Math.max(earliestCue, snapped));
        const score = (ovLen >= 5.0 ? 2.5 : 1.0) + (1 - w.avgVocal) * 2.0 + Math.min(1, w.avgRms / 0.12);
        if (score > bestScore) {
          bestScore = score;
          bestCue = clamped;
        }
      }
    }

    if (bestCue >= 0) {
      return {
        cueTime: Math.round(bestCue * 100) / 100,
        isPureInstrumental: true,
        crossfadeSec
      };
    }
  }

  // Priority 2: Segment fallback if vocalTimeline absent
  if (!analysis?.vocalTimeline && analysis?.segments) {
    const seg = analysis.segments.find(
      (s) => s.isInstrumental && Math.min(latestCue + 4, s.end) - Math.max(earliestCue, s.start) >= 3.0
    );
    if (seg) {
      const raw = Math.min(latestCue, Math.max(earliestCue, seg.start + 0.5));
      return {
        cueTime: alignPositionToBeatGrid(raw, analysis, 0.35),
        isPureInstrumental: true,
        crossfadeSec
      };
    }
  }

  // Priority 3: Vocal-heavy track -> scan [52s .. latestCue] for lowest-vocal beat pocket (DSP removes vocals!)
  if (analysis?.vocalTimeline && analysis.vocalTimeline.length >= 10) {
    const scanStartSec = Math.min(latestCue - 2, Math.max(earliestCue, sliceStart + 52));
    const startIdx = Math.max(0, Math.floor(scanStartSec / 0.5));
    const winFrames = Math.max(6, Math.round(crossfadeSec / 0.5));
    const endIdx = Math.min(analysis.vocalTimeline.length - winFrames, Math.floor(latestCue / 0.5));

    if (endIdx >= startIdx) {
      let bestIdx = endIdx;
      let lowestVocalScore = Infinity;

      for (let i = startIdx; i <= endIdx; i++) {
        let vSum = 0;
        let rSum = 0;
        for (let k = 0; k < winFrames; k++) {
          vSum += analysis.vocalTimeline[i + k];
          rSum += analysis.rmsTimeline?.[i + k] ?? 0.05;
        }
        const avgRms = rSum / winFrames;
        const avgVoc = vSum / winFrames;
        if (avgRms >= MIN_ACTIVE_INSTRUMENTAL_RMS && avgVoc < lowestVocalScore) {
          lowestVocalScore = avgVoc;
          bestIdx = i;
        }
      }

      const rawCue = Math.min(latestCue, Math.max(earliestCue, bestIdx * 0.5));
      const beatSnapped = Math.min(latestCue, alignPositionToBeatGrid(rawCue, analysis, 0.35));
      const threshold = analysis.vocalThreshold ?? 0.34;
      return {
        cueTime: Math.round(beatSnapped * 100) / 100,
        isPureInstrumental: lowestVocalScore < threshold,
        crossfadeSec
      };
    }
  }

  // Guaranteed safe fallback <= sliceStart + 85.0s with DSP vocal filter active
  return {
    cueTime: Math.round(latestCue * 100) / 100,
    isPureInstrumental: false,
    crossfadeSec
  };
}

/**
 * Generates an equal-power sinusoidal crossfade curve (length samples)
 * for sample-accurate GainNode.setValueCurveAtTime automation.
 */
export function createEqualPowerCurve(fadeOut: boolean, samples = 64): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    curve[i] = fadeOut
      ? Math.max(0, Math.cos((t * Math.PI) / 2))
      : Math.min(1, Math.sin((t * Math.PI) / 2));
  }
  return curve;
}

/**
 * Computes the next incomplete track index in sequential order.
 * Returns -1 if ALL tracks in the queue are completed.
 */
export function getNextIncompleteTrackIndex(
  tracks: MusicItem[],
  currentIndex: number,
  completedIds: Record<string, boolean>
): number {
  if (!tracks || tracks.length === 0) return -1;
  for (let offset = 1; offset <= tracks.length; offset++) {
    const idx = (currentIndex + offset) % tracks.length;
    const tr = tracks[idx];
    if (tr && !completedIds[tr.id]) {
      return idx;
    }
  }
  return -1;
}

// ============================================================================
// AUTOMATIC PAUSE LOCK REGISTRY (Growgram, Lecture Room, Teacher AI, Videos)
// ============================================================================

const pauseLockReasons = new Set<string>();

export function acquireBgMusicPauseLock(reason: string): void {
  if (typeof window === 'undefined' || !reason) return;
  const wasEmpty = pauseLockReasons.size === 0;
  pauseLockReasons.add(reason);

  if (wasEmpty && pauseLockReasons.size > 0) {
    const activeEngine =
      window.bgMusicActiveIndex === 0 ? window.bgMusicEngine : window.bgMusicEngineSec;
    const isPlayingOrEnabled = Boolean(
      window.bgMusicIsEnabled &&
        ((activeEngine && !activeEngine.paused) || window.bgMusicIsTransitioning)
    );
    if (isPlayingOrEnabled || window.bgMusicIsEnabled) {
      if (activeEngine && !activeEngine.paused) {
        window.bgMusicAutoPaused = true;
        if (window.pauseBgMusic) {
          window.pauseBgMusic(true);
        }
      } else if (window.bgMusicIsEnabled) {
        window.bgMusicAutoPaused = true;
      }
      window.dispatchEvent(
        new CustomEvent('bg_music_auto_pause_change', {
          detail: { autoPaused: Boolean(window.bgMusicAutoPaused), reasons: Array.from(pauseLockReasons) }
        })
      );
    }
  }
}

export function releaseBgMusicPauseLock(reason: string): void {
  if (typeof window === 'undefined' || !reason) return;
  if (!pauseLockReasons.has(reason)) return;
  pauseLockReasons.delete(reason);

  if (pauseLockReasons.size === 0) {
    const shouldResume = Boolean(window.bgMusicAutoPaused && window.bgMusicIsEnabled);
    window.bgMusicAutoPaused = false;
    window.dispatchEvent(
      new CustomEvent('bg_music_auto_pause_change', {
        detail: { autoPaused: false, reasons: [] }
      })
    );
    if (shouldResume && window.playBgMusic) {
      window.playBgMusic();
    }
  }
}

export function getBgMusicPauseLocks(): string[] {
  return Array.from(pauseLockReasons);
}

// ============================================================================
// WEB AUDIO DUAL-DECK DSP MIXER & REMIX PLAYBACK CONTROLLER
// ============================================================================

interface DeckDspNodes {
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  dryGain: GainNode;
  instGain: GainNode;
  stereoBranchGain: GainNode;
  monoBranchGain: GainNode;
  deckOutGain: GainNode;
}

function loadJsonStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJsonStorage(key: string, value: unknown): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function canUseWebAudioForUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return true;
  try {
    if (typeof window !== 'undefined') {
      const parsed = new URL(url, window.location.origin);
      return parsed.origin === window.location.origin;
    }
  } catch {}
  return false;
}

function buildDeckDsp(
  ctx: AudioContext,
  el: HTMLAudioElement,
  destination: AudioNode
): DeckDspNodes {
  const source = ctx.createMediaElementSource(el);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;

  const dryGain = ctx.createGain();
  dryGain.gain.value = 1.0;

  const instGain = ctx.createGain();
  instGain.gain.value = 0.0;

  const deckOutGain = ctx.createGain();
  deckOutGain.gain.value = 1.0;

  source.connect(analyser);

  // Dry path (100% original audio quality)
  source.connect(dryGain);
  dryGain.connect(deckOutGain);

  // Instrumental-Only Guard Path A: High-Rejection Stereo Center-Vocal Cancellation + Sub-Bass & Air Bed
  const stereoBranchGain = ctx.createGain();
  stereoBranchGain.gain.value = 1.0;

  const splitter = ctx.createChannelSplitter(2);
  const merger = ctx.createChannelMerger(2);
  const lPass = ctx.createGain();
  const rPass = ctx.createGain();
  const invL = ctx.createGain();
  const invR = ctx.createGain();
  lPass.gain.value = 1.0;
  rPass.gain.value = 1.0;
  invL.gain.value = -0.96;
  invR.gain.value = -0.96;

  source.connect(splitter);
  splitter.connect(lPass, 0);
  splitter.connect(invR, 1);
  lPass.connect(merger, 0, 0);
  invR.connect(merger, 0, 0);

  splitter.connect(rPass, 1);
  splitter.connect(invL, 0);
  rPass.connect(merger, 0, 1);
  invL.connect(merger, 0, 1);

  const msNotchLow = ctx.createBiquadFilter();
  msNotchLow.type = 'peaking';
  msNotchLow.frequency.value = 1050;
  msNotchLow.Q.value = 0.8;
  msNotchLow.gain.value = -12.0;

  const msNotchHigh = ctx.createBiquadFilter();
  msNotchHigh.type = 'peaking';
  msNotchHigh.frequency.value = 2300;
  msNotchHigh.Q.value = 0.9;
  msNotchHigh.gain.value = -10.0;

  const subKeep = ctx.createBiquadFilter();
  subKeep.type = 'lowpass';
  subKeep.frequency.value = 230;
  subKeep.Q.value = 0.707;
  const subKeepGain = ctx.createGain();
  subKeepGain.gain.value = 0.95;

  const airKeep = ctx.createBiquadFilter();
  airKeep.type = 'highpass';
  airKeep.frequency.value = 4600;
  airKeep.Q.value = 0.707;
  const airKeepGain = ctx.createGain();
  airKeepGain.gain.value = 0.45;

  merger.connect(msNotchLow);
  msNotchLow.connect(msNotchHigh);
  msNotchHigh.connect(stereoBranchGain);
  source.connect(subKeep);
  subKeep.connect(subKeepGain);
  subKeepGain.connect(stereoBranchGain);
  source.connect(airKeep);
  airKeep.connect(airKeepGain);
  airKeepGain.connect(stereoBranchGain);
  stereoBranchGain.connect(instGain);

  // Instrumental-Only Guard Path B: Mono Vocal-Band Elimination (<240 Hz rhythm bass + >4400 Hz percussion air)
  const monoBranchGain = ctx.createGain();
  monoBranchGain.gain.value = 0.0;

  const monoLow = ctx.createBiquadFilter();
  monoLow.type = 'lowpass';
  monoLow.frequency.value = 240;
  monoLow.Q.value = 0.707;

  const monoHigh = ctx.createBiquadFilter();
  monoHigh.type = 'highpass';
  monoHigh.frequency.value = 4400;
  monoHigh.Q.value = 0.707;

  const monoLowGain = ctx.createGain();
  monoLowGain.gain.value = 0.95;
  const monoHighGain = ctx.createGain();
  monoHighGain.gain.value = 0.72;

  source.connect(monoLow);
  source.connect(monoHigh);
  monoLow.connect(monoLowGain);
  monoHigh.connect(monoHighGain);
  monoLowGain.connect(monoBranchGain);
  monoHighGain.connect(monoBranchGain);
  monoBranchGain.connect(instGain);

  instGain.connect(deckOutGain);
  deckOutGain.connect(destination);

  return {
    source,
    analyser,
    dryGain,
    instGain,
    stereoBranchGain,
    monoBranchGain,
    deckOutGain
  };
}

declare global {
  interface Window {
    bgMusicEngine?: HTMLAudioElement;
    bgMusicEngineSec?: HTMLAudioElement;
    bgMusicActiveIndex?: number;
    bgMusicTrackList?: MusicItem[];
    bgMusicAllTracks?: MusicItem[];
    bgMusicCurrentIndex?: number;
    bgMusicIsEnabled?: boolean;
    bgMusicAutoPaused?: boolean;
    bgMusicPositions?: Record<string, number>;
    bgMusicDurations?: Record<string, number>;
    bgMusicRemixCompletedIds?: Record<string, boolean>;
    bgMusicRemixSelectedIds?: string[] | null;
    bgMusicSliceStartPos?: number;
    bgMusicSlicePlayTime?: number;
    bgMusicTimeout?: any;
    playNextBgTrack?: () => void;
    playBgMusic?: () => void;
    pauseBgMusic?: (fade?: boolean) => void;
    selectBgMusic?: (index: number) => void;
    selectBgMusicById?: (trackId: string) => void;
    resetBgMusicRemixSession?: () => void;
    getBgMusicRemixStatus?: () => RemixSessionStatus;
    onBgMusicTrackChange?: (index: number, trackId: string | null) => void;
    bgMusicAudioCtx?: AudioContext;
    bgMusicAnalyser1?: AnalyserNode;
    bgMusicAnalyser2?: AnalyserNode;
    bgMusicDeck1?: DeckDspNodes;
    bgMusicDeck2?: DeckDspNodes;
    bgMusicMasterGain?: GainNode;
    bgMusicVocalHistory?: number[];
    bgMusicIsTransitioning?: boolean;
    bgMusicPauseCounter?: number;
    bgMusicFastFade?: boolean;
    bgMusicRemixModeEnabled?: boolean;
    bgMusicRemixBlendInterval?: number;
    bgMusicRemixSessionDuration?: number;
    bgMusicRemixSessionStartTime?: number;
    bgMusicRemixClimaxActive?: boolean;
    playClimaxMashup?: () => void;
    bgMusicPlayedCount?: number;
    bgMusicTransitionStartTime?: number;
    reelScrollCooldown?: boolean;
    bgMusicPlaybackMode?: 'normal' | 'remix';
    setBgMusicPlaybackMode?: (mode: 'normal' | 'remix') => void;
    setBgMusicRemixSelectedIds?: (ids: string[] | null) => void;
    acquireBgMusicPauseLock?: (reason: string) => void;
    releaseBgMusicPauseLock?: (reason: string) => void;
  }
}

let lastPersistTs = 0;

function persistPositionsAndState() {
  if (typeof window === 'undefined') return;
  if (window.bgMusicPositions) {
    saveJsonStorage(POSITIONS_STORAGE_KEY, window.bgMusicPositions);
  }
  if (window.bgMusicDurations) {
    saveJsonStorage(DURATIONS_STORAGE_KEY, window.bgMusicDurations);
  }
  if (window.bgMusicRemixCompletedIds) {
    saveJsonStorage(COMPLETED_STORAGE_KEY, window.bgMusicRemixCompletedIds);
  }
}

function emitRemixProgressEvent(isInstrumentalTransitionActive = false, isInstrumentalReady = false) {
  if (typeof window === 'undefined') return;
  const status = window.getBgMusicRemixStatus ? window.getBgMusicRemixStatus() : null;
  if (status) {
    status.isInstrumentalTransitionActive = isInstrumentalTransitionActive;
    status.isInstrumentalReady = isInstrumentalReady;
    window.dispatchEvent(new CustomEvent('bg_music_remix_progress', { detail: status }));
  }
}

export function initRemixAudioEngine(): void {
  if (typeof window === 'undefined') return;
  if ((window as any).__REMIX_ENGINE_INITIALIZED__) return;
  (window as any).__REMIX_ENGINE_INITIALIZED__ = true;

  window.bgMusicPositions = loadJsonStorage<Record<string, number>>(POSITIONS_STORAGE_KEY, {});
  window.bgMusicDurations = loadJsonStorage<Record<string, number>>(DURATIONS_STORAGE_KEY, {});
  window.bgMusicRemixCompletedIds = loadJsonStorage<Record<string, boolean>>(COMPLETED_STORAGE_KEY, {});
  window.bgMusicRemixSelectedIds = loadJsonStorage<string[] | null>(REMIX_SELECTED_IDS_KEY, null);
  window.bgMusicSliceStartPos = window.bgMusicSliceStartPos ?? 0;
  window.bgMusicSlicePlayTime = 0;
  window.bgMusicAutoPaused = false;
  window.acquireBgMusicPauseLock = acquireBgMusicPauseLock;
  window.releaseBgMusicPauseLock = releaseBgMusicPauseLock;

  if (window.bgMusicActiveIndex === undefined) {
    window.bgMusicActiveIndex = 0;
  }
  if (!window.bgMusicEngine) {
    window.bgMusicEngine = new Audio();
    window.bgMusicEngine.preload = 'auto';
  }
  if (!window.bgMusicEngineSec) {
    window.bgMusicEngineSec = new Audio();
    window.bgMusicEngineSec.preload = 'auto';
  }
  if (!window.bgMusicTrackList) {
    window.bgMusicTrackList = [];
  }
  if (window.bgMusicCurrentIndex === undefined) {
    window.bgMusicCurrentIndex = 0;
  }

  window.bgMusicIsEnabled = false;
  window.bgMusicPlaybackMode = (localStorage.getItem('bg_music_playback_mode') as 'normal' | 'remix') || 'normal';
  window.bgMusicIsTransitioning = false;

  const getActiveEngine = () =>
    window.bgMusicActiveIndex === 0 ? window.bgMusicEngine! : window.bgMusicEngineSec!;

  const getStandbyEngine = () =>
    window.bgMusicActiveIndex === 0 ? window.bgMusicEngineSec! : window.bgMusicEngine!;

  const getActiveDeck = () =>
    window.bgMusicActiveIndex === 0 ? window.bgMusicDeck1 : window.bgMusicDeck2;

  const getStandbyDeck = () =>
    window.bgMusicActiveIndex === 0 ? window.bgMusicDeck2 : window.bgMusicDeck1;

  let pendingPauseTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPauseInterval: ReturnType<typeof setInterval> | null = null;

  const clearPendingPauseTimers = () => {
    if (pendingPauseTimer) {
      clearTimeout(pendingPauseTimer);
      pendingPauseTimer = null;
    }
    if (pendingPauseInterval) {
      clearInterval(pendingPauseInterval);
      pendingPauseInterval = null;
    }
  };

  const swapActiveEngine = () => {
    window.bgMusicActiveIndex = window.bgMusicActiveIndex === 0 ? 1 : 0;
  };

  const initWebAudio = () => {
    if (typeof window === 'undefined') return;
    const tracks = window.bgMusicTrackList || [];
    const currentTrack = tracks[window.bgMusicCurrentIndex || 0];
    if (currentTrack && !canUseWebAudioForUrl(currentTrack.dataUrl)) {
      return;
    }

    if (window.bgMusicAudioCtx) {
      if (window.bgMusicAudioCtx.state === 'suspended') {
        window.bgMusicAudioCtx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      window.bgMusicAudioCtx = ctx;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 12;
      compressor.ratio.value = 3;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.15;

      const masterGain = ctx.createGain();
      masterGain.gain.value = TARGET_MASTER_GAIN;
      window.bgMusicMasterGain = masterGain;

      compressor.connect(masterGain);
      masterGain.connect(ctx.destination);

      const engine1 = window.bgMusicEngine!;
      const engine2 = window.bgMusicEngineSec!;
      engine1.volume = 1.0;
      engine2.volume = 1.0;

      const deck1 = buildDeckDsp(ctx, engine1, compressor);
      const deck2 = buildDeckDsp(ctx, engine2, compressor);

      window.bgMusicDeck1 = deck1;
      window.bgMusicDeck2 = deck2;
      window.bgMusicAnalyser1 = deck1.analyser;
      window.bgMusicAnalyser2 = deck2.analyser;
    } catch (err) {
      console.warn('Web Audio DSP init failed, using HTMLAudio fallback:', err);
    }
  };

  const setDeckInstrumentalMode = (
    deck: DeckDspNodes | undefined,
    instrumentalOnly: boolean,
    isMono: boolean,
    rampSec = 0.45
  ) => {
    const ctx = window.bgMusicAudioCtx;
    if (!deck || !ctx) return;
    const now = ctx.currentTime;

    deck.stereoBranchGain.gain.cancelScheduledValues(now);
    deck.monoBranchGain.gain.cancelScheduledValues(now);
    deck.stereoBranchGain.gain.setValueAtTime(isMono ? 0 : 1, now);
    deck.monoBranchGain.gain.setValueAtTime(isMono ? 1 : 0, now);

    deck.dryGain.gain.cancelScheduledValues(now);
    deck.instGain.gain.cancelScheduledValues(now);
    deck.dryGain.gain.setValueAtTime(deck.dryGain.gain.value, now);
    deck.instGain.gain.setValueAtTime(deck.instGain.gain.value, now);

    deck.dryGain.gain.linearRampToValueAtTime(instrumentalOnly ? 0.0 : 1.0, now + rampSec);
    deck.instGain.gain.linearRampToValueAtTime(instrumentalOnly ? 1.0 : 0.0, now + rampSec);
  };

  const loadSeekAndPlay = async (
    engine: HTMLAudioElement,
    url: string,
    targetTime: number,
    playbackRate = 1.0
  ): Promise<void> => {
    const needsLoad = engine.src !== url;
    engine.playbackRate = playbackRate;

    if (needsLoad) {
      engine.src = url;
      await new Promise<void>((resolve) => {
        if (engine.readyState >= 2) {
          resolve();
          return;
        }
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          engine.removeEventListener('loadedmetadata', finish);
          engine.removeEventListener('canplay', finish);
          engine.removeEventListener('error', finish);
          resolve();
        };
        engine.addEventListener('loadedmetadata', finish);
        engine.addEventListener('canplay', finish);
        engine.addEventListener('error', finish);
        setTimeout(finish, 1800);
      });
    }

    const safeTarget =
      targetTime > 0 && isFinite(targetTime)
        ? engine.duration && isFinite(engine.duration)
          ? Math.min(Math.max(0, targetTime), Math.max(0, engine.duration - 1.5))
          : targetTime
        : 0;

    if (Math.abs(engine.currentTime - safeTarget) > 0.35) {
      await new Promise<void>((resolve) => {
        let settled = false;
        const doneSeek = () => {
          if (settled) return;
          settled = true;
          engine.removeEventListener('seeked', doneSeek);
          resolve();
        };
        engine.addEventListener('seeked', doneSeek);
        try {
          engine.currentTime = safeTarget;
        } catch {
          doneSeek();
          return;
        }
        setTimeout(doneSeek, 360);
      });
    }

    await engine.play();

    if (safeTarget > 0.5 && Math.abs(engine.currentTime - safeTarget) > 1.5) {
      try {
        engine.currentTime = safeTarget;
      } catch {}
    }
  };

  const analyzingTrackIds = new Set<string>();
  const settledAnalysisIds = new Set<string>();
  const analysisQueue: MusicItem[] = [];
  let isProcessingAnalysisQueue = false;

  const processNextAnalysis = () => {
    if (isProcessingAnalysisQueue) return;
    if (window.bgMusicPlaybackMode !== 'remix') {
      analysisQueue.length = 0;
      return;
    }
    const next = analysisQueue.shift();
    if (!next) return;
    if ((next.analysis && next.analysis.vocalTimeline) || settledAnalysisIds.has(next.id)) {
      setTimeout(processNextAnalysis, 30);
      return;
    }
    isProcessingAnalysisQueue = true;
    analyzingTrackIds.add(next.id);
    analyzeAudioStructure(next.dataUrl)
      .then((result) => {
        next.analysis = result;
        settledAnalysisIds.add(next.id);
        if (result.duration && window.bgMusicDurations) {
          window.bgMusicDurations[next.id] = result.duration;
        }
        window.dispatchEvent(
          new CustomEvent('bg_music_analysis_updated', { detail: { trackId: next.id, analysis: result } })
        );
      })
      .catch(() => {
        settledAnalysisIds.add(next.id);
      })
      .finally(() => {
        analyzingTrackIds.delete(next.id);
        isProcessingAnalysisQueue = false;
        if (analysisQueue.length > 0 && window.bgMusicPlaybackMode === 'remix') {
          setTimeout(processNextAnalysis, 180);
        }
      });
  };

  const ensureTrackAnalyzed = (track: MusicItem | undefined) => {
    if (!track || window.bgMusicPlaybackMode !== 'remix') return;
    if ((track.analysis && track.analysis.vocalTimeline) || analyzingTrackIds.has(track.id) || settledAnalysisIds.has(track.id)) {
      return;
    }
    if (!analysisQueue.some((t) => t.id === track.id)) {
      analysisQueue.push(track);
      processNextAnalysis();
    }
  };

  const completeRemixSessionAndAutoStop = () => {
    const activeEngine = getActiveEngine();
    const activeDeck = getActiveDeck();
    const ctx = window.bgMusicAudioCtx;

    window.bgMusicIsTransitioning = true;

    const finalizeShutdown = () => {
      if (window.bgMusicEngine) {
        window.bgMusicEngine.pause();
        window.bgMusicEngine.currentTime = 0;
      }
      if (window.bgMusicEngineSec) {
        window.bgMusicEngineSec.pause();
        window.bgMusicEngineSec.currentTime = 0;
      }

      const tracks = window.bgMusicTrackList || [];
      if (window.bgMusicPositions) {
        tracks.forEach((tr) => {
          delete window.bgMusicPositions![tr.id];
        });
      }
      window.bgMusicRemixCompletedIds = {};
      window.bgMusicCurrentIndex = 0;
      window.bgMusicSliceStartPos = 0;
      window.bgMusicSlicePlayTime = 0;
      window.bgMusicIsTransitioning = false;
      window.bgMusicIsEnabled = false;
      window.bgMusicAutoPaused = false;
      window.bgMusicPlaybackMode = 'normal';

      localStorage.setItem('bg_music_enabled', 'false');
      localStorage.setItem('bg_music_playback_mode', 'normal');
      persistPositionsAndState();

      if (window.onBgMusicTrackChange) {
        window.onBgMusicTrackChange(0, null);
      }

      window.dispatchEvent(new CustomEvent('bg_music_mode_change', { detail: { mode: 'normal', autoStopped: true } }));
      window.dispatchEvent(new CustomEvent('bg_music_enabled_change', { detail: { enabled: false } }));
      emitRemixProgressEvent(false, false);

      triggerNotification(
        '🎉 Remix সেশন সম্পন্ন হয়েছে',
        'সিলেক্ট করা সবগুলো গানের সম্পূর্ণ অংশ প্লে শেষ হয়েছে, তাই Remix Mode স্বয়ংক্রিয়ভাবে বন্ধ করা হয়েছে।',
        true
      );
    };

    if (ctx && activeDeck && window.bgMusicDeck1 && window.bgMusicDeck2) {
      const now = ctx.currentTime;
      const curve = createEqualPowerCurve(true, 64);
      activeDeck.deckOutGain.gain.cancelScheduledValues(now);
      activeDeck.deckOutGain.gain.setValueCurveAtTime(curve, now, 2.5);
      setTimeout(finalizeShutdown, 2600);
    } else if (activeEngine && !activeEngine.paused) {
      const startVol = activeEngine.volume;
      let step = 0;
      const total = 25;
      const timer = setInterval(() => {
        step++;
        activeEngine.volume = Math.max(0, startVol * (1 - step / total));
        if (step >= total) {
          clearInterval(timer);
          finalizeShutdown();
        }
      }, 100);
    } else {
      finalizeShutdown();
    }
  };

  let activePlayAccumMs = 0;
  let lastMixTickMs = Date.now();

  const resetSliceClock = (startPos = 0) => {
    window.bgMusicSliceStartPos = startPos;
    window.bgMusicSlicePlayTime = 0;
    activePlayAccumMs = 0;
    lastMixTickMs = Date.now();
  };

  window.setBgMusicPlaybackMode = (mode: 'normal' | 'remix') => {
    window.bgMusicPlaybackMode = mode;
    localStorage.setItem('bg_music_playback_mode', mode);
    if (mode === 'remix') {
      const activeEngine = getActiveEngine();
      resetSliceClock(activeEngine ? activeEngine.currentTime : 0);
      (window.bgMusicTrackList || []).forEach((tr) => ensureTrackAnalyzed(tr));
    }
    window.dispatchEvent(new CustomEvent('bg_music_mode_change', { detail: { mode } }));
    emitRemixProgressEvent(false, false);
  };

  window.setBgMusicRemixSelectedIds = (ids: string[] | null) => {
    window.bgMusicRemixSelectedIds = ids;
    saveJsonStorage(REMIX_SELECTED_IDS_KEY, ids);
    emitRemixProgressEvent(false, false);
  };

  window.resetBgMusicRemixSession = () => {
    window.bgMusicPositions = {};
    window.bgMusicRemixCompletedIds = {};
    resetSliceClock(0);
    window.bgMusicCurrentIndex = 0;
    persistPositionsAndState();
    const activeEngine = getActiveEngine();
    if (activeEngine && !activeEngine.paused) {
      try {
        activeEngine.currentTime = 0;
      } catch {}
    }
    emitRemixProgressEvent(false, false);
  };

  window.getBgMusicRemixStatus = (): RemixSessionStatus => {
    const tracks = window.bgMusicTrackList || [];
    const currentIdx = window.bgMusicCurrentIndex || 0;
    const currentTrack = tracks[currentIdx] || null;
    const activeEngine = getActiveEngine();
    const sliceStart = window.bgMusicSliceStartPos || 0;
    const currentTime = activeEngine ? activeEngine.currentTime : 0;
    const completedIds = window.bgMusicRemixCompletedIds || {};
    const remainingCount = tracks.filter((t) => !completedIds[t.id]).length;
    const headElapsed = Math.max(0, currentTime - sliceStart);
    const sliceElapsed = Math.min(MAX_REMIX_SLICE_SECONDS, Math.max(window.bgMusicSlicePlayTime || 0, headElapsed));

    return {
      mode: window.bgMusicPlaybackMode || 'normal',
      isPlaying: Boolean(window.bgMusicIsEnabled && !window.bgMusicAutoPaused && activeEngine && !activeEngine.paused),
      autoPaused: Boolean(window.bgMusicAutoPaused),
      autoPauseReasons: getBgMusicPauseLocks(),
      currentTrackId: currentTrack ? currentTrack.id : null,
      sliceElapsed,
      isInstrumentalReady: false,
      isTransitioning: Boolean(window.bgMusicIsTransitioning),
      isInstrumentalTransitionActive: false,
      positions: { ...(window.bgMusicPositions || {}) },
      durations: { ...(window.bgMusicDurations || {}) },
      completedIds: { ...completedIds },
      remainingCount,
      totalSelectedCount: tracks.length
    };
  };

  const evaluatePlaybackProgress = (engine: HTMLAudioElement) => {
    if (engine !== getActiveEngine() || !window.bgMusicIsEnabled) return;
    if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused) return;

    if (window.bgMusicIsTransitioning) {
      if (!window.bgMusicTransitionStartTime) {
        window.bgMusicTransitionStartTime = Date.now();
      } else if (Date.now() - window.bgMusicTransitionStartTime > (REMIX_CROSSFADE_SECONDS + 4) * 1000) {
        window.bgMusicIsTransitioning = false;
        window.bgMusicTransitionStartTime = undefined;
      }
      return;
    } else {
      window.bgMusicTransitionStartTime = undefined;
    }

    if (!window.bgMusicAudioCtx && window.bgMusicIsEnabled) {
      initWebAudio();
    }

    const duration = engine.duration;
    const currentTime = engine.currentTime;
    const tracks = window.bgMusicTrackList || [];
    const currentIdx = window.bgMusicCurrentIndex || 0;
    const currentTrack = tracks[currentIdx];

    if (currentTrack && duration && isFinite(duration)) {
      if (!window.bgMusicDurations) window.bgMusicDurations = {};
      window.bgMusicDurations[currentTrack.id] = duration;
    }

    if (currentTrack && window.bgMusicPositions && isFinite(currentTime) && currentTime > 0) {
      window.bgMusicPositions[currentTrack.id] = currentTime;
    }

    // Live Web Audio FFT Vocal-Silence Detection
    const analyser = window.bgMusicActiveIndex === 0 ? window.bgMusicAnalyser1 : window.bgMusicAnalyser2;
    let isLiveVocalQuiet = false;
    let hasLiveAnalyserData = false;

    if (analyser) {
      try {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let totalSpectrum = 0;
        for (let i = 0; i < Math.min(64, bufferLength); i++) totalSpectrum += dataArray[i];
        hasLiveAnalyserData = totalSpectrum > 8;

        if (hasLiveAnalyserData) {
          let currentVocalEnergy = 0;
          for (let i = 3; i <= 32; i++) {
            currentVocalEnergy += dataArray[i];
          }
          currentVocalEnergy /= 30;

          if (!window.bgMusicVocalHistory) window.bgMusicVocalHistory = [];
          window.bgMusicVocalHistory.push(currentVocalEnergy);
          if (window.bgMusicVocalHistory.length > 60) window.bgMusicVocalHistory.shift();

          const peakVocal = Math.max(...window.bgMusicVocalHistory, 1.0);
          const avgVocal =
            window.bgMusicVocalHistory.reduce((a, b) => a + b, 0) / window.bgMusicVocalHistory.length;

          const quietNow =
            currentVocalEnergy < 11 ||
            (currentVocalEnergy < avgVocal * 0.56 && currentVocalEnergy < peakVocal * 0.50);

          if (quietNow) {
            window.bgMusicPauseCounter = Math.min(12, (window.bgMusicPauseCounter || 0) + 1);
          } else {
            window.bgMusicPauseCounter = Math.max(0, (window.bgMusicPauseCounter || 0) - 2);
          }

          if ((window.bgMusicPauseCounter || 0) >= 5) {
            isLiveVocalQuiet = true;
          }
        }
      } catch {
        hasLiveAnalyserData = false;
      }
    }

    const preAnalyzedInstAhead = currentTrack
      ? isWindowInstrumental(currentTrack.analysis, currentTime, currentTime + 4.0)
      : false;
    const isVerifiedInstrumental = preAnalyzedInstAhead && (!hasLiveAnalyserData || isLiveVocalQuiet);

    const isRemixMode = window.bgMusicPlaybackMode === 'remix';
    const nowMs = Date.now();
    if (nowMs - lastPersistTs > 5000) {
      lastPersistTs = nowMs;
      persistPositionsAndState();
    }
    if (isRemixMode && nowMs - ((window as any).__lastRemixEmitTs || 0) > 1000) {
      (window as any).__lastRemixEmitTs = nowMs;
      emitRemixProgressEvent(false, isVerifiedInstrumental);
    }

    if (isRemixMode) {
      if (!currentTrack) return;

      const sliceStart = window.bgMusicSliceStartPos || 0;
      const sliceElapsed = Math.max(window.bgMusicSlicePlayTime || 0, Math.max(0, currentTime - sliceStart));
      const completedIds = window.bgMusicRemixCompletedIds || {};
      const remainingOtherTracks = tracks.filter(
        (t, i) => i !== currentIdx && !completedIds[t.id]
      ).length;

      // Case A: Track reached its natural end / final outro -> mark 100% completed!
      if (duration && isFinite(duration) && duration > 6 && currentTime >= duration - REMIX_CROSSFADE_SECONDS) {
        if (!window.bgMusicRemixCompletedIds) window.bgMusicRemixCompletedIds = {};
        window.bgMusicRemixCompletedIds[currentTrack.id] = true;
        if (window.bgMusicPositions) {
          window.bgMusicPositions[currentTrack.id] = 0;
        }
        persistPositionsAndState();

        if (remainingOtherTracks === 0) {
          completeRemixSessionAndAutoStop();
          return;
        }

        if (window.playNextBgTrack) {
          window.playNextBgTrack();
        }
        return;
      }

      // Case B: Multi-track Remix Mode -> STRICT 1:30 (90s) Max Cap + Smart Instrumental Cueing
      if (remainingOtherTracks > 0) {
        const cuePlan = findBestOutgoingInstrumentalCue(currentTrack.analysis, sliceStart, duration, currentTime);
        const maxAllowedBeforeFade = MAX_REMIX_SLICE_SECONDS - cuePlan.crossfadeSec; // <= 85.0s
        const minRequiredPlay = currentTrack.analysis?.isFullInstrumentalTrack
          ? FULL_INST_PHRASE_PLAY_SEC
          : MIN_PLAY_BEFORE_MIX_SEC;

        // 1. Optimal verified pure instrumental transition before 1:30
        if (
          cuePlan.isPureInstrumental &&
          sliceElapsed >= minRequiredPlay &&
          ((currentTime >= cuePlan.cueTime - 0.14 && currentTime <= cuePlan.cueTime + 2.5) || isVerifiedInstrumental)
        ) {
          if (!hasLiveAnalyserData || isLiveVocalQuiet || sliceElapsed >= maxAllowedBeforeFade - 2) {
            if (window.playNextBgTrack) window.playNextBgTrack();
            return;
          }
        }

        // 2. Vocal-heavy song with no long pure instrumental window: hit lowest-vocal beat cue inside [52s..85s]
        //    and playNextBgTrack() will automatically engage Web Audio DSP vocal elimination during crossfade!
        if (!cuePlan.isPureInstrumental && sliceElapsed >= 52 && currentTime >= cuePlan.cueTime - 0.14) {
          if (window.playNextBgTrack) window.playNextBgTrack();
          return;
        }

        // 3. Unbreakable Hard Cap: NEVER let any track exceed 1:30 (90s)
        if (sliceElapsed >= maxAllowedBeforeFade) {
          if (window.playNextBgTrack) window.playNextBgTrack();
          return;
        }
      }
    } else {
      // NORMAL MODE: Strictly untouched full-song sequential playback
      const crossfadeThreshold = 6;
      let shouldTransition = false;

      if (duration && duration > crossfadeThreshold && currentTime >= duration - crossfadeThreshold) {
        shouldTransition = true;
      } else if (duration && currentTime >= duration - 2) {
        shouldTransition = true;
      }

      if (shouldTransition) {
        if (currentTrack && window.bgMusicPositions) {
          window.bgMusicPositions[currentTrack.id] = 0;
        }
        if (window.playNextBgTrack) {
          window.playNextBgTrack();
        }
      }
    }
  };

  const setupEngineListeners = (engine: HTMLAudioElement) => {
    engine.addEventListener('loadedmetadata', () => {
      if (engine !== getActiveEngine()) return;
      const tracks = window.bgMusicTrackList || [];
      const currentTrack = tracks[window.bgMusicCurrentIndex || 0];
      if (currentTrack && engine.duration && isFinite(engine.duration) && window.bgMusicDurations) {
        window.bgMusicDurations[currentTrack.id] = engine.duration;
      }
    });

    engine.addEventListener('ended', () => {
      if (engine !== getActiveEngine()) return;
      if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused) return;
      const tracks = window.bgMusicTrackList || [];
      const currentIdx = window.bgMusicCurrentIndex || 0;
      const currentTrack = tracks[currentIdx];
      const isRemixMode = window.bgMusicPlaybackMode === 'remix';

      if (currentTrack && window.bgMusicPositions) {
        window.bgMusicPositions[currentTrack.id] = 0;
      }
      if (isRemixMode && currentTrack) {
        if (!window.bgMusicRemixCompletedIds) window.bgMusicRemixCompletedIds = {};
        window.bgMusicRemixCompletedIds[currentTrack.id] = true;
        persistPositionsAndState();

        const nextIncomplete = getNextIncompleteTrackIndex(tracks, currentIdx, window.bgMusicRemixCompletedIds);
        if (nextIncomplete === -1) {
          completeRemixSessionAndAutoStop();
          return;
        }
      }

      if (window.playNextBgTrack) {
        window.playNextBgTrack();
      }
    });

    engine.addEventListener('timeupdate', () => {
      evaluatePlaybackProgress(engine);
    });
  };

  if (!(window as any).bgMusicListenersSetup) {
    setupEngineListeners(window.bgMusicEngine);
    setupEngineListeners(window.bgMusicEngineSec);
    // Dedicated 250ms Mix Watchdog (low CPU, active only while playing in Remix Mode)
    setInterval(() => {
      if (!window.bgMusicIsEnabled || window.bgMusicAutoPaused || pauseLockReasons.size > 0 || window.bgMusicIsTransitioning) {
        lastMixTickMs = Date.now();
        return;
      }
      const activeEngine = getActiveEngine();
      if (!activeEngine || activeEngine.paused) {
        lastMixTickMs = Date.now();
        return;
      }
      const now = Date.now();
      const delta = Math.min(600, Math.max(0, now - lastMixTickMs));
      lastMixTickMs = now;
      activePlayAccumMs += delta;
      window.bgMusicSlicePlayTime = activePlayAccumMs / 1000;
      if (window.bgMusicPlaybackMode === 'remix') {
        evaluatePlaybackProgress(activeEngine);
      }
    }, 250);
    (window as any).bgMusicListenersSetup = true;
  }

  // PLAY (respects active pause locks so Growgram/Lecture/TeacherAI never leak music!)
  window.playBgMusic = () => {
    if (pauseLockReasons.size > 0) {
      if (window.bgMusicIsEnabled) {
        window.bgMusicAutoPaused = true;
      }
      return;
    }

    const hadPendingFadePause = Boolean(pendingPauseTimer || pendingPauseInterval);
    clearPendingPauseTimers();

    initWebAudio();
    window.bgMusicPlayedCount = 0;
    const activeEngine = getActiveEngine();
    const activeDeck = getActiveDeck();
    const tracks = window.bgMusicTrackList || [];
    if (!activeEngine || !window.bgMusicIsEnabled || tracks.length === 0) return;

    const isRemixMode = window.bgMusicPlaybackMode === 'remix';

    let currentIdx = Math.min(window.bgMusicCurrentIndex || 0, tracks.length - 1);
    if (isRemixMode && window.bgMusicRemixCompletedIds && window.bgMusicRemixCompletedIds[tracks[currentIdx]?.id]) {
      const nextInc = getNextIncompleteTrackIndex(tracks, currentIdx, window.bgMusicRemixCompletedIds);
      if (nextInc !== -1) {
        currentIdx = nextInc;
        window.bgMusicCurrentIndex = currentIdx;
      } else {
        window.bgMusicRemixCompletedIds = {};
        persistPositionsAndState();
      }
    }

    const currentTrack = tracks[currentIdx];
    if (!currentTrack) return;

    ensureTrackAnalyzed(currentTrack);
    if (isRemixMode) {
      tracks.forEach((tr) => ensureTrackAnalyzed(tr));
    }

    const savedPos = (window.bgMusicPositions && window.bgMusicPositions[currentTrack.id]) || 0;
    const isSameTrack = activeEngine.src === currentTrack.dataUrl;
    const ctx = window.bgMusicAudioCtx;
    const isAttenuatedByFade = Boolean(
      hadPendingFadePause ||
        (ctx && activeDeck && activeDeck.deckOutGain.gain.value < 0.85) ||
        (!ctx && activeEngine.volume < TARGET_MASTER_GAIN * 0.85)
    );

    if (activeEngine.paused || !isSameTrack || isAttenuatedByFade) {
      const entryPos =
        savedPos > 0
          ? savedPos
          : isRemixMode && currentTrack.analysis
          ? findBestInstrumentalEntry(currentTrack.analysis)
          : 0;

      if (savedPos <= 0 || !isSameTrack) {
        resetSliceClock(entryPos);
      } else {
        window.bgMusicSliceStartPos = entryPos;
        lastMixTickMs = Date.now();
      }

      if (ctx && activeDeck) {
        setDeckInstrumentalMode(activeDeck, false, Boolean(currentTrack.analysis?.isMono), 0.05);
        activeDeck.deckOutGain.gain.cancelScheduledValues(ctx.currentTime);
        activeDeck.deckOutGain.gain.setValueAtTime(0.01, ctx.currentTime);
      } else {
        activeEngine.volume = 0.01;
      }

      loadSeekAndPlay(activeEngine, currentTrack.dataUrl, entryPos, 1.0)
        .then(() => {
          if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused || !window.bgMusicIsEnabled) {
            activeEngine.pause();
            return;
          }
          window.bgMusicSliceStartPos = activeEngine.currentTime;
          lastMixTickMs = Date.now();
          if (ctx && activeDeck) {
            const now = ctx.currentTime;
            activeDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(false, 32), now, 1.0);
          } else {
            let vol = 0.01;
            const iv = setInterval(() => {
              const cur = getActiveEngine();
              if (!cur || !window.bgMusicIsEnabled || pauseLockReasons.size > 0) {
                clearInterval(iv);
                return;
              }
              vol = Math.min(TARGET_MASTER_GAIN, vol + 0.02);
              cur.volume = vol;
              if (vol >= TARGET_MASTER_GAIN) clearInterval(iv);
            }, 100);
          }
          emitRemixProgressEvent(false, false);
        })
        .catch((err) => {
          console.warn('Background music play failed:', err);
        });
    }

    if (window.onBgMusicTrackChange) {
      window.onBgMusicTrackChange(currentIdx, currentTrack.id);
    }
  };

  // PAUSE (saves exact playback position)
  window.pauseBgMusic = (fade = true) => {
    clearPendingPauseTimers();

    const activeEngine = getActiveEngine();
    const standbyEngine = getStandbyEngine();
    const activeDeck = getActiveDeck();
    if (!activeEngine) return;

    // Immediately silence any standby deck if interrupted mid-crossfade
    if (standbyEngine && !standbyEngine.paused) {
      standbyEngine.pause();
    }
    window.bgMusicIsTransitioning = false;

    const tracks = window.bgMusicTrackList || [];
    const currentTrack = tracks[window.bgMusicCurrentIndex || 0];
    if (
      currentTrack &&
      window.bgMusicPositions &&
      activeEngine.readyState >= 1 &&
      isFinite(activeEngine.currentTime) &&
      activeEngine.currentTime > 0.2
    ) {
      const curr = activeEngine.currentTime;
      const dur = activeEngine.duration || 0;
      if (dur > 0 && curr >= dur - 2) {
        window.bgMusicPositions[currentTrack.id] = 0;
      } else {
        window.bgMusicPositions[currentTrack.id] = curr;
      }
      persistPositionsAndState();
    }

    const ctx = window.bgMusicAudioCtx;
    if (fade && !activeEngine.paused) {
      if (ctx && activeDeck) {
        const now = ctx.currentTime;
        activeDeck.deckOutGain.gain.cancelScheduledValues(now);
        activeDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(true, 24), now, 0.75);
        pendingPauseTimer = setTimeout(() => {
          pendingPauseTimer = null;
          if (pauseLockReasons.size === 0 && window.bgMusicIsEnabled && !window.bgMusicAutoPaused) {
            return;
          }
          activeEngine.pause();
          if (window.onBgMusicTrackChange) {
            window.onBgMusicTrackChange(window.bgMusicCurrentIndex || 0, null);
          }
          emitRemixProgressEvent(false, false);
        }, 780);
      } else {
        let fadeOutVol = activeEngine.volume;
        pendingPauseInterval = setInterval(() => {
          const currentActive = getActiveEngine();
          if (!currentActive || (pauseLockReasons.size === 0 && window.bgMusicIsEnabled && !window.bgMusicAutoPaused)) {
            clearPendingPauseTimers();
            return;
          }
          if (fadeOutVol > 0.01) {
            fadeOutVol = Math.max(0.01, fadeOutVol - 0.02);
            currentActive.volume = fadeOutVol;
          } else {
            clearPendingPauseTimers();
            currentActive.pause();
            if (window.onBgMusicTrackChange) {
              window.onBgMusicTrackChange(window.bgMusicCurrentIndex || 0, null);
            }
            emitRemixProgressEvent(false, false);
          }
        }, 80);
      }
    } else {
      activeEngine.pause();
      if (window.onBgMusicTrackChange) {
        window.onBgMusicTrackChange(window.bgMusicCurrentIndex || 0, null);
      }
      emitRemixProgressEvent(false, false);
    }
  };

  // TRANSITION TO NEXT TRACK (Beat-Matched + Verified Instrumental-Only Crossfade)
  window.playNextBgTrack = () => {
    if (window.bgMusicIsTransitioning) {
      if (
        window.bgMusicTransitionStartTime &&
        Date.now() - window.bgMusicTransitionStartTime > (REMIX_CROSSFADE_SECONDS + 4) * 1000
      ) {
        window.bgMusicIsTransitioning = false;
        window.bgMusicTransitionStartTime = undefined;
      } else {
        return;
      }
    }
    if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused) return;
    clearPendingPauseTimers();

    const activeEngine = getActiveEngine();
    const standbyEngine = getStandbyEngine();
    const activeDeck = getActiveDeck();
    const standbyDeck = getStandbyDeck();
    const tracks = window.bgMusicTrackList || [];
    if (!activeEngine || !standbyEngine || !window.bgMusicIsEnabled || tracks.length === 0) return;

    if (window.bgMusicPlayedCount === undefined) window.bgMusicPlayedCount = 0;
    window.bgMusicPlayedCount++;

    const isRemixMode = window.bgMusicPlaybackMode === 'remix';

    // Normal Mode preserves the 3-loop limit
    if (!isRemixMode) {
      const totalLoopsRequired = tracks.length * 3;
      if (window.bgMusicPlayedCount >= totalLoopsRequired) {
        window.bgMusicIsTransitioning = false;
        window.bgMusicTransitionStartTime = undefined;
        if (window.pauseBgMusic) window.pauseBgMusic(true);
        triggerNotification(
          '🎉 লুপ সম্পন্ন হয়েছে',
          'আপনার ৩টি প্লেলিস্ট লুপ সফলভাবে সম্পন্ন হয়েছে, চ্যাম্পিয়ন! 🔥',
          true
        );
        return;
      }
    }

    const currentIdx = window.bgMusicCurrentIndex || 0;
    const currentTrack = tracks[currentIdx];

    // Save outgoing track's exact playback position (or mark completed if at end)
    if (currentTrack && window.bgMusicPositions && activeEngine) {
      const dur = activeEngine.duration;
      const isAtEnd = dur && isFinite(dur) && activeEngine.currentTime >= dur - (isRemixMode ? 5.5 : 8);
      if (isAtEnd) {
        window.bgMusicPositions[currentTrack.id] = 0;
        if (isRemixMode) {
          if (!window.bgMusicRemixCompletedIds) window.bgMusicRemixCompletedIds = {};
          window.bgMusicRemixCompletedIds[currentTrack.id] = true;
        }
      } else if (activeEngine.currentTime > 0.2) {
        window.bgMusicPositions[currentTrack.id] = activeEngine.currentTime;
      }
      persistPositionsAndState();
    }

    let nextIdx = (currentIdx + 1) % tracks.length;
    if (isRemixMode) {
      const completedIds = window.bgMusicRemixCompletedIds || {};
      const nextIncomplete = getNextIncompleteTrackIndex(tracks, currentIdx, completedIds);
      if (nextIncomplete === -1) {
        completeRemixSessionAndAutoStop();
        return;
      }
      nextIdx = nextIncomplete;
    }

    const nextTrack = tracks[nextIdx];
    if (!nextTrack) return;

    window.bgMusicIsTransitioning = true;
    window.bgMusicTransitionStartTime = Date.now();
    window.bgMusicCurrentIndex = nextIdx;

    const proceedWithTransition = () => {
      let entryPos = (window.bgMusicPositions && window.bgMusicPositions[nextTrack.id]) || 0;

      if (isRemixMode) {
        if (entryPos <= 0) {
          // First entry: do NOT start blindly from 0:00 — start from the best verified Instrumental section!
          entryPos = findBestInstrumentalEntry(nextTrack.analysis);
        } else {
          // Resuming from remembered position: align to beat grid cleanly without losing position
          entryPos = alignPositionToBeatGrid(entryPos, nextTrack.analysis, 0.35);
        }
      }

      const targetPlaybackRate = isRemixMode
        ? computeBeatMatchRatio(currentTrack?.analysis?.bpm, nextTrack.analysis?.bpm)
        : 1.0;

      resetSliceClock(entryPos);

      const crossfadeSec = isRemixMode ? REMIX_CROSSFADE_SECONDS : NORMAL_CROSSFADE_SECONDS;
      const ctx = window.bgMusicAudioCtx;
      const useWebAudio =
        Boolean(ctx && activeDeck && standbyDeck) &&
        canUseWebAudioForUrl(currentTrack?.dataUrl || '') &&
        canUseWebAudioForUrl(nextTrack.dataUrl);

      if (useWebAudio && ctx && activeDeck && standbyDeck) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        if (isRemixMode) {
          const outAlreadyInst = currentTrack
            ? isWindowInstrumental(currentTrack.analysis, activeEngine.currentTime, activeEngine.currentTime + crossfadeSec)
            : false;
          const inAlreadyInst = isWindowInstrumental(
            nextTrack.analysis,
            entryPos,
            entryPos + crossfadeSec
          );

          // Ensure ZERO vocals/lyrics bleed during crossfade via DSP instrumental isolation whenever needed
          setDeckInstrumentalMode(activeDeck, !outAlreadyInst, Boolean(currentTrack?.analysis?.isMono), 0.25);
          setDeckInstrumentalMode(standbyDeck, !inAlreadyInst, Boolean(nextTrack.analysis?.isMono), 0.02);
        } else {
          setDeckInstrumentalMode(activeDeck, false, false, 0.1);
          setDeckInstrumentalMode(standbyDeck, false, false, 0.1);
        }

        standbyDeck.deckOutGain.gain.cancelScheduledValues(ctx.currentTime);
        standbyDeck.deckOutGain.gain.setValueAtTime(0.0001, ctx.currentTime);

        emitRemixProgressEvent(isRemixMode, true);

        loadSeekAndPlay(standbyEngine, nextTrack.dataUrl, entryPos, targetPlaybackRate)
          .then(() => {
            if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused || !window.bgMusicIsEnabled) {
              activeEngine.pause();
              standbyEngine.pause();
              window.bgMusicIsTransitioning = false;
              window.bgMusicTransitionStartTime = undefined;
              return;
            }

            resetSliceClock(standbyEngine.currentTime);
            const now = ctx.currentTime;

            activeDeck.deckOutGain.gain.cancelScheduledValues(now);
            standbyDeck.deckOutGain.gain.cancelScheduledValues(now);
            activeDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(true, 64), now, crossfadeSec);
            standbyDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(false, 64), now, crossfadeSec);

            setTimeout(() => {
              activeEngine.pause();
              setDeckInstrumentalMode(activeDeck, false, Boolean(currentTrack?.analysis?.isMono), 0.05);

              if (isRemixMode) {
                setDeckInstrumentalMode(standbyDeck, false, Boolean(nextTrack.analysis?.isMono), 0.9);
              }

              swapActiveEngine();
              window.bgMusicIsTransitioning = false;
              window.bgMusicTransitionStartTime = undefined;
              lastMixTickMs = Date.now();

              if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused || !window.bgMusicIsEnabled) {
                standbyEngine.pause();
                return;
              }

              if (Math.abs(targetPlaybackRate - 1.0) > 0.005) {
                let step = 0;
                const steps = 35;
                const startRate = targetPlaybackRate;
                const glideTimer = setInterval(() => {
                  step++;
                  const cur = getActiveEngine();
                  if (!cur || step >= steps) {
                    if (cur) cur.playbackRate = 1.0;
                    clearInterval(glideTimer);
                  } else {
                    cur.playbackRate = startRate + (1.0 - startRate) * (step / steps);
                  }
                }, 100);
              } else {
                const cur = getActiveEngine();
                if (cur) cur.playbackRate = 1.0;
              }

              if (window.onBgMusicTrackChange) {
                window.onBgMusicTrackChange(nextIdx, nextTrack.id);
              }
              emitRemixProgressEvent(false, false);
            }, crossfadeSec * 1000 + 80);
          })
          .catch(() => {
            activeEngine.pause();
            swapActiveEngine();
            const fallback = getActiveEngine();
            loadSeekAndPlay(fallback, nextTrack.dataUrl, entryPos, 1.0)
              .then(() => {
                resetSliceClock(fallback.currentTime);
                if (standbyDeck) {
                  setDeckInstrumentalMode(standbyDeck, false, false, 0.1);
                  standbyDeck.deckOutGain.gain.setValueAtTime(1.0, ctx.currentTime);
                }
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
                if (window.onBgMusicTrackChange) {
                  window.onBgMusicTrackChange(nextIdx, nextTrack.id);
                }
                emitRemixProgressEvent(false, false);
              })
              .catch(() => {
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
              });
          });
      } else {
        standbyEngine.volume = 0.001;
        loadSeekAndPlay(standbyEngine, nextTrack.dataUrl, entryPos, targetPlaybackRate)
          .then(() => {
            if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused || !window.bgMusicIsEnabled) {
              activeEngine.pause();
              standbyEngine.pause();
              window.bgMusicIsTransitioning = false;
              window.bgMusicTransitionStartTime = undefined;
              return;
            }
            resetSliceClock(standbyEngine.currentTime);
            const steps = Math.round(crossfadeSec * 10);
            let step = 0;
            const startActiveVol = activeEngine.volume;

            const iv = setInterval(() => {
              step++;
              if (pauseLockReasons.size > 0 || window.bgMusicAutoPaused || !window.bgMusicIsEnabled) {
                clearInterval(iv);
                activeEngine.pause();
                standbyEngine.pause();
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
                return;
              }
              if (step >= steps) {
                clearInterval(iv);
                activeEngine.pause();
                activeEngine.volume = 0;
                standbyEngine.volume = TARGET_MASTER_GAIN;
                swapActiveEngine();
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
                lastMixTickMs = Date.now();
                if (standbyEngine.playbackRate !== 1.0) standbyEngine.playbackRate = 1.0;
                if (window.onBgMusicTrackChange) {
                  window.onBgMusicTrackChange(nextIdx, nextTrack.id);
                }
                emitRemixProgressEvent(false, false);
              } else {
                const ratio = step / steps;
                activeEngine.volume = Math.max(0, startActiveVol * Math.cos((ratio * Math.PI) / 2));
                standbyEngine.volume = Math.min(TARGET_MASTER_GAIN, TARGET_MASTER_GAIN * Math.sin((ratio * Math.PI) / 2));
              }
            }, 100);
          })
          .catch(() => {
            activeEngine.pause();
            swapActiveEngine();
            const fallback = getActiveEngine();
            fallback.volume = TARGET_MASTER_GAIN;
            loadSeekAndPlay(fallback, nextTrack.dataUrl, entryPos, 1.0)
              .then(() => {
                resetSliceClock(fallback.currentTime);
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
                if (window.onBgMusicTrackChange) {
                  window.onBgMusicTrackChange(nextIdx, nextTrack.id);
                }
              })
              .catch(() => {
                window.bgMusicIsTransitioning = false;
                window.bgMusicTransitionStartTime = undefined;
              });
          });
      }
    };

    // Analyze nextTrack if needed, but skip already-settled tracks and cap wait at 1500ms
    if (
      isRemixMode &&
      (!nextTrack.analysis || !nextTrack.analysis.vocalTimeline) &&
      !settledAnalysisIds.has(nextTrack.id)
    ) {
      Promise.race([
        analyzeAudioStructure(nextTrack.dataUrl).then((res) => {
          settledAnalysisIds.add(nextTrack.id);
          nextTrack.analysis = res;
          if (res.duration && window.bgMusicDurations) {
            window.bgMusicDurations[nextTrack.id] = res.duration;
          }
          window.dispatchEvent(
            new CustomEvent('bg_music_analysis_updated', { detail: { trackId: nextTrack.id, analysis: res } })
          );
        }),
        new Promise<void>((resolve) => setTimeout(resolve, 1500))
      ])
        .then(() => proceedWithTransition())
        .catch(() => proceedWithTransition());
    } else {
      proceedWithTransition();
    }
  };

  window.selectBgMusic = (index: number) => {
    if (window.bgMusicIsTransitioning) return;
    if (pauseLockReasons.size > 0) return;
    clearPendingPauseTimers();
    resetSliceClock(0);

    initWebAudio();
    window.bgMusicPlayedCount = 0;

    const activeEngine = getActiveEngine();
    const standbyEngine = getStandbyEngine();
    const activeDeck = getActiveDeck();
    const standbyDeck = getStandbyDeck();
    const tracks = window.bgMusicTrackList || [];
    if (!activeEngine || !standbyEngine || tracks.length === 0) return;

    const safeIndex = Math.max(0, Math.min(index, tracks.length - 1));
    const currentIdx = window.bgMusicCurrentIndex || 0;
    if (safeIndex === currentIdx && !activeEngine.paused) return;

    window.bgMusicIsTransitioning = true;
    window.bgMusicTransitionStartTime = Date.now();

    const currentTrack = tracks[currentIdx];
    if (currentTrack && window.bgMusicPositions && !activeEngine.paused) {
      const curr = activeEngine.currentTime;
      const dur = activeEngine.duration || 0;
      window.bgMusicPositions[currentTrack.id] = dur > 0 && curr >= dur - 2 ? 0 : curr;
      persistPositionsAndState();
    }

    window.bgMusicCurrentIndex = safeIndex;
    const targetTrack = tracks[safeIndex];
    if (!targetTrack) {
      window.bgMusicIsTransitioning = false;
      window.bgMusicTransitionStartTime = undefined;
      return;
    }

    ensureTrackAnalyzed(targetTrack);

    if (window.bgMusicRemixCompletedIds && window.bgMusicRemixCompletedIds[targetTrack.id]) {
      delete window.bgMusicRemixCompletedIds[targetTrack.id];
      persistPositionsAndState();
    }

    const savedPos = (window.bgMusicPositions && window.bgMusicPositions[targetTrack.id]) || 0;
    const entryPos =
      savedPos > 0
        ? savedPos
        : window.bgMusicPlaybackMode === 'remix' && targetTrack.analysis
        ? findBestInstrumentalEntry(targetTrack.analysis)
        : 0;
    resetSliceClock(entryPos);

    const ctx = window.bgMusicAudioCtx;
    const useWebAudio =
      Boolean(ctx && activeDeck && standbyDeck) &&
      canUseWebAudioForUrl(targetTrack.dataUrl);

    if (useWebAudio && ctx && activeDeck && standbyDeck) {
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      setDeckInstrumentalMode(activeDeck, false, Boolean(currentTrack?.analysis?.isMono), 0.3);
      setDeckInstrumentalMode(standbyDeck, false, Boolean(targetTrack.analysis?.isMono), 0.05);
      standbyDeck.deckOutGain.gain.cancelScheduledValues(ctx.currentTime);
      standbyDeck.deckOutGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      loadSeekAndPlay(standbyEngine, targetTrack.dataUrl, entryPos, 1.0)
        .then(() => {
          resetSliceClock(standbyEngine.currentTime);
          const now = ctx.currentTime;
          const fadeSec = 2.2;
          if (!activeEngine.paused) {
            activeDeck.deckOutGain.gain.cancelScheduledValues(now);
            activeDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(true, 48), now, fadeSec);
          }
          standbyDeck.deckOutGain.gain.cancelScheduledValues(now);
          standbyDeck.deckOutGain.gain.setValueCurveAtTime(createEqualPowerCurve(false, 48), now, fadeSec);

          setTimeout(() => {
            activeEngine.pause();
            setDeckInstrumentalMode(activeDeck, false, false, 0.05);
            swapActiveEngine();
            window.bgMusicIsTransitioning = false;
            window.bgMusicTransitionStartTime = undefined;
            lastMixTickMs = Date.now();
            if (window.onBgMusicTrackChange) {
              window.onBgMusicTrackChange(safeIndex, targetTrack.id);
            }
            emitRemixProgressEvent(false, false);
          }, fadeSec * 1000 + 60);
        })
        .catch(() => {
          window.bgMusicIsTransitioning = false;
          window.bgMusicTransitionStartTime = undefined;
        });
    } else {
      standbyEngine.volume = 0.001;
      loadSeekAndPlay(standbyEngine, targetTrack.dataUrl, entryPos, 1.0)
        .then(() => {
          resetSliceClock(standbyEngine.currentTime);
          const steps = 20;
          let step = 0;
          const startActiveVol = activeEngine.volume;
          const iv = setInterval(() => {
            step++;
            if (step >= steps) {
              clearInterval(iv);
              activeEngine.pause();
              activeEngine.volume = 0;
              standbyEngine.volume = TARGET_MASTER_GAIN;
              swapActiveEngine();
              window.bgMusicIsTransitioning = false;
              window.bgMusicTransitionStartTime = undefined;
              lastMixTickMs = Date.now();
              if (window.onBgMusicTrackChange) {
                window.onBgMusicTrackChange(safeIndex, targetTrack.id);
              }
              emitRemixProgressEvent(false, false);
            } else {
              const ratio = step / steps;
              if (!activeEngine.paused) {
                activeEngine.volume = Math.max(0, startActiveVol * Math.cos((ratio * Math.PI) / 2));
              }
              standbyEngine.volume = Math.min(TARGET_MASTER_GAIN, TARGET_MASTER_GAIN * Math.sin((ratio * Math.PI) / 2));
            }
          }, 100);
        })
        .catch(() => {
          window.bgMusicIsTransitioning = false;
        });
    }
  };

  window.selectBgMusicById = (trackId: string) => {
    const tracks = window.bgMusicTrackList || [];
    const idx = tracks.findIndex((t) => t.id === trackId);
    if (idx !== -1 && window.selectBgMusic) {
      window.selectBgMusic(idx);
    }
  };

  window.playClimaxMashup = () => {
    if (pauseLockReasons.size > 0) return;
    const tracks = window.bgMusicTrackList || [];
    if (tracks.length === 0) return;

    if (window.bgMusicEngine) window.bgMusicEngine.pause();
    if (window.bgMusicEngineSec) window.bgMusicEngineSec.pause();

    const climaxAudios: HTMLAudioElement[] = [];
    tracks.slice(0, 3).forEach((track, i) => {
      const aud = new Audio(track.dataUrl);
      aud.currentTime = 10 + i * 15;
      aud.volume = 0.001;
      climaxAudios.push(aud);
    });

    triggerNotification('🔥 TURBO REMIX CLIMAX', 'সবগুলো গান একসাথে রিমিক্স স্টাইলে বাজছে!', true);

    if (window.onBgMusicTrackChange) {
      window.onBgMusicTrackChange(0, 'climax-mashup-id');
    }

    climaxAudios.forEach((aud) => {
      aud.play().catch(() => {});
    });

    let currentStep = 0;
    const steps = 30;
    const fadeInterval = setInterval(() => {
      currentStep++;
      climaxAudios.forEach((aud) => {
        aud.volume = Math.min(0.08, (currentStep / steps) * 0.08);
      });
      if (currentStep >= steps) clearInterval(fadeInterval);
    }, 100);

    setTimeout(() => {
      let fadeOutStep = 0;
      const fadeOutSteps = 50;
      const fadeOutInterval = setInterval(() => {
        fadeOutStep++;
        climaxAudios.forEach((aud) => {
          aud.volume = Math.max(0, 0.08 * (1 - fadeOutStep / fadeOutSteps));
        });
        if (fadeOutStep >= fadeOutSteps) {
          clearInterval(fadeOutInterval);
          climaxAudios.forEach((aud) => aud.pause());
          if (window.onBgMusicTrackChange) {
            window.onBgMusicTrackChange(0, null);
          }
          window.bgMusicPlayedCount = 0;
          window.bgMusicIsTransitioning = false;
        }
      }, 100);
    }, 22000);
  };
}
