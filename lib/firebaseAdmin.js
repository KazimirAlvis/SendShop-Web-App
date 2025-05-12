import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

console.log("🔥 firebaseAdmin.js is running...");

// ✅ Validate required environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("❌ Missing FIREBASE_PROJECT_ID environment variable");
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
  throw new Error("❌ Missing FIREBASE_CLIENT_EMAIL environment variable");
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("❌ Missing FIREBASE_PRIVATE_KEY environment variable");
}

// ✅ Log environment variable presence (but not sensitive values)
console.log("🌍 ENV PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("📧 ENV EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔐 PRIVATE KEY present:", !!process.env.FIREBASE_PRIVATE_KEY);

if (!getApps().length) {
  try {
    // ✅ Initialize Firebase Admin SDK
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (err) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", err);
    throw new Error("Failed to initialize Firebase Admin SDK. Check your environment variables.");
  }
} else {
  console.log("✅ Firebase Admin already initialized");
}

// ✅ Export Firebase Admin services
export const authAdmin = getAuth(); // For authentication (e.g., verifying tokens)
export const dbAdmin = getFirestore(); // For Firestore database operations
