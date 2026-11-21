import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = import.meta.env;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
export const firebaseSetupMessage = "Firebase is not configured yet. Copy .env.example to .env.local and add the NCC Dunstable Firebase project values.";
const app = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : undefined;
export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;
export const storage = app ? getStorage(app) : undefined;
