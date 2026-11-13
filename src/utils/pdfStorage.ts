// IndexedDB Storage for User-Uploaded PDF Books
const DB_NAME = 'selfx_user_pdf_vault_v1';
const STORE_NAME = 'uploaded_pdfs';
const DB_VERSION = 1;

export interface UploadedPdfItem {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  fileBlob: Blob;
  fileSize: number;
  uploadedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedPdf(
  title: string,
  subject: string,
  file: File
): Promise<UploadedPdfItem> {
  const db = await openDB();
  const item: UploadedPdfItem = {
    id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim() || file.name.replace(/\.[^/.]+$/, ""),
    subject: subject || 'General',
    fileName: file.name,
    fileBlob: file,
    fileSize: file.size,
    uploadedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllUploadedPdfs(): Promise<UploadedPdfItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get uploaded PDFs from IndexedDB:', err);
    return [];
  }
}

export async function deleteUploadedPdf(id: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete PDF from IndexedDB:', err);
    return false;
  }
}
