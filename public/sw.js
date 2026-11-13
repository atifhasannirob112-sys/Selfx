const CACHE_VERSION = 'v5.5.0-alarm-selfie';
const CACHE_NAME = 'selfx-app-' + CACHE_VERSION;
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png'
];

// IndexedDB helper inside Service Worker for offline/background alarm checks
function swOpenAlarmDB() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open('selfx_sw_alarm_db', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('alarm_config')) {
          db.createObjectStore('alarm_config', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

async function swSaveAlarmSchedule(schedule) {
  try {
    const db = await swOpenAlarmDB();
    const tx = db.transaction('alarm_config', 'readwrite');
    tx.objectStore('alarm_config').put({ id: 'primary', ...schedule, updatedAt: Date.now() });
  } catch {}
}

async function swGetAlarmSchedule() {
  try {
    const db = await swOpenAlarmDB();
    return await new Promise((resolve) => {
      const tx = db.transaction('alarm_config', 'readonly');
      const req = tx.objectStore('alarm_config').get('primary');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function swCheckDueAlarmAndNotify() {
  try {
    const cfg = await swGetAlarmSchedule();
    if (!cfg || !cfg.enabled || !cfg.time) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    if (cfg.lastDismissedDate === todayStr) return;

    const [ah, am] = String(cfg.time).split(':').map((x) => parseInt(x, 10) || 0);
    const alarmMins = ah * 60 + am;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const diff = nowMins - alarmMins;

    // Trigger if currently at alarm minute or missed within last 15 minutes
    if (diff >= 0 && diff <= 15 && cfg.lastNotifiedKey !== `${todayStr}_${cfg.time}`) {
      await swSaveAlarmSchedule({ ...cfg, lastNotifiedKey: `${todayStr}_${cfg.time}` });
      await self.registration.showNotification(`🚨 SelfX এলার্ম (${cfg.time})`, {
        body: `${cfg.label || 'উঠুন চ্যাম্পিয়ন!'} — দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে এলার্ম বন্ধ করুন!`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'selfx-active-alarm',
        renotify: true,
        requireInteraction: true,
        vibrate: [800, 200, 800, 200, 1000, 200, 800],
        data: { url: '/?alarm_ring=1', type: 'ALARM_RING', time: cfg.time },
        actions: [{ action: 'open_selfie', title: '📸 সেলফি তুলে বন্ধ করুন' }]
      });
    }
  } catch {}
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Cache add non-fatal warning for', asset, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Purging obsolete cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()).then(() => swCheckDueAlarmAndNotify())
  );
});

// Handle Web Push events even when app/browser is completely closed or screen locked
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    try {
      payload = { body: event.data ? event.data.text() : '' };
    } catch {}
  }

  const isAlarm = payload.type === 'ALARM_RING' || !payload.type;
  const title = payload.title || '🚨 SelfX এলার্ম বেজে উঠেছে!';
  const body = payload.body || 'ঘুম থেকে উঠুন! দাঁড়িয়ে চোখ সোজা করে সেলফি তুলে এলার্ম বন্ধ করুন।';
  const targetUrl = payload.url || (isAlarm ? '/?alarm_ring=1' : '/');

  event.waitUntil(
    (async () => {
      await self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: isAlarm ? 'selfx-active-alarm' : 'selfx-push-' + Date.now(),
        renotify: true,
        requireInteraction: true,
        silent: false,
        vibrate: [800, 200, 800, 200, 1000, 200, 800, 200, 1000],
        data: {
          url: targetUrl,
          type: payload.type || 'ALARM_RING',
          time: payload.time,
          ringtone: payload.ringtone
        },
        actions: isAlarm
          ? [{ action: 'open_selfie', title: '📸 দাঁড়িয়ে সেলফি তুলে বন্ধ করুন' }]
          : [{ action: 'open', title: '👀 ওপেন করুন' }]
      });

      // Notify any active or background windows immediately to start ringing loudly
      if (isAlarm) {
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientList) {
          try {
            client.postMessage({
              type: 'SW_ALARM_RING',
              time: payload.time,
              ringtone: payload.ringtone,
              triggeredAt: payload.triggeredAt || Date.now()
            });
          } catch {}
        }
      }
    })()
  );
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'selfx-alarm-check') {
    event.waitUntil(swCheckDueAlarmAndNotify());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'selfx-alarm-check') {
    event.waitUntil(swCheckDueAlarmAndNotify());
  }
});

// Handle lock-screen / status-bar notification clicks
self.addEventListener('notificationclick', (event) => {
  const notifData = event.notification?.data || {};
  const isAlarm = notifData.type === 'ALARM_RING' || (event.notification?.tag || '').includes('alarm');
  event.notification.close();

  if (event.action === 'dismiss' && !isAlarm) {
    return;
  }

  const targetUrl = notifData.url || (isAlarm ? '/?alarm_ring=1' : '/');
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if (isAlarm) {
            try {
              client.postMessage({ type: 'SW_ALARM_RING', triggeredAt: Date.now() });
            } catch {}
            if ('navigate' in client && !client.url.includes('alarm_ring=1')) {
              try { await client.navigate(targetUrl); } catch {}
            }
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle incoming background notification requests, schedule sync, and version control from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))));
    return;
  }
  if (event.data && event.data.type === 'SAVE_ALARM_SCHEDULE') {
    swSaveAlarmSchedule(event.data.schedule || {});
    return;
  }
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    if (self.registration && self.registration.showNotification) {
      const defaultOptions = {
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        vibrate: [400, 150, 400, 150, 600],
        requireInteraction: true,
        tag: 'selfx-lock-alert-' + Date.now(),
        renotify: true,
        actions: [
          { action: 'open', title: '👀 ওপেন করুন' },
          { action: 'dismiss', title: '✕ সম্পন্ন' }
        ]
      };
      self.registration.showNotification(title, { ...defaultOptions, ...options });
    }
  }
});

// PWA Widgets API Support (for Android & Windows widget integration)
self.addEventListener('widgetinstall', (event) => {
  console.log('PWA Widget installed:', event.widget.tag);
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetuninstall', (event) => {
  console.log('PWA Widget uninstalled:', event.widget.tag);
  event.waitUntil(Promise.resolve());
});

self.addEventListener('widgetclick', (event) => {
  const widgetTag = event.widget ? event.widget.tag : '';
  const targetUrl = widgetTag.includes('dream') ? '/?widget=routine_4x2' : '/?widget=hub';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Always bypass API endpoints directly to network
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 1.5. Intercept Web Share Target (TikTok / Android share sheets)
  if (url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          let sharedUrl = url.searchParams.get('url') || '';
          let sharedText = url.searchParams.get('text') || '';
          let sharedTitle = url.searchParams.get('title') || '';
          if (event.request.method === 'POST') {
            const formData = await event.request.formData();
            sharedUrl = (formData.get('url') || '').toString();
            sharedText = (formData.get('text') || '').toString();
            sharedTitle = (formData.get('title') || '').toString();
            const mediaVal = formData.get('media');
            if (typeof mediaVal === 'string' && mediaVal) {
              sharedText += ' ' + mediaVal;
            }
          }
          const combined = `${sharedUrl} ${sharedText} ${sharedTitle}`.trim();
          const match = combined.match(/https?:\/\/[^\s]+/i);
          const target = match ? match[0] : (sharedUrl || sharedText || combined);
          const isInstagram = combined.includes('instagram.com') || combined.includes('instagr.am') || target.includes('instagram.com') || target.includes('instagr.am');
          const shareType = isInstagram ? 'instagram' : 'tiktok';
          return Response.redirect(`/?shared=${shareType}&url=` + encodeURIComponent(target), 303);
        } catch (e) {
          return Response.redirect('/?shared=social', 303);
        }
      })()
    );
    return;
  }

  // 2. Network-First with cache fallback for JavaScript bundles & CSS styles
  // CRITICAL: NEVER Cache-First for JS or CSS, so code updates (e.g. v4.9.4) apply instantly without reverting to older versions!
  const isScriptOrStyle =
    url.pathname.match(/\.(js|mjs|cjs|css)$/i) ||
    event.request.destination === 'script' ||
    event.request.destination === 'style';

  if (isScriptOrStyle) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            }).catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache ONLY when user is completely offline without internet
          return caches.match(event.request);
        })
    );
    return;
  }

  // 3. Cache-First with Stale-While-Revalidate for images, fonts, icons & static media
  const isImageOrMedia = 
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?|ttf|eot|mp4|webm)$/i) ||
    url.pathname.startsWith('/assets/images/') ||
    event.request.destination === 'image' ||
    event.request.destination === 'font';

  if (isImageOrMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              }).catch(() => {});
            }
            return networkResponse;
          })
          .catch((fetchErr) => {
            if (cachedResponse) return cachedResponse;
            throw fetchErr;
          });

        return cachedResponse || fetchPromise;
      }).catch(() => {
        return fetch(event.request);
      })
    );
    return;
  }

  // 4. Network-first with cache fallback for HTML and SPA navigation
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          }).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html') || caches.match('/');
          }
        });
      })
  );
});
