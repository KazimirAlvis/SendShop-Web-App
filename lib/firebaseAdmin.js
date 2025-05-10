import admin from 'firebase-admin';

if (!admin.apps.length) {
  // 🐛 DEBUG LOGGING: Check your env and how it's parsed
  //console.log('[DEBUG] privateKey ENV:', process.env.FIREBASE_PRIVATE_KEY);
  //console.log('[DEBUG] privateKey parsed:\n', process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'));

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
