// Permanent Multi-Tier Media Storage Engine (Memory Cache + IndexedDB + LocalStorage + Server DB)

const MEDIA_DB_NAME = 'glowup_media_db_v4';
const MEDIA_STORE_NAME = 'glowup_media_store_v4';

// In-Memory Global Blob Cache to ensure 0-millisecond instant load & zero image/video disappearing
const inMemoryMediaCache = new Map<string, string>();

let idbPromise: Promise<IDBDatabase> | null = null;

export function initMediaDB(): Promise<IDBDatabase> {
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(MEDIA_DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        db.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      idbPromise = null;
      reject(request.error);
    };
  });

  return idbPromise;
}

export async function convertBlobUrlToDataUrl(blobUrl: string): Promise<string> {
  if (!blobUrl || !blobUrl.startsWith('blob:')) return blobUrl;
  try {
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Failed to convert blob url:", err);
    return blobUrl;
  }
}

/**
 * Save media blob/dataUrl permanently into:
 * 1. In-Memory Cache
 * 2. IndexedDB
 * 3. LocalStorage (if size permits)
 * 4. Server Media File Store (/api/community/media/upload)
 */
export async function saveMediaItem(id: string, rawDataUrl: string): Promise<void> {
  if (!id || !rawDataUrl) return;

  let dataUrl = rawDataUrl;
  if (dataUrl.startsWith('blob:')) {
    dataUrl = await convertBlobUrlToDataUrl(dataUrl);
  }

  if (dataUrl.startsWith('blob:')) {
    console.warn('[MediaStorage] Aborting server upload for unresolved blob url:', dataUrl);
    return;
  }

  const cleanId = id.replace(/^\/media\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
  const keysToCache = Array.from(new Set([id, cleanId, `media-id-${cleanId}`, `/media/${cleanId}.mp4`])).filter(Boolean);

  // 1. Memory Cache
  for (const k of keysToCache) {
    inMemoryMediaCache.set(k, dataUrl);
  }

  // 2. LocalStorage backup
  try {
    if (dataUrl.length < 2500000) {
      localStorage.setItem(`selfx_media_backup_${cleanId}`, dataUrl);
      localStorage.setItem(`selfx_media_backup_${id}`, dataUrl);
    }
  } catch (e) {
    // ignore quota error
  }

  // 3. IndexedDB
  try {
    const db = await initMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      store.put({ id: cleanId, data: dataUrl, updatedAt: Date.now() });
      if (id !== cleanId) {
        store.put({ id, data: dataUrl, updatedAt: Date.now() });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[MediaStorage] IndexedDB put error:', err);
  }

  // 4. Server Sync
  try {
    const res = await fetch('/api/community/media/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cleanId, dataUrl })
    });
    const d = await res.json();
    if (d && d.success) {
      console.log(`[MediaStorage] Media ${cleanId} synced to server successfully.`);
    }
  } catch (e) {
    console.warn('[MediaStorage] Server upload warning:', e);
  }
}

export async function isValidVideoBlob(blob: Blob): Promise<boolean> {
  if (!blob || blob.size < 15000) return false;
  if (blob.type && (blob.type.includes('text/html') || blob.type.includes('application/json'))) {
    return false;
  }
  try {
    const headBuf = await blob.slice(0, 256).arrayBuffer();
    const headBytes = new Uint8Array(headBuf);
    const headText = new TextDecoder('utf-8', { fatal: false }).decode(headBytes).toLowerCase();
    if (
      headText.includes('<!doctype') ||
      headText.includes('<html') ||
      headText.includes('<head') ||
      headText.includes('{"error') ||
      headText.includes('not found') ||
      headText.includes('access denied')
    ) {
      return false;
    }
    return true;
  } catch {
    return blob.size > 15000;
  }
}

function buildCandidateKeys(id: string): { cleanId: string; candidateKeys: string[] } {
  const idMatch = id.match(/(media-id-[0-9a-zA-Z_-]+|local-video-[0-9a-zA-Z_-]+|vault-media-[0-9a-zA-Z_-]+|upload-vid-[0-9a-zA-Z_-]+|vid-[0-9a-zA-Z_-]+|tiktok_[0-9a-zA-Z_-]+|instagram_[0-9a-zA-Z_-]+|post-[0-9a-zA-Z_-]+|tiktok-post-[0-9a-zA-Z_-]+|vault-model-post-[0-9a-zA-Z_-]+|share-post-[0-9a-zA-Z_-]+)/) ||
                  id.match(/\/media\/([a-zA-Z0-9_-]+)/);
  const cleanId = idMatch ? (idMatch[1] || idMatch[0]).replace(/^\/media\//, '').replace(/\.[^.]+$/, '') : id.replace(/^\/media\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');

  const candidateKeys = Array.from(new Set([
    id,
    cleanId,
    cleanId.replace(/^media-id-/, ''),
    `media-id-${cleanId}`,
    `/media/${cleanId}.mp4`
  ])).filter(Boolean);

  return { cleanId, candidateKeys };
}

/**
 * Save a real video/media Blob directly to IndexedDB (zero base64 overhead, permanent device persistence).
 */
export async function saveMediaBlob(id: string, blob: Blob, extraKeys: string[] = []): Promise<string | null> {
  if (!id || !blob) return null;
  const { cleanId, candidateKeys } = buildCandidateKeys(id);
  const allKeys = Array.from(new Set([...candidateKeys, ...extraKeys])).filter(Boolean);
  const blobUrl = URL.createObjectURL(blob);
  allKeys.forEach(k => inMemoryMediaCache.set(k, blobUrl));

  try {
    const db = await initMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const now = Date.now();
      for (const k of allKeys) {
        store.put({ id: k, blob, updatedAt: now });
      }
      if (cleanId && !allKeys.includes(cleanId)) {
        store.put({ id: cleanId, blob, updatedAt: now });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[MediaStorage] IndexedDB Blob put error:', err);
  }

  return blobUrl;
}

/**
 * Retrieve raw Blob from IndexedDB for playback or re-uploading to server after container restart.
 */
export async function getMediaRawBlob(id: string): Promise<Blob | null> {
  if (!id) return null;
  const { candidateKeys } = buildCandidateKeys(id);
  try {
    const db = await initMediaDB();
    for (const k of candidateKeys) {
      const record = await new Promise<any>((resolve) => {
        try {
          const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
          const req = tx.objectStore(MEDIA_STORE_NAME).get(k);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
      if (record) {
        if (record.blob instanceof Blob && record.blob.size > 500) {
          return record.blob;
        }
        if (typeof record.data === 'string' && record.data.startsWith('data:')) {
          try {
            const res = await fetch(record.data);
            const b = await res.blob();
            if (b.size > 500) return b;
          } catch {}
        }
      }
    }
  } catch {}
  return null;
}

/**
 * Fetch a /media/... video once and store its verified MP4 Blob in IndexedDB for permanent offline/restart survival.
 */
const pendingBlobCacheJobs = new Map<string, Promise<boolean>>();

export async function cacheRemoteVideoToIndexedDB(videoUrl: string, extraKeys: string[] = []): Promise<boolean> {
  if (!videoUrl || typeof window === 'undefined') return false;
  if (!videoUrl.startsWith('/media/')) return false;

  const existingJob = pendingBlobCacheJobs.get(videoUrl);
  if (existingJob) return existingJob;

  const job = (async () => {
    try {
      const existing = await getMediaRawBlob(videoUrl);
      if (existing && (await isValidVideoBlob(existing))) {
        return true;
      }

      const res = await fetch(videoUrl, { cache: 'no-store' });
      if (!res.ok) return false;
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        return false;
      }
      const blob = await res.blob();
      if (!(await isValidVideoBlob(blob))) {
        return false;
      }
      await saveMediaBlob(videoUrl, blob, extraKeys);
      return true;
    } catch {
      return false;
    } finally {
      pendingBlobCacheJobs.delete(videoUrl);
    }
  })();

  pendingBlobCacheJobs.set(videoUrl, job);
  return job;
}

/**
 * Retrieve media item with cascade:
 * Memory Cache -> IndexedDB (Blob or DataURL) -> LocalStorage -> Server API
 */
export async function getMediaItem(id: string): Promise<string | null> {
  if (!id) return null;

  // Direct raw base64 data URL
  if (id.startsWith('data:')) {
    return id;
  }

  const { cleanId, candidateKeys } = buildCandidateKeys(id);

  // 1. Check memory cache first
  for (const k of candidateKeys) {
    if (inMemoryMediaCache.has(k)) {
      const val = inMemoryMediaCache.get(k)!;
      if (val) return val;
    }
  }

  // 2. Check IndexedDB
  try {
    const db = await initMediaDB();
    for (const k of candidateKeys) {
      const record = await new Promise<any>((resolve) => {
        try {
          const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
          const store = tx.objectStore(MEDIA_STORE_NAME);
          const req = store.get(k);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });

      if (record) {
        let resolvedVal: string | null = null;
        if (record.blob instanceof Blob && record.blob.size > 500) {
          resolvedVal = URL.createObjectURL(record.blob);
        } else if (record.data) {
          resolvedVal = record.data;
        }
        if (resolvedVal) {
          candidateKeys.forEach(ck => inMemoryMediaCache.set(ck, resolvedVal!));
          return resolvedVal;
        }
      }
    }
  } catch (err) {
    console.warn('[MediaStorage] IndexedDB read warning:', err);
  }

  // 3. Check LocalStorage fallback
  for (const k of candidateKeys) {
    try {
      const localBackup = localStorage.getItem(`selfx_media_backup_${k}`);
      if (localBackup) {
        candidateKeys.forEach(ck => inMemoryMediaCache.set(ck, localBackup));
        saveMediaItem(cleanId, localBackup).catch(() => {});
        return localBackup;
      }
    } catch (e) {}
  }

  // 4. Check Server endpoint (strictly skipping if requesting /media/ static URL directly so 404 doesn't loop)
  if (cleanId && !id.startsWith('/media/')) {
    try {
      const res = await fetch(`/api/community/media?id=${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.dataUrl) {
          candidateKeys.forEach(ck => inMemoryMediaCache.set(ck, data.dataUrl));
          try {
            const db = await initMediaDB();
            const tx = db.transaction(MEDIA_STORE_NAME, 'readwrite');
            tx.objectStore(MEDIA_STORE_NAME).put({ id: cleanId, data: data.dataUrl, updatedAt: Date.now() });
          } catch (e) {}
          return data.dataUrl;
        }
      }
    } catch (err) {
      console.warn('[MediaStorage] Server fetch warning:', err);
    }
  }

  // If candidateKey is a direct URL path, return it as fallback
  if (id.startsWith('http://') || id.startsWith('https://') || id.startsWith('/')) {
    return id;
  }

  return null;
}

/**
 * Scan all stored keys in IndexedDB and LocalStorage to recover any uploaded videos/photos
 */
export async function getAllStoredMediaKeys(): Promise<string[]> {
  const keys = new Set<string>();

  // From LocalStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('selfx_media_backup_')) {
        keys.add(key.replace('selfx_media_backup_', ''));
      }
    }
  } catch (e) {}

  // From IndexedDB
  try {
    const db = await initMediaDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(MEDIA_STORE_NAME, 'readonly');
      const store = tx.objectStore(MEDIA_STORE_NAME);
      const req = store.getAllKeys();
      req.onsuccess = () => {
        if (req.result) {
          req.result.forEach(k => keys.add(String(k)));
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (e) {}

  return Array.from(keys);
}

/**
 * Ensures all local photos and videos are uploaded to the remote server
 * so that any secondary phone or device gets them instantly.
 */
export async function syncAllLocalMediaToServer(): Promise<void> {
  try {
    const keys = await getAllStoredMediaKeys();
    for (const key of keys) {
      try {
        const blob = await getMediaRawBlob(key);
        if (blob && (await isValidVideoBlob(blob))) {
          const cleanId = key.replace(/^\/media\//, '').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '');
          if (cleanId) {
            await fetch('/api/community/video/upload-binary', {
              method: 'POST',
              headers: { 'x-media-id': cleanId, 'Content-Type': blob.type || 'video/mp4' },
              body: blob
            });
          }
          continue;
        }
        const data = await getMediaItem(key);
        if (data && data.startsWith('data:')) {
          await fetch('/api/community/media/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: key, dataUrl: data })
          });
        }
      } catch (err) {}
    }
  } catch (e) {
    console.warn('[MediaStorage] syncAllLocalMediaToServer error:', e);
  }
}


