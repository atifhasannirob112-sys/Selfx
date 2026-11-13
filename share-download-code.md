# 1. public/manifest.json

```json
{
  "name": "Grow Gram",
  "short_name": "GrowGram",
  "id": "/",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "share_target": {
    "action": "/",
    "method": "GET",
    "params": { "title": "title", "text": "text", "url": "url" }
  }
}
```

# 2. public/sw.js

```js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', () => {});
```

# 3. index.html (inside head)

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#000000">
<link rel="manifest" href="/manifest.json">
<link rel="icon" href="/icon-192.png">
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
  }
</script>
```

# 4. shareDownload.ts (project root, next to server.ts)

```ts
import { Router } from 'express';
import { Readable } from 'node:stream';

const router = Router();

const UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36';

function extractUrl(text: string): string {
  const m = (text || '').match(/https?:\/\/[^\s]+/);
  return m ? m[0] : '';
}

function absolute(u: string, base: string): string {
  if (!u) return '';
  if (u.startsWith('//')) return 'https:' + u;
  if (u.startsWith('/')) return base + u;
  return u;
}

async function resolveTikTok(url: string) {
  const r = await fetch('https://www.tikwm.com/api/?hd=1&url=' + encodeURIComponent(url), {
    headers: { 'User-Agent': UA },
  });
  const j: any = await r.json();
  if (j.code !== 0 || !j.data) throw new Error(j.msg || 'TikTok resolve failed');
  const d = j.data;
  return {
    videoUrl: absolute(d.hdplay || d.play, 'https://www.tikwm.com'),
    cover: absolute(d.cover, 'https://www.tikwm.com'),
    title: d.title || '',
  };
}

function instaShortcode(url: string): string {
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : '';
}

async function resolveInstagram(url: string) {
  const code = instaShortcode(url);
  if (!code) throw new Error('Invalid Instagram link');

  // Strategy 1: embed page
  try {
    const r = await fetch(`https://www.instagram.com/p/${code}/embed/captioned/`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const html = await r.text();
    const m = html.match(/"video_url":"([^"]+)"/);
    if (m) {
      const videoUrl = JSON.parse('"' + m[1] + '"');
      const c = html.match(/"display_url":"([^"]+)"/);
      return { videoUrl, cover: c ? JSON.parse('"' + c[1] + '"') : '', title: '' };
    }
  } catch {}

  // Strategy 2: og:video meta tag
  try {
    const r = await fetch(`https://www.instagram.com/reel/${code}/`, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const html = await r.text();
    const m = html.match(/<meta property="og:video(?::secure_url)?" content="([^"]+)"/);
    if (m) {
      const i = html.match(/<meta property="og:image" content="([^"]+)"/);
      return {
        videoUrl: m[1].replace(/&amp;/g, '&'),
        cover: i ? i[1].replace(/&amp;/g, '&') : '',
        title: '',
      };
    }
  } catch {}

  // Strategy 3: plug your working snapsave / test_ig logic here
  throw new Error('Instagram video not found (private post or blocked)');
}

router.post('/api/share/resolve', async (req, res) => {
  try {
    const url = extractUrl(String(req.body?.text || ''));
    if (!url) return res.status(400).json({ error: 'No link found' });

    let data;
    let platform: 'tiktok' | 'instagram';
    if (/tiktok\.com/i.test(url)) {
      platform = 'tiktok';
      data = await resolveTikTok(url);
    } else if (/instagram\.com/i.test(url)) {
      platform = 'instagram';
      data = await resolveInstagram(url);
    } else {
      return res.status(400).json({ error: 'Only TikTok and Instagram links are supported' });
    }

    if (!data.videoUrl) throw new Error('Video URL not found');

    res.json({
      platform,
      title: data.title,
      cover: data.cover,
      videoUrl: '/api/share/stream?u=' + encodeURIComponent(data.videoUrl),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed' });
  }
});

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname;
    if (h === 'localhost' || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h)) return false;
    return true;
  } catch {
    return false;
  }
}

router.get('/api/share/stream', async (req, res) => {
  try {
    const target = String(req.query.u || '');
    if (!isSafeUrl(target)) return res.status(400).send('Bad url');

    const headers: Record<string, string> = { 'User-Agent': UA };
    if (req.headers.range) headers['Range'] = String(req.headers.range);

    const r = await fetch(target, { headers });
    if (!r.ok && r.status !== 206) return res.status(502).send('Upstream error');

    res.status(r.status);
    res.setHeader('Content-Type', r.headers.get('content-type') || 'video/mp4');
    const len = r.headers.get('content-length');
    if (len) res.setHeader('Content-Length', len);
    const cr = r.headers.get('content-range');
    if (cr) res.setHeader('Content-Range', cr);
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.query.dl === '1') {
      res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
    }

    if (!r.body) return res.end();
    Readable.fromWeb(r.body as any).pipe(res);
  } catch {
    res.status(500).send('Stream failed');
  }
});

export default router;
```

# 5. server.ts (add these lines)

```ts
import shareRouter from './shareDownload';

// after: const app = express();  and BEFORE vite middleware / static / app.get('*')
app.use(express.json());
app.use(shareRouter);
```

# 6. ShareReceiver.tsx (same folder as App.tsx)

```tsx
import { useEffect, useState } from 'react';

type Resolved = { platform: string; title: string; cover: string; videoUrl: string };

type Props = {
  onPost?: (v: Resolved) => Promise<void> | void;
};

export default function ShareReceiver({ onPost }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'posting' | 'posted'>('loading');
  const [data, setData] = useState<Resolved | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const text = [p.get('url'), p.get('text'), p.get('title')].filter(Boolean).join(' ');
    if (!/https?:\/\//.test(text)) return;

    window.history.replaceState({}, '', window.location.pathname);
    setOpen(true);

    fetch('/api/share/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed');
        setData(j);
        setStatus('ready');
      })
      .catch((e) => {
        setError(e.message || 'Failed');
        setStatus('error');
      });
  }, []);

  if (!open) return null;

  const post = async () => {
    if (!data || !onPost) return;
    setStatus('posting');
    try {
      await onPost(data);
      setStatus('posted');
      setTimeout(() => setOpen(false), 1200);
    } catch (e: any) {
      setError(e?.message || 'Post failed');
      setStatus('error');
    }
  };

  const btn: React.CSSProperties = {
    flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
    fontWeight: 600, fontSize: 15, textAlign: 'center', textDecoration: 'none', cursor: 'pointer',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', color: '#111', borderRadius: 16, width: '100%', maxWidth: 420, padding: 16 }}>
        {status === 'loading' && <p>Loading video...</p>}
        {status === 'error' && <p style={{ color: '#c00' }}>{error}</p>}
        {status === 'posted' && <p>Posted!</p>}

        {data && (status === 'ready' || status === 'posting') && (
          <>
            <video src={data.videoUrl} poster={data.cover} controls playsInline
              style={{ width: '100%', maxHeight: '55vh', borderRadius: 10, background: '#000' }} />
            {data.title && <p style={{ margin: '8px 0', fontSize: 14 }}>{data.title}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <a href={data.videoUrl + '&dl=1'} download style={{ ...btn, background: '#eee', color: '#111' }}>
                Download
              </a>
              <button onClick={post} disabled={status === 'posting'} style={{ ...btn, background: '#111', color: '#fff' }}>
                {status === 'posting' ? 'Posting...' : 'Post to Grow Gram'}
              </button>
            </div>
          </>
        )}

        <button onClick={() => setOpen(false)}
          style={{ ...btn, width: '100%', marginTop: 10, background: 'transparent', color: '#666' }}>
          Close
        </button>
      </div>
    </div>
  );
}
```

# 7. App.tsx (add)

```tsx
import ShareReceiver from './ShareReceiver';

// inside the returned JSX, at the very top:
<ShareReceiver
  onPost={async (v) => {
    // call your existing "create community post" function here
    // v.videoUrl, v.title, v.cover
  }}
/>
```
