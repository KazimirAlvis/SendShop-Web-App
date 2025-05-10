import admin from 'firebase-admin';

console.log("🔥 firebaseAdmin.js is running...");
console.log("🌍 ENV PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);
console.log("📧 ENV EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("🔐 PRIVATE KEY present:", !!process.env.FIREBASE_PRIVATE_KEY);


if (!admin.apps.length) {
  // 🐛 DEBUG LOGGING: Check your env and how it's parsed



  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Export Firebase services
const authAdmin = admin.auth();
const dbAdmin = admin.firestore();

export { authAdmin, dbAdmin };
