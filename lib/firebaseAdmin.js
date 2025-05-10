import admin from "firebase-admin";

console.log("🔥 firebaseAdmin.js is running...");
console.log("🌍 ENV PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("📧 ENV EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔐 PRIVATE KEY present:", !!process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("❌ Missing FIREBASE_PRIVATE_KEY environment variable");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const authAdmin = admin.auth();
const dbAdmin = admin.firestore();

export { authAdmin, dbAdmin };
