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
 * Image upload logic using Firebase Storage SDK
 * Avoids direct REST API endpoints to bypass CORS hurdles and maintains safety.
 */
export function uploadImageToStorage(
  file: File, 
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error("Firebase Storage is not initialized or configured."));
      return;
    }

    // Restrict files that are too large (e.g., > 10MB) or not images as requested in instructions
    if (!file.type.startsWith('image/')) {
      reject(new Error("Only image files are allowed."));
      return;
    }
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      reject(new Error("File size must be less than 10MB."));
      return;
    }

    // Create a unique file name
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
        console.error("Storage upload failed:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
