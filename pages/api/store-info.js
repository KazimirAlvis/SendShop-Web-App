// pages/api/store-info.js
import { dbAdmin, authAdmin } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = await authAdmin.verifyIdToken(token);
    console.log("Decoded UID:", decoded.uid);
  } catch (err) {
    if (err.code === "auth/id-token-expired") {
      console.error("Firebase token has expired. Prompting client to refresh.");
      return res.status(401).json({ error: "Firebase token expired. Please refresh and try again." });
    }
    console.error("Error verifying token:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }

  try {
    const docRef = dbAdmin.collection("shops").doc(decoded.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.error("Shop not found for UID:", decoded.uid);
      return res.status(404).json({ error: "Shop not found" });
    }

    const data = docSnap.data();
    return res.status(200).json({ storeName: data.storeName || "Unnamed Store" });
  } catch (err) {
    console.error("Error fetching store info:", err);
    return res.status(500).json({ error: "Failed to load store info" });
  }
}
