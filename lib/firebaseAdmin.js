import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

console.log("🔥 firebaseAdmin.js is running...");
console.log("🌍 ENV PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("📧 ENV EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔐 PRIVATE KEY present:", !!process.env.FIREBASE_PRIVATE_KEY);

if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ Missing FIREBASE_PRIVATE_KEY environment variable");
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

export const authAdmin = getAuth();
export const dbAdmin = getFirestore();
