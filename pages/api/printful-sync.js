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

      // ✅ Calculate price based on shirt size (variants)
      let price = 0;
      if (item.variants && Array.isArray(item.variants)) {
        // Example: Use the price of the first variant as the base price
        const firstVariant = item.variants[0];
        price = firstVariant.retail_price || 0; // Adjust this logic as needed
      }

      // ✅ Map Printful API fields to Firestore fields
      const ref = dbAdmin.collection("products").doc(item.id.toString());
      batch.set(ref, {
        name: item.name || "Untitled Product", // Use `name` or fallback
        price, // Calculated price based on variants
        description: item.description || "No description available", // Map `description`
        thumbnail_url: item.thumbnail_url || "", // Map `thumbnail_url`
        external_id: item.external_id || "", // Include `external_id`
        synced: item.variants ? item.variants.length : 0, // Count of variants
        syncedAt: new Date().toISOString(), // Timestamp for sync
        sellerId: uid, // Ensure `sellerId` is set correctly
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
