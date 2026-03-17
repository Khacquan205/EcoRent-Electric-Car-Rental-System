import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "rentalcar-28d86.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "rentalcar-28d86",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "rentalcar-28d86.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "287902982316",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:287902982316:web:f8819662f43c841a993f09",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-VDSR7RML1K",
};

let analytics: Analytics | null = null;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;

  if (auth) return auth;
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0] as FirebaseApp;
  } else if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
  if (app) auth = getAuth(app);
  return auth;
}

/** Firebase Analytics - chỉ chạy trên browser */
export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === "undefined") return null;
  const fbApp = getFirebaseAuth() ? getApps()[0] : null;
  if (!fbApp) return null;
  if (!analytics) analytics = getAnalytics(fbApp);
  return analytics;
}
