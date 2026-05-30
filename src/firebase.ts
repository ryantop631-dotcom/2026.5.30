import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  getDocs,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Error Operation types for diagnostic JSON payload
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

// Check if Firebase config has been initialized with real credentials
export const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "placeholder-api-key" &&
  firebaseConfig.projectId !== "placeholder-project-id";

let db: any = null;
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    // Initialize Firestore with specified database instance as requested in the Firebase integration skill guidelines
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    storage = getStorage(app);
  } catch (err) {
    console.warn("Firebase initialization error:", err);
  }
} else {
  console.info("Firebase is running in standalone local-mock/fallback mode with default values.");
}

export { db, storage };

// Central error handler matching the mandated JSON output schema
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connectivity on initial load as instructed by the "Validate Connection to Firestore" section
export async function testConnection() {
  if (!db) {
    return;
  }
  try {
    await getDocFromServer(doc(db, 'siteContent', 'main'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

// Boot connection check in the background
if (db) {
  testConnection();
}

/**
 * Image upload logic - first tries Firebase Storage SDK, 
 * and falls back gracefully to compressed Base64 Data URL if Storage fails (e.g. CORS/Not provisioned issues)
 */
export function uploadImageToStorage(
  file: File, 
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // Compression helper to convert image to under-the-limit compressed Base64 URL
  const compressFile = (): Promise<string> => {
    return new Promise((resolveCompressed, rejectCompressed) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Downsize automatically if dimension exceeds optimal bento boundaries
          const maxDimension = 800;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolveCompressed(event.target?.result as string);
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          // High-efficiency JPEG compression (0.7) guarantees fits nicely inside 1MB Firestore doc limits
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolveCompressed(dataUrl);
        };
        img.onerror = () => {
          rejectCompressed(new Error("이미지를 읽어올 수 없습니다."));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        rejectCompressed(new Error("파일을 읽는 도중 에러가 발생했습니다."));
      };
      reader.readAsDataURL(file);
    });
  };

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error("이미지 파일 형식만 지원합니다."));
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit for source
    if (file.size > maxSizeBytes) {
      reject(new Error("파일 용량은 10MB 이하여야 합니다."));
      return;
    }

    // If Storage is not ready, fall back directly to compressed base64
    if (!storage) {
      console.info("Firebase Storage not available. Falling back to compressed base64...");
      compressFile().then(resolve).catch(reject);
      return;
    }

    // Try Cloud storage first
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `${folder}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, filePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.warn("Storage upload failed (CORS or config issue). Falling back to optimized Base64...", error);
        if (onProgress) onProgress(100);
        compressFile().then(resolve).catch(reject);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          console.warn("Failed to retrieve image URL. Falling back to optimized Base64...", err);
          compressFile().then(resolve).catch(reject);
        }
      }
    );
  });
}
