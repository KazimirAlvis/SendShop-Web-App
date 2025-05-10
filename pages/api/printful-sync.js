// pages/api/printful-sync.js
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import cookie from "cookie";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse auth token from cookies
  const { token } = cookie.parse(req.headers.cookie || "");

  if (!token) {
    return res.status(401).json({ error: "No token found" });
  }

  let uid;
  try {
    const decoded = await authAdmin.verifyIdToken(token);
    uid = decoded.uid;
  } catch (err) {
    console.error("Token error", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const { result } = await resp.json();

    if (!result || !Array.isArray(result)) {
      throw new Error("Unexpected API result");
    }

    const batch = dbAdmin.batch();

    for (const item of result) {
      const ref = dbAdmin.collection("products").doc(item.id.toString());
      batch.set(ref, {
        ...item,
        sellerId: uid, // 🔄 Changed from `owner` to `sellerId` to match frontend
        syncedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    return res.status(200).json({ count: result.length });
  } catch (err) {
    console.error("Sync failed", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}
