import { Router } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { execFile, execSync } from 'child_process';

const router = Router();

export const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

const MEDIA_DIR = path.join(process.cwd(), "public", "media");
if (!fs.existsSync(MEDIA_DIR)) {
  try {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  } catch (e) {}
}

export function extractUrl(text: string): string {
  if (!text) return '';
  if (text.includes('/api/share/stream?u=')) {
    try {
      const uParam = text.split('/api/share/stream?u=')[1];
      const decoded = decodeURIComponent(uParam.split('&')[0]);
      if (decoded.startsWith('http')) return decoded;
    } catch {}
  }
  const m = (text || '').match(/https?:\/\/[^\s"'<>]+/);
  return m ? m[0] : '';
}

export function getAppropriateReferer(urlStr: string): string | undefined {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    if (host.includes('tikwm.com')) {
      return 'https://www.tikwm.com/';
    }
    if (host.includes('tiktok.com') || host.includes('tiktokv.com') || host.includes('ibytedtos.com')) {
      return 'https://www.tiktok.com/';
    }
    if (host.includes('instagram.com') || host.includes('cdninstagram.com') || host.includes('fbcdn.net')) {
      return 'https://www.instagram.com/';
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export async function downloadMediaBufferWithFallbacks(
  mediaUrl: string, 
  outPath?: string,
  originalPageUrl?: string
): Promise<Buffer | null> {
  if (!mediaUrl && !originalPageUrl) return null;

  const ytdlpPath = path.join(process.cwd(), "bin", "yt-dlp");
  const candUrl = (originalPageUrl || mediaUrl || '').trim();

  // Strategy 1: Direct native yt-dlp on original social link or direct media URL
  if (outPath && fs.existsSync(ytdlpPath) && candUrl.startsWith('http')) {
    try {
      await new Promise<void>((resolve) => {
        execFile(ytdlpPath, [
          "--no-warnings",
          "--no-check-certificates",
          "--socket-timeout", "25",
          "-f", "b[ext=mp4]/best[ext=mp4]/best",
          "-o", outPath,
          candUrl
        ], { timeout: 32000 }, () => resolve());
      });
      if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
        const buf = fs.readFileSync(outPath);
        if (isValidVideoBuffer(buf)) {
          try {
            if (outPath.endsWith('.mp4')) {
              const posterPath = outPath.replace(/\.mp4$/, '.jpg');
              execSync(`ffmpeg -ss 00:00:01.000 -i "${outPath}" -vframes 1 -q:v 2 "${posterPath}" -y 2>/dev/null`, { timeout: 5000 });
            }
            const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
            if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
            fs.copyFileSync(outPath, path.join(vaultDir, path.basename(outPath)));
          } catch (pe) {}
          return buf;
        } else {
          try { fs.unlinkSync(outPath); } catch (ue) {}
        }
      }
    } catch (e) {}
  }

  const directUrl = (mediaUrl || '').trim();
  if (directUrl && directUrl.startsWith('http')) {
    const referer = getAppropriateReferer(directUrl) || (directUrl.includes('tikwm') ? 'https://www.tikwm.com/' : 'https://www.tiktok.com/');

    // Strategy 2: Fast curl command (handles chunked streams and HTTP/2 CDNs reliably)
    if (outPath) {
      try {
        execSync(
          `curl -s -L -A "${UA}" -e "${referer}" --max-time 28 "${directUrl}" -o "${outPath}" 2>/dev/null`,
          { timeout: 30000 }
        );
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 15000) {
          const buf = fs.readFileSync(outPath);
          const insp = inspectMediaBuffer(buf);
          if (insp.isValid && insp.isVideo) {
            try {
              if (outPath.endsWith('.mp4')) {
                const posterPath = outPath.replace(/\.mp4$/, '.jpg');
                execSync(`ffmpeg -ss 00:00:01.000 -i "${outPath}" -vframes 1 -q:v 2 "${posterPath}" -y 2>/dev/null`, { timeout: 5000 });
              }
              const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
              if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
              fs.copyFileSync(outPath, path.join(vaultDir, path.basename(outPath)));
            } catch (pe) {}
            return buf;
          } else {
            try { fs.unlinkSync(outPath); } catch (ue) {}
          }
        }
      } catch (ce) {}
    }

    // Strategy 3: Node-fetch with domain-matched referer
    try {
      const headers: Record<string, string> = {
        'User-Agent': UA,
        'Accept': '*/*',
        'Referer': referer
      };
      const res = await fetch(directUrl, { headers, signal: AbortSignal.timeout(28000) });
      if (res.ok || res.status === 206) {
        const buf = Buffer.from(await res.arrayBuffer());
        const insp = inspectMediaBuffer(buf);
        if (insp.isValid && insp.isVideo) {
          if (outPath) {
            fs.writeFileSync(outPath, buf);
            try {
              if (outPath.endsWith('.mp4')) {
                const posterPath = outPath.replace(/\.mp4$/, '.jpg');
                execSync(`ffmpeg -ss 00:00:01.000 -i "${outPath}" -vframes 1 -q:v 2 "${posterPath}" -y 2>/dev/null`, { timeout: 5000 });
              }
              const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
              if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
              fs.copyFileSync(outPath, path.join(vaultDir, path.basename(outPath)));
            } catch (pe) {}
          }
          return buf;
        }
      }
    } catch (e) {}

    // Strategy 4: Mobile User-Agent
    try {
      const res = await fetch(directUrl, {
        headers: {
          'User-Agent': MOBILE_UA,
          'Accept': '*/*'
        },
        signal: AbortSignal.timeout(28000)
      });
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        const insp = inspectMediaBuffer(buf);
        if (insp.isValid && insp.isVideo) {
          if (outPath) {
            fs.writeFileSync(outPath, buf);
            try {
              if (outPath.endsWith('.mp4')) {
                const posterPath = outPath.replace(/\.mp4$/, '.jpg');
                execSync(`ffmpeg -ss 00:00:01.000 -i "${outPath}" -vframes 1 -q:v 2 "${posterPath}" -y 2>/dev/null`, { timeout: 5000 });
              }
              const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
              if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
              fs.copyFileSync(outPath, path.join(vaultDir, path.basename(outPath)));
            } catch (pe) {}
          }
          return buf;
        }
      }
    } catch (e) {}
  }

  // Strictly return null on failure — NEVER substitute a demo video!
  return null;
}

export function absolute(u: string, base: string): string {
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  if (u.startsWith('/')) return base + u;
  return u;
}

export interface MediaBufferInspection {
  isValid: boolean;
  isVideo: boolean;
  isImage: boolean;
  ext: 'mp4' | 'webm' | 'jpg' | 'png' | 'unknown';
  mime: string;
}

/**
 * Strict Media Inspector:
 * Accurately detects genuine MP4, WebM, or JPEG/PNG binaries.
 * Prevents HTML error pages and JPEG images from ever being treated as MP4 video files (which causes black screens).
 */
export function inspectMediaBuffer(buf: Buffer): MediaBufferInspection {
  if (!buf || buf.length < 500) {
    return { isValid: false, isVideo: false, isImage: false, ext: 'unknown', mime: '' };
  }

  // Check for text/HTML error responses
  const headerStr = buf.subarray(0, 300).toString('utf-8').toLowerCase();
  if (
    headerStr.includes('<!doctype') ||
    headerStr.includes('<html') ||
    headerStr.includes('<head') ||
    headerStr.includes('{"error') ||
    headerStr.includes('/*js-response*/') ||
    headerStr.includes('access denied') ||
    headerStr.includes('bad request') ||
    headerStr.includes('not found')
  ) {
    return { isValid: false, isVideo: false, isImage: false, ext: 'unknown', mime: '' };
  }

  // 1. Check JPEG magic bytes: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { isValid: true, isVideo: false, isImage: true, ext: 'jpg', mime: 'image/jpeg' };
  }

  // 2. Check PNG magic bytes: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { isValid: true, isVideo: false, isImage: true, ext: 'png', mime: 'image/png' };
  }

  // 3. Check MP4 / QuickTime markers (ftyp, moov, mdat, isom, mp42, qt)
  const isMp4 =
    buf.includes(Buffer.from('ftyp', 'utf-8')) ||
    buf.includes(Buffer.from('moov', 'utf-8')) ||
    buf.includes(Buffer.from('mdat', 'utf-8')) ||
    buf.includes(Buffer.from('isom', 'utf-8')) ||
    buf.includes(Buffer.from('mp42', 'utf-8'));

  if (isMp4 && buf.length > 15000) {
    return { isValid: true, isVideo: true, isImage: false, ext: 'mp4', mime: 'video/mp4' };
  }

  // 4. Check WebM/MKV magic bytes: 1A 45 DF A3
  if (buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) && buf.length > 15000) {
    return { isValid: true, isVideo: true, isImage: false, ext: 'webm', mime: 'video/webm' };
  }

  // Fallback: If larger than 50KB and has no text header, treat as MP4
  if (buf.length > 50000 && !headerStr.includes('<') && !headerStr.includes('{')) {
    return { isValid: true, isVideo: true, isImage: false, ext: 'mp4', mime: 'video/mp4' };
  }

  return { isValid: false, isVideo: false, isImage: false, ext: 'unknown', mime: '' };
}

export function isValidVideoBuffer(buf: Buffer): boolean {
  const info = inspectMediaBuffer(buf);
  return info.isValid && info.isVideo;
}

/**
 * Universal Downloader Website HTML Parser:
 * Extracts MP4 video URLs, captions, and thumbnails from HTML of any downloader website
 * (SaveFrom, SnapSave, FastDL, SnapInsta, InDown, IGram, SaveIG, SSSInstagram, etc.)
 */
export function parseDownloaderHtml(rawHtml: string): {
  targetUrl: string;
  videoUrls: string[];
  caption: string;
  thumbnail: string;
} {
  const result = {
    targetUrl: '',
    videoUrls: [] as string[],
    caption: '',
    thumbnail: ''
  };

  if (!rawHtml || typeof rawHtml !== 'string') return result;

  // 1. Extract target Instagram / TikTok link if present in form or input
  const urlMatch =
    rawHtml.match(/name=["'](?:sf_url|url|link|q)["'][^>]*value=["'](https?:\/\/[^"']+)["']/i) ||
    rawHtml.match(/value=["'](https?:\/\/(?:www\.)?(?:instagram\.com|tiktok\.com)\/[^"']+)["']/i);
  if (urlMatch && urlMatch[1]) {
    result.targetUrl = urlMatch[1].trim();
  }

  // 2. Extract caption / title
  const capMatch =
    rawHtml.match(/<p[^>]*class=["'][^"']*maintext[^"']*["'][^>]*>([^<]+)<\/p>/i) ||
    rawHtml.match(/<div[^>]*class=["'][^"']*(?:caption|video-title|desc)[^"']*["'][^>]*>([^<]+)<\/div>/i) ||
    rawHtml.match(/<h2[^>]*>([^<]+)<\/h2>/i) ||
    rawHtml.match(/<title>([^<]+)<\/title>/i);
  if (capMatch && capMatch[1]) {
    result.caption = capMatch[1].replace(/Download.*$/i, '').trim();
  }

  // 3. Extract thumbnail
  const thumbMatch =
    rawHtml.match(/<img[^>]*class=["'][^"']*(?:thumb|poster|preview)[^"']*["'][^>]*src=["'](https?:\/\/[^"']+)["']/i) ||
    rawHtml.match(/poster=["'](https?:\/\/[^"']+)["']/i);
  if (thumbMatch && thumbMatch[1]) {
    result.thumbnail = thumbMatch[1].replace(/&amp;/g, '&');
  }

  // 4. Extract all candidate video download links
  const extractedCandidates = new Set<string>();

  const regexes = [
    /href=["'](https?:\/\/[^"']*(?:cdninstagram\.com|fbcdn\.net)[^"']*\.mp4[^"']*)["']/gi,
    /href=["'](https?:\/\/[^"']*(?:cdninstagram\.com|fbcdn\.net)\/o1\/v\/[^"']*)["']/gi,
    /href=["'](https?:\/\/[^"']*(?:rapidcdn|tikcdn|snaptik|snapsave|fastdl|savefrom|worker\.savefrom|indown|saveig|download)[^"']*\.mp4[^"']*)["']/gi,
    /class=["'][^"']*(?:link-download|download_link|download-icon|download-bottom|btn-download)[^"']*["'][^>]*href=["'](https?:\/\/[^"']+)["']/gi,
    /href=["'](https?:\/\/[^"']+)["'][^>]*class=["'][^"']*(?:link-download|download_link|download-icon|download-bottom|btn-download)[^"']/gi,
    /data-url=["'](https?:\/\/[^"']+)["']/gi,
    /data-copy=["'](https?:\/\/[^"']+)["']/gi,
    /<source[^>]+src=["'](https?:\/\/[^"']+)["']/gi,
    /<video[^>]+src=["'](https?:\/\/[^"']+)["']/gi,
    /href=["'](https?:\/\/[^"']+\.(?:mp4|mov|webm)[^"']*)["']/gi
  ];

  for (const reg of regexes) {
    for (const m of rawHtml.matchAll(reg)) {
      const u = (m[1] || '').replace(/&amp;/g, '&').trim();
      if (u.startsWith('http') && !u.includes('search-panel-video.mp4') && !u.includes('.jpg') && !u.includes('.jpeg')) {
        extractedCandidates.add(u);
      }
    }
  }

  result.videoUrls = Array.from(extractedCandidates);
  return result;
}

export async function resolveTikTok(url: string) {
  const cleanInput = url.trim();

  // If input contains a URL within text, extract it
  let targetUrl = cleanInput;
  const match = cleanInput.match(/https?:\/\/[^\s"'<>]+/i);
  if (match && match[0]) {
    targetUrl = match[0];
  }

  // Follow redirect if shortlink (vt.tiktok.com, vm.tiktok.com, m.tiktok.com)
  let canonicalUrl = targetUrl;
  if (/vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com/i.test(targetUrl)) {
    try {
      const headRes = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(7000),
        headers: {
          'User-Agent': MOBILE_UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (headRes.url && headRes.url !== targetUrl && !headRes.url.includes('/?_r=')) {
        canonicalUrl = headRes.url;
      }
    } catch (e) {
      console.warn("[shareDownload] Shortlink redirect check notice:", e);
    }
  }

  const candidateUrls = Array.from(new Set([canonicalUrl, targetUrl])).filter(Boolean);

  // Strategy 1: Standalone yt-dlp JSON Extractor (Directly extracts 1080p stream from TikTok without rate limits)
  const ytdlpPath = path.join(process.cwd(), "bin", "yt-dlp");
  if (fs.existsSync(ytdlpPath)) {
    for (const cand of candidateUrls) {
      try {
        const ytdlpResult = await new Promise<{ videoUrl: string; cover: string; title: string } | null>((resolve) => {
          execFile(ytdlpPath, [
            "-j",
            "--no-warnings",
            "--no-check-certificates",
            "--socket-timeout", "15",
            cand
          ], { timeout: 22000 }, (err, stdout) => {
            if (!err && stdout) {
              try {
                const j = JSON.parse(stdout);
                const directVid = j.url || (Array.isArray(j.formats) ? j.formats.slice().reverse().find((f: any) => f.url && f.ext === 'mp4')?.url : null);
                if (directVid && directVid.startsWith('http')) {
                  return resolve({
                    videoUrl: directVid,
                    cover: j.thumbnail || '',
                    title: j.title || j.description || ''
                  });
                }
              } catch (parseErr) {}
            }
            resolve(null);
          });
        });
        if (ytdlpResult && ytdlpResult.videoUrl) {
          console.log(`[shareDownload] Successfully resolved TikTok with yt-dlp engine: ${ytdlpResult.title.slice(0, 40)}`);
          return ytdlpResult;
        }
      } catch (ytErr) {
        console.warn("[shareDownload] yt-dlp extractor notice:", ytErr);
      }
    }
  }

  // Strategy 2: TikWM API (GET & POST)
  for (const cand of candidateUrls) {
    try {
      const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(cand), {
        headers: {
          'User-Agent': UA,
          'Accept': 'application/json, text/plain, */*'
        },
        signal: AbortSignal.timeout(9000)
      });
      const j: any = await r.json();
      if (j && j.code === 0 && j.data) {
        const d = j.data;
        const vid = d.hdplay || d.play || d.wmplay;
        if (vid) {
          return {
            videoUrl: vid.startsWith('http') ? vid : absolute(vid, 'https://www.tikwm.com'),
            cover: d.cover ? (d.cover.startsWith('http') ? d.cover : absolute(d.cover, 'https://www.tikwm.com')) : '',
            title: d.title || ''
          };
        }
      }
    } catch (e) {}

    try {
      const r = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: {
          'User-Agent': UA,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: `url=${encodeURIComponent(cand)}&count=12&cursor=0&web=1&hd=1`,
        signal: AbortSignal.timeout(9000)
      });
      const j: any = await r.json();
      if (j && j.code === 0 && j.data) {
        const d = j.data;
        const vid = d.hdplay || d.play || d.wmplay;
        if (vid) {
          return {
            videoUrl: vid.startsWith('http') ? vid : absolute(vid, 'https://www.tikwm.com'),
            cover: d.cover ? (d.cover.startsWith('http') ? d.cover : absolute(d.cover, 'https://www.tikwm.com')) : '',
            title: d.title || ''
          };
        }
      }
    } catch (e) {}
  }

  // Strategy 3: Lovetik API Engine
  for (const cand of candidateUrls) {
    try {
      const r = await fetch('https://lovetik.com/api/ajax/search', {
        method: 'POST',
        headers: {
          'User-Agent': UA,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://lovetik.com',
          'Referer': 'https://lovetik.com/'
        },
        body: `query=${encodeURIComponent(cand)}`,
        signal: AbortSignal.timeout(8000)
      });
      if (r.ok) {
        const j: any = await r.json();
        if (j && Array.isArray(j.links) && j.links.length > 0) {
          const mp4Link = j.links.find((l: any) => l.t === 'mp4' || l.a === 'mp4' || (l.a && l.a.includes('.mp4'))) || j.links[0];
          if (mp4Link && mp4Link.a && mp4Link.a.startsWith('http')) {
            return {
              videoUrl: mp4Link.a,
              cover: j.cover || '',
              title: j.desc || ''
            };
          }
        }
      }
    } catch (e) {}
  }

  // Strategy 4: SSSTik Engine fallback
  for (const cand of candidateUrls) {
    try {
      const sssRes = await fetch("https://ssstik.io/abc?url=dl", {
        method: "POST",
        headers: {
          "User-Agent": UA,
          "Referer": "https://ssstik.io/en",
          "Origin": "https://ssstik.io",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "hx-request": "true",
          "hx-target": "target",
          "hx-current-url": "https://ssstik.io/en"
        },
        body: `id=${encodeURIComponent(cand)}&locale=en&tt=0`,
        signal: AbortSignal.timeout(8000)
      });
      if (sssRes.ok) {
        const sssHtml = await sssRes.text();
        const dlMatch = sssHtml.match(/href="([^"]+)"[^>]*class="[^"]*download_link[^"]*"/i) ||
                        sssHtml.match(/href="(https:\/\/[^"]+\.tikcdn\.io[^"]+)"/i) ||
                        sssHtml.match(/href="([^"]+)"[^>]*without_watermark/i);
        const titleMatch = sssHtml.match(/<p\s+class="maintext">([^<]+)<\/p>/i);
        if (dlMatch && dlMatch[1]) {
          return {
            videoUrl: dlMatch[1].replace(/&amp;/g, "&"),
            cover: '',
            title: titleMatch ? titleMatch[1].trim() : ''
          };
        }
      }
    } catch (e) {}
  }

  // Strategy 5: TiklyDown API fallback
  for (const cand of candidateUrls) {
    try {
      const tdRes = await fetch('https://api.tiklydown.eu.org/api/download?url=' + encodeURIComponent(cand), {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(8000)
      });
      if (tdRes.ok) {
        const j: any = await tdRes.json();
        const vid = j?.video?.noWatermark || j?.video?.watermark || j?.videoUrl;
        if (vid && vid.startsWith('http')) {
          return {
            videoUrl: vid,
            cover: j?.author?.avatar || '',
            title: j?.title || ''
          };
        }
      }
    } catch (e) {}
  }

  throw new Error('TikTok video could not be resolved. Please verify the link is public and active.');
}

export function instaShortcode(url: string): string {
  const m = url.match(/(?:instagram\.com|instagr\.am)\/(?:[^/]+\/)?(?:reel|reels|p|tv|share\/reel|share\/p|share)\/([A-Za-z0-9_-]+)/i) ||
            url.match(/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : '';
}

export function decryptSnapSave(data: string): string | null {
  try {
    const match = data.match(/\}\s*\(\s*(".*?")\s*,\s*(\d+)\s*,\s*(".*?")\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/s);
    if (!match) return null;
    const h = JSON.parse(match[1]);
    const n = JSON.parse(match[3]);
    const t = parseInt(match[4], 10);
    const e = parseInt(match[5], 10);

    const decode = (d: string, base: number, outBase: number) => {
      const g = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
      const hArr = g.slice(0, base);
      const iArr = g.slice(0, outBase);
      let j = d.split("").reverse().reduce((a, b, c) => {
        const idx = hArr.indexOf(b);
        return idx !== -1 ? a + idx * Math.pow(base, c) : a;
      }, 0);
      let k = "";
      while (j > 0) {
        k = iArr[j % outBase] + k;
        j = (j - (j % outBase)) / outBase;
      }
      return parseInt(k || "0", 10);
    };

    let res = "";
    for (let i = 0, len = h.length; i < len; i++) {
      let s = "";
      while (h[i] !== n[e] && i < len) {
        s += h[i];
        i++;
      }
      for (let j = 0; j < n.length; j++) {
        s = s.replace(new RegExp(n[j], "g"), j.toString());
      }
      res += String.fromCharCode(decode(s, e, 10) - t);
    }

    try {
      return decodeURIComponent(escape(res));
    } catch {
      return res;
    }
  } catch {
    return null;
  }
}

/**
 * Multi-Engine Instagram Reel and Video Resolver
 * Extracts real MP4 video stream (strictly filters out JPG image display urls)
 */
export async function resolveInstagram(rawUrl: string) {
  let url = rawUrl.trim();

  // Follow redirect if it is an Instagram shortlink
  if (/\/share\//i.test(url) || /instagr\.am/i.test(url)) {
    try {
      const headRes = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': UA }
      });
      if (headRes.url && headRes.url !== url && !headRes.url.includes('/accounts/login')) {
        url = headRes.url;
      }
    } catch {}
  }

  const code = instaShortcode(url);
  const cleanReelUrl = code ? `https://www.instagram.com/reel/${code}/` : url;

  // Strategy 1: Instagram Embed Page JSON Parser (Direct Video URL extraction)
  if (code) {
    try {
      const embedUrl = `https://www.instagram.com/p/${code}/embed/captioned/`;
      const embedRes = await fetch(embedUrl, {
        signal: AbortSignal.timeout(6000),
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      if (embedRes.ok) {
        const html = await embedRes.text();
        const vUrlMatch = html.match(/"video_url":"([^"]+)"/i) ||
                          html.match(/<video[^>]*class="[^"]*EmbeddedMediaVideo[^"]*"[^>]*src="([^"]+)"/i) ||
                          html.match(/src="([^"]+\.cdninstagram\.com[^"]+\.mp4[^"]*)"/i);
        const titleMatch = html.match(/<div class="Caption">([^<]+)<\/div>/i) ||
                           html.match(/<meta property="og:title" content="([^"]+)"/i);
        if (vUrlMatch && vUrlMatch[1]) {
          const directVid = vUrlMatch[1].replace(/\\u0026/g, '&').replace(/&amp;/g, '&');
          return {
            videoUrl: directVid,
            cover: '',
            title: titleMatch ? titleMatch[1].trim() : ''
          };
        }
      }
    } catch (e) {
      console.warn("[shareDownload] Instagram Embed engine notice:", e);
    }
  }

  // Strategy 2: SnapSave Decryption Engine
  try {
    const form = new FormData();
    form.append("url", cleanReelUrl);
    const snapRes = await fetch("https://snapsave.app/action.php?lang=en", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "origin": "https://snapsave.app",
        "referer": "https://snapsave.app/en"
      },
      body: form,
      signal: AbortSignal.timeout(7000)
    });
    if (snapRes.ok) {
      const rawText = await snapRes.text();
      const decrypted = decryptSnapSave(rawText) || rawText;
      const urls = decrypted.match(/https:\/\/[^"'\s<>\\]+/g) || [];
      const mp4Candidate = urls.find(u =>
        (u.includes('rapidcdn.app') ||
        u.includes('snapsave.app/get') ||
        u.includes('cdninstagram.com') ||
        u.includes('fbcdn.net') ||
        u.includes('.mp4') ||
        u.includes('token=')) &&
        !u.includes('.jpg') && !u.includes('.jpeg') && !u.includes('.webp')
      );
      if (mp4Candidate) {
        const videoUrl = mp4Candidate.replace(/&amp;/g, '&').replace(/\\"/g, '');
        return { videoUrl, cover: '', title: '' };
      }
    }
  } catch (e) {
    console.warn("[shareDownload] SnapSave engine notice:", e);
  }

  // Strategy 3: SaveFrom.net Worker API
  try {
    const sfRes = await fetch("https://worker.savefrom.net/savefrom.php", {
      method: "POST",
      headers: {
        "User-Agent": UA,
        "Origin": "https://en1.savefrom.net",
        "Referer": "https://en1.savefrom.net/",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `sf_url=${encodeURIComponent(cleanReelUrl)}&new=2&lang=en&app=`,
      signal: AbortSignal.timeout(9000)
    });
    if (sfRes.ok) {
      const sfText = await sfRes.text();
      const sfMatches = [
        ...sfText.matchAll(/href=["'](https?:\/\/[^"']*(?:cdninstagram\.com|fbcdn\.net)[^"']*\.mp4[^"']*)["']/gi),
        ...sfText.matchAll(/href=["'](https?:\/\/[^"']+\.mp4[^"']*)["']/gi),
        ...sfText.matchAll(/class=["'][^"']*link-download[^"']*["'][^>]*href=["']([^"']+)["']/gi),
        ...sfText.matchAll(/href=["']([^"']+)["'][^>]*class=["'][^"']*link-download[^"']*["']/gi)
      ];
      for (const m of sfMatches) {
        const dlUrl = (m[1] || "").replace(/&amp;/g, '&');
        if (dlUrl && dlUrl.startsWith("http") && !dlUrl.includes('.jpg') && !dlUrl.includes('.jpeg')) {
          return { videoUrl: dlUrl, cover: '', title: '' };
        }
      }
    }
  } catch (e) {
    console.warn("[shareDownload] SaveFrom engine notice:", e);
  }

  throw new Error('Instagram video could not be resolved directly.');
}

router.post('/api/share/resolve', async (req, res) => {
  try {
    const text = String(req.body?.text || '');
    const url = extractUrl(text);
    if (!url) return res.status(400).json({ success: false, error: 'No link found in the provided text' });

    const lower = url.toLowerCase();
    let data: any = null;
    let platform = 'tiktok';

    if (lower.includes('tiktok.com') || lower.includes('douyin.com')) {
      platform = 'tiktok';
      data = await resolveTikTok(url);
    } else if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      platform = 'instagram';
      data = await resolveInstagram(url);
    } else {
      return res.status(400).json({ success: false, error: 'Unsupported link. Please share a TikTok or Instagram link.' });
    }

    if (!data || !data.videoUrl) {
      throw new Error('Video could not be resolved from this link.');
    }

    // Return direct streaming URL so client can preview without CORS/token expiry issues, along with raw video url
    const streamProxyUrl = `/api/share/stream?u=${encodeURIComponent(data.videoUrl)}`;
    return res.json({
      success: true,
      platform,
      url,
      title: data.title || '',
      cover: data.cover || '',
      videoUrl: streamProxyUrl,
      rawVideoUrl: data.videoUrl
    });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e?.message || 'Download resolve failed' });
  }
});

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
    const h = u.hostname;
    if (h === 'localhost' || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h)) return false;
    return true;
  } catch {
    return false;
  }
}

// Streaming Video Proxy (Handles HTTP Range Requests, iOS / Android inline playback)
router.get('/api/share/stream', async (req, res) => {
  try {
    const target = String(req.query.u || '');
    if (!isSafeUrl(target)) return res.status(400).send('Invalid or forbidden URL');

    const referer = getAppropriateReferer(target);
    const headers: Record<string, string> = {
      'User-Agent': UA,
      'Accept': '*/*'
    };
    if (referer) headers['Referer'] = referer;
    if (req.headers.range) {
      headers['Range'] = String(req.headers.range);
    } else {
      headers['Range'] = 'bytes=0-';
    }

    let r = await fetch(target, { headers, signal: AbortSignal.timeout(30000) });
    // If upstream rejected with 403 / 401 / 400 when Referer was present, retry without Referer
    if (!r.ok && r.status !== 206 && headers['Referer']) {
      delete headers['Referer'];
      r = await fetch(target, { headers, signal: AbortSignal.timeout(30000) });
    }

    if (!r.ok && r.status !== 206) {
      // If upstream CDN URL expired, attempt re-resolve ONLY from exact original sourceUrl if provided
      const sourceParam = String(req.query.source || '').trim();
      if (sourceParam && isSafeUrl(sourceParam)) {
        try {
          const lowerSrc = sourceParam.toLowerCase();
          const fresh = (lowerSrc.includes('instagram.com') || lowerSrc.includes('instagr.am'))
            ? await resolveInstagram(sourceParam)
            : await resolveTikTok(sourceParam);
          if (fresh && fresh.videoUrl && isSafeUrl(fresh.videoUrl)) {
            const freshRef = getAppropriateReferer(fresh.videoUrl);
            const freshHeaders: Record<string, string> = {
              'User-Agent': UA,
              'Accept': '*/*',
              'Range': req.headers.range ? String(req.headers.range) : 'bytes=0-'
            };
            if (freshRef) freshHeaders['Referer'] = freshRef;
            r = await fetch(fresh.videoUrl, { headers: freshHeaders, signal: AbortSignal.timeout(30000) });
          }
        } catch {}
      }
    }

    if (!r.ok && r.status !== 206) {
      // Strictly fail rather than serving a demo video
      return res.status(502).send('Upstream media fetch failed or link expired');
    }

    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'video/mp4');
    const len = r.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);
    const cr = r.headers.get('content-range');
    if (cr) res.setHeader('Content-Range', cr);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (!r.body) return res.end();
    Readable.fromWeb(r.body as any).pipe(res);
  } catch (err: any) {
    res.status(500).send('Stream error: ' + (err?.message || err));
  }
});

function resolvePersonaDetails(rawModel: any) {
  let modelObj = typeof rawModel === 'object' && rawModel !== null ? { ...rawModel } : {};
  const modelIdOrHandle = typeof rawModel === 'string' ? rawModel : (modelObj.id || modelObj.handle || '');

  try {
    const personasFile = path.join(process.cwd(), "community_personas.json");
    if (fs.existsSync(personasFile)) {
      const personas = JSON.parse(fs.readFileSync(personasFile, "utf-8"));
      if (Array.isArray(personas)) {
        const found = personas.find((p: any) => 
          p.id === modelIdOrHandle || 
          p.handle === modelIdOrHandle || 
          p.handle === `@${modelIdOrHandle}` ||
          (modelObj.name && p.name && p.name.toLowerCase() === modelObj.name.toLowerCase())
        );
        if (found) {
          modelObj = { ...found, ...modelObj };
        }
      }
    }
  } catch {}

  const authorName = (modelObj.name || 'Atif Nirob').trim();
  const rawHandle = modelObj.handle || modelObj.numberId || modelObj.authorUsername || modelObj.id || 'niromax';
  const authorHandle = String(rawHandle).replace(/^@/, '').trim();
  const authorAvatar = modelObj.avatar || modelObj.avatarUrl || modelObj.avatarUrlOrBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

  return { authorName, authorHandle, authorAvatar, modelId: modelObj.id || authorHandle };
}

// Permanent Social Video Publisher (/api/share/publish)
router.post('/api/share/publish', async (req, res) => {
  try {
    const { videoUrl, rawVideoUrl, sourceUrl, url, title, cover, platform, model } = req.body;
    const originalSourceUrl = String(sourceUrl || url || '').trim();
    const targetVideo = (rawVideoUrl || videoUrl || '').trim();
    if (!targetVideo && !originalSourceUrl) {
      return res.status(400).json({ success: false, error: 'Video URL is required' });
    }

    const uniqueTimestamp = Date.now();
    const isInsta = platform === 'instagram' || targetVideo.includes('instagram') || originalSourceUrl.includes('instagram');
    const diskFilename = `${isInsta ? 'instagram' : 'tiktok'}_${uniqueTimestamp}.mp4`;
    const diskPath = path.join(MEDIA_DIR, diskFilename);

    let savedUrl = '';

    // 1. If client already referenced an existing verified /media/<file>.mp4 on disk, use it
    if (targetVideo.startsWith('/media/')) {
      const existingFilename = path.basename(targetVideo).replace(/[^a-zA-Z0-9_.-]/g, '');
      const existingPath = path.join(MEDIA_DIR, existingFilename);
      if (fs.existsSync(existingPath) && isValidVideoBuffer(fs.readFileSync(existingPath))) {
        savedUrl = `/media/${existingFilename}`;
      }
    }

    // 2. Unwrap direct remote video URL from proxy link if necessary
    let directRemoteUrl = (rawVideoUrl || '').trim();
    if (!directRemoteUrl) {
      if (targetVideo.startsWith('/api/share/stream?u=') || targetVideo.includes('/api/share/stream?u=')) {
        try {
          const uParam = targetVideo.split('/api/share/stream?u=')[1];
          directRemoteUrl = decodeURIComponent(uParam.split('&')[0]);
        } catch {}
      } else if (targetVideo.startsWith('http')) {
        directRemoteUrl = targetVideo;
      }
    }

    // 3. Download genuine video bytes permanently to disk
    if (!savedUrl && (directRemoteUrl.startsWith('http') || originalSourceUrl.startsWith('http'))) {
      let savedBuf = await downloadMediaBufferWithFallbacks(directRemoteUrl, diskPath, originalSourceUrl || directRemoteUrl);
      // If direct CDN URL already expired, re-resolve fresh URL from originalSourceUrl
      if ((!savedBuf || !isValidVideoBuffer(savedBuf)) && originalSourceUrl.startsWith('http')) {
        try {
          const fresh = isInsta ? await resolveInstagram(originalSourceUrl) : await resolveTikTok(originalSourceUrl);
          if (fresh?.videoUrl) {
            savedBuf = await downloadMediaBufferWithFallbacks(fresh.videoUrl, diskPath, originalSourceUrl);
          }
        } catch {}
      }
      if (savedBuf && isValidVideoBuffer(savedBuf) && fs.existsSync(diskPath)) {
        savedUrl = `/media/${diskFilename}`;
        try {
          const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
          if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
          const backupVideoPath = path.join(vaultDir, diskFilename);
          fs.copyFileSync(diskPath, backupVideoPath);
        } catch (ve) {}
        console.log(`[shareDownload] Permanent video saved to disk: ${diskPath} (${(savedBuf.length / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    // 4. Strictly fail if the actual user video could not be downloaded/verified — NEVER substitute a demo video!
    if (!savedUrl) {
      try { if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath); } catch {}
      return res.status(400).json({
        success: false,
        error: 'মূল ভিডিওটি ডাউনলোড বা সংরক্ষণ করা সম্ভব হয়নি। লিংকটি সঠিক ও পাবলিক কি না নিশ্চিত করে আবার চেষ্টা করুন।'
      });
    }

    // Save cover image permanently to disk as well
    let savedCover = '';
    if (cover && cover.startsWith('http')) {
      const coverDiskFilename = `${isInsta ? 'instagram' : 'tiktok'}_${uniqueTimestamp}.jpg`;
      const coverDiskPath = path.join(MEDIA_DIR, coverDiskFilename);
      try {
        const cRes = await fetch(cover, {
          headers: { 'User-Agent': UA, 'Referer': isInsta ? 'https://www.instagram.com/' : 'https://www.tiktok.com/' },
          signal: AbortSignal.timeout(15000)
        });
        if (cRes.ok) {
          const cBuf = Buffer.from(await cRes.arrayBuffer());
          if (cBuf.length > 500) {
            fs.writeFileSync(coverDiskPath, cBuf);
            savedCover = `/media/${coverDiskFilename}`;
            try {
              const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
              if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
              fs.copyFileSync(coverDiskPath, path.join(vaultDir, coverDiskFilename));
            } catch {}
          }
        }
      } catch (ce) {}
    }
    if (!savedCover && savedUrl.startsWith('/media/')) {
      const localPoster = path.join(MEDIA_DIR, path.basename(savedUrl).replace(/\.mp4$/, '.jpg'));
      if (fs.existsSync(localPoster)) {
        savedCover = savedUrl.replace(/\.mp4$/, '.jpg');
      }
    }
    if (!savedCover && cover) {
      savedCover = cover;
    }

    // Accurately extract selected model attributes
    const { authorName, authorHandle, authorAvatar, modelId } = resolvePersonaDetails(model);

    const newPostId = `tiktok-post-${uniqueTimestamp}-${Math.random().toString(36).substring(2, 6)}`;
    const newPost = {
      id: newPostId,
      author: authorName,
      avatarUrlOrBase64: authorAvatar,
      numberId: authorHandle,
      createdAt: new Date().toISOString(),
      content: (title || 'Aesthetic grind 🔥').slice(0, 120),
      video: savedUrl,
      image: savedCover || (savedUrl.startsWith('/media/') ? savedUrl.replace(/\.mp4$/, '.jpg') : ''),
      sourceUrl: originalSourceUrl || undefined,
      likedBy: [authorName, "Atif (Lead Creator)", "Sajid Rahman", "Tahmid Alvi"],
      isLead: authorHandle === 'itsatifbro' || authorHandle === 'niromax',
      comments: []
    };

    // Save directly to community_posts.json
    try {
      const postsFile = path.join(process.cwd(), "community_posts.json");
      let posts: any[] = [];
      if (fs.existsSync(postsFile)) {
        posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
      }
      posts.unshift(newPost);
      if (posts.length > 500) posts = posts.slice(0, 500);
      fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), "utf-8");

      // Lifetime Permanent Archive: Never deleted or truncated
      const archiveFile = path.join(process.cwd(), "community_permanent_archive.json");
      let archive: any[] = [];
      if (fs.existsSync(archiveFile)) {
        try { archive = JSON.parse(fs.readFileSync(archiveFile, "utf-8")); } catch (e) {}
      }
      archive.unshift(newPost);
      fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2), "utf-8");

      // Synchronize immediately with server.ts in-memory state and persistent DB
      if (typeof (global as any).syncCommunityPost === 'function') {
        (global as any).syncCommunityPost(newPost);
      }
    } catch (e) {
      console.warn("[shareDownload] Save to community_posts.json error:", e);
    }

    // Also register in community_vault.json
    try {
      const vaultFile = path.join(process.cwd(), "community_vault.json");
      let vault: any[] = [];
      if (fs.existsSync(vaultFile)) {
        vault = JSON.parse(fs.readFileSync(vaultFile, "utf-8"));
      }
      vault.unshift({
        id: newPostId,
        persona: modelId,
        author: authorName,
        avatar: authorAvatar,
        numberId: authorHandle,
        image: savedUrl,
        mediaType: 'video',
        caption: newPost.content,
        sourceUrl: originalSourceUrl || undefined,
        createdAt: newPost.createdAt,
        postedToGrowgram: true
      });
      if (vault.length > 500) vault = vault.slice(0, 500);
      fs.writeFileSync(vaultFile, JSON.stringify(vault, null, 2), "utf-8");
    } catch (ve) {}

    return res.json({
      success: true,
      post: newPost,
      videoUrl: savedUrl
    });
  } catch (err: any) {
    console.error("[shareDownload] Publish error:", err);
    res.status(500).json({ success: false, error: err?.message || 'Publish failed' });
  }
});

// Rapid One-Step Share & Publish Endpoint (/api/share/quick-post)
// Resolves, downloads, and publishes a video directly to GrowGram in a single atomic call
router.post('/api/share/quick-post', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  try {
    const rawText = String(req.body?.url || req.body?.text || '');
    const url = extractUrl(rawText);
    if (!url) {
      return res.status(400).json({ success: false, error: 'No video link found in text' });
    }

    const lower = url.toLowerCase();
    let data: any = null;
    let platform = 'tiktok';

    if (lower.includes('tiktok.com') || lower.includes('douyin.com')) {
      platform = 'tiktok';
      data = await resolveTikTok(url);
    } else if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
      platform = 'instagram';
      data = await resolveInstagram(url);
    } else {
      return res.status(400).json({ success: false, error: 'Please share a TikTok or Instagram link.' });
    }

    if (!data || !data.videoUrl) {
      throw new Error('Video could not be resolved from this link.');
    }

    const targetVideo = data.videoUrl;
    const uniqueTimestamp = Date.now();
    const diskFilename = `${platform}_${uniqueTimestamp}.mp4`;
    const diskPath = path.join(MEDIA_DIR, diskFilename);

    let savedUrl = '';

    // Download video bytes permanently — NEVER substitute a demo video on failure
    if (targetVideo.startsWith('http')) {
      const savedBuf = await downloadMediaBufferWithFallbacks(targetVideo, diskPath, url);
      if (savedBuf && isValidVideoBuffer(savedBuf) && fs.existsSync(diskPath)) {
        savedUrl = `/media/${diskFilename}`;
        try {
          const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
          if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
          const backupVideoPath = path.join(vaultDir, diskFilename);
          fs.copyFileSync(diskPath, backupVideoPath);
        } catch (ve) {}
        console.log(`[shareDownload] Successfully saved video to disk: ${diskPath} (${(savedBuf.length / 1024 / 1024).toFixed(2)} MB)`);
      }
    }

    if (!savedUrl) {
      try { if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath); } catch {}
      return res.status(400).json({
        success: false,
        error: 'ভিডিওটি ডাউনলোড করা সম্ভব হয়নি। লিংকটি সঠিক ও পাবলিক কি না নিশ্চিত করে আবার চেষ্টা করুন।'
      });
    }

    let savedCover = '';
    if (data.cover && data.cover.startsWith('http')) {
      const coverDiskFilename = `${platform}_${uniqueTimestamp}.jpg`;
      const coverDiskPath = path.join(MEDIA_DIR, coverDiskFilename);
      try {
        const cRes = await fetch(data.cover, { headers: { 'User-Agent': UA } });
        if (cRes.ok) {
          const cBuf = Buffer.from(await cRes.arrayBuffer());
          if (cBuf.length > 500) {
            fs.writeFileSync(coverDiskPath, cBuf);
            savedCover = `/media/${coverDiskFilename}`;
            try {
              const vaultDir = path.join(process.cwd(), "public", "media", "backup_vault");
              if (!fs.existsSync(vaultDir)) fs.mkdirSync(vaultDir, { recursive: true });
              fs.copyFileSync(coverDiskPath, path.join(vaultDir, coverDiskFilename));
            } catch {}
          }
        }
      } catch (ce) {}
    }
    if (!savedCover && savedUrl.startsWith('/media/')) {
      const localPoster = path.join(MEDIA_DIR, path.basename(savedUrl).replace(/\.mp4$/, '.jpg'));
      if (fs.existsSync(localPoster)) {
        savedCover = savedUrl.replace(/\.mp4$/, '.jpg');
      }
    }

    const { authorName, authorHandle, authorAvatar, modelId } = resolvePersonaDetails(req.body?.model);

    const newPostId = `tiktok-post-${uniqueTimestamp}-${Math.random().toString(36).substring(2, 6)}`;
    const newPost = {
      id: newPostId,
      author: authorName,
      avatarUrlOrBase64: authorAvatar,
      numberId: authorHandle,
      createdAt: new Date().toISOString(),
      content: (data.title || 'Aesthetic TikTok grind 🔥').slice(0, 100),
      video: savedUrl,
      image: savedCover || data.cover || '',
      sourceUrl: url,
      likedBy: [authorName, "Atif (Lead Creator)", "Sajid Rahman", "Tahmid Alvi"],
      isLead: authorHandle === 'itsatifbro' || authorHandle === 'niromax',
      comments: []
    };

    // Save directly to community_posts.json
    try {
      const postsFile = path.join(process.cwd(), "community_posts.json");
      let posts: any[] = [];
      if (fs.existsSync(postsFile)) {
        posts = JSON.parse(fs.readFileSync(postsFile, "utf-8"));
      }
      posts.unshift(newPost);
      if (posts.length > 500) posts = posts.slice(0, 500);
      fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2), "utf-8");

      // Lifetime Permanent Archive: Never deleted or truncated
      const archiveFile = path.join(process.cwd(), "community_permanent_archive.json");
      let archive: any[] = [];
      if (fs.existsSync(archiveFile)) {
        try { archive = JSON.parse(fs.readFileSync(archiveFile, "utf-8")); } catch (e) {}
      }
      archive.unshift(newPost);
      fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2), "utf-8");

      // Synchronize immediately with server.ts in-memory state and persistent DB
      if (typeof (global as any).syncCommunityPost === 'function') {
        (global as any).syncCommunityPost(newPost);
      }
    } catch (e) {
      console.warn("[shareDownload] Quick-post save to community_posts.json error:", e);
    }

    // Also register in community_vault.json
    try {
      const vaultFile = path.join(process.cwd(), "community_vault.json");
      let vault: any[] = [];
      if (fs.existsSync(vaultFile)) {
        vault = JSON.parse(fs.readFileSync(vaultFile, "utf-8"));
      }
      vault.unshift({
        id: newPostId,
        persona: modelId,
        author: authorName,
        avatar: authorAvatar,
        numberId: authorHandle,
        image: savedUrl,
        mediaType: 'video',
        caption: newPost.content,
        sourceUrl: url,
        createdAt: newPost.createdAt,
        postedToGrowgram: true
      });
      if (vault.length > 500) vault = vault.slice(0, 500);
      fs.writeFileSync(vaultFile, JSON.stringify(vault, null, 2), "utf-8");
    } catch (ve) {}

    return res.json({
      success: true,
      message: 'Video successfully posted to GrowGram!',
      title: data.title || '',
      postId: newPostId,
      post: newPost,
      videoUrl: savedUrl
    });
  } catch (err: any) {
    console.error("[shareDownload] quick-post error:", err);
    res.status(500).json({ success: false, error: err?.message || 'Quick post failed' });
  }
});

export default router;
