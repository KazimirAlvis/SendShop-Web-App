// pages/api/store-info.js
import { dbAdmin, authAdmin } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split('Bearer ')[1] 
    : req.cookies.firebase_token; // Note: changed from 'token' to 'firebase_token'

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  let decoded;
  try {
    decoded = await authAdmin.verifyIdToken(token);
    console.log("Decoded UID:", decoded.uid);
  } catch (err) {
    if (err.code === "auth/id-token-expired") {
      console.error("Firebase token has expired. Prompting client to refresh.");
      return res.status(401).json({ 
        error: "Firebase token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    console.error("Error verifying token:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }

  try {
    const docRef = dbAdmin.collection("shops").doc(decoded.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Create a new shop document if it doesn't exist
      await docRef.set({
        storeName: "My Store",
        createdAt: new Date(),
        uid: decoded.uid
      });
      return res.status(200).json({ storeName: "My Store" });
    }

    const data = docSnap.data();
    return res.status(200).json({ 
      storeName: data.storeName || "Unnamed Store",
      storeId: docSnap.id
    });
  } catch (err) {
    console.error("Error fetching store info:", err);
    return res.status(500).json({ error: "Failed to load store info" });
  }
}

// Add API config
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};
