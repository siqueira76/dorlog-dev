// Firebase configuration for server-side use (Node.js)
// Client-side configuration is in client/src/lib/firebase.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID || ""}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID || "",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;