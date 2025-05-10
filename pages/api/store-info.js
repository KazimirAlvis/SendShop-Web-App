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
    const docRef = dbAdmin.collection("shops").doc(decoded.uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const data = docSnap.data();
    return res.status(200).json({ storeName: data.storeName || "Unnamed Store" });
  } catch (err) {
    console.error("Error fetching store info:", err);
    return res.status(500).json({ error: "Failed to load store info" });
  }
}
