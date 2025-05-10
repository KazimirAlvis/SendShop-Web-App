import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { parse } from "cookie"; // ✅ Fix this: use named import from cookie

export default async function handler(req, res) {
  // ✅ Allow POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "No cookie header found" });
  }

  const { token } = parse(cookies);

  if (!token) {
    return res.status(401).json({ error: "No token found in cookie" });
  }

  let uid;
  try {
    const decoded = await authAdmin.verifyIdToken(token);
    uid = decoded.uid;
  } catch (err) {
    console.error("❌ Firebase token error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    const { result } = await resp.json();

    if (!Array.isArray(result)) {
      throw new Error("Unexpected API result");
    }

    const batch = dbAdmin.batch();
    for (const item of result) {
      const ref = dbAdmin.collection("products").doc(item.id.toString());
      batch.set(ref, {
        ...item,
        sellerId: uid, // Link products to logged-in user
        syncedAt: new Date().toISOString(),
      });
    }

    await batch.commit();

    return res.status(200).json({ count: result.length });
  } catch (err) {
    console.error("❌ Sync failed:", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}
