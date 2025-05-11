import { dbAdmin } from "@/lib/firebaseAdmin";
import { parse } from "cookie";

export default async function handler(req, res) {
  // ✅ Allow POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "No cookie header found" });
  }

  // ✅ Parse the correct token from cookies
  const { printful_token } = parse(cookies);

  if (!printful_token) {
    return res.status(401).json({ error: "No Printful token found in cookie" });
  }

  try {
    // ✅ Fetch products from Printful API
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${printful_token}`,
      },
    });

    // ✅ Handle API errors
    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(`Printful API error: ${error.message || resp.statusText}`);
    }

    const { result } = await resp.json();

    // ✅ Validate API response
    if (!Array.isArray(result)) {
      throw new Error("Unexpected API result");
    }

    // ✅ Write products to Firestore
    const batch = dbAdmin.batch();
    const syncedProductIds = [];

    for (const item of result) {
      if (!item.id) {
        console.warn("Skipping item with missing ID:", item);
        continue;
      }

      const ref = dbAdmin.collection("products").doc(item.id.toString());
      batch.set(ref, {
        ...item,
        syncedAt: new Date().toISOString(),
      });
      syncedProductIds.push(item.id);
    }

    await batch.commit();

    // ✅ Return success response
    return res.status(200).json({
      count: syncedProductIds.length,
      syncedProductIds,
      message: "Products synced successfully",
    });
  } catch (err) {
    console.error("❌ Sync failed:", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}
