// pages/api/printful-sync.js
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { doc, setDoc } from "firebase/firestore";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import cookie from "cookie";

export default async function handler(req, res) {
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

    for (const item of result) {
      await setDoc(doc(dbAdmin, "products", item.id.toString()), {
        ...item,
        owner: uid,
        syncedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({ count: result.length });
  } catch (err) {
    console.error("Sync failed", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}
