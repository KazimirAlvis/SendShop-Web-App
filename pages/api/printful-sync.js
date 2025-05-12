import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin"; // Firebase Admin SDK
import { parse } from "cookie";

export default async function handler(req, res) {
  console.log("Request method:", req.method);

  // ✅ Ensure the request method is POST
  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ✅ Parse cookies from the request
  const cookies = req.headers.cookie;
  if (!cookies) {
    return res.status(401).json({ error: "No cookie header found" });
  }

  const { firebase_token, printful_token } = parse(cookies);
  console.log("Parsed tokens:", { firebase_token, printful_token });

  if (!firebase_token) {
    return res.status(401).json({ error: "No Firebase token found in cookie" });
  }

  if (!printful_token) {
    return res.status(401).json({ error: "No Printful token found in cookie" });
  }

  // ✅ Verify Firebase token and extract UID
  let uid;
  try {
    const decodedToken = await authAdmin.verifyIdToken(firebase_token);
    console.log("Decoded Firebase token:", decodedToken);
    uid = decodedToken.uid;
    console.log("Decoded UID:", uid);
  } catch (err) {
    console.error("Failed to verify Firebase token:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }

  if (!uid) {
    console.error("UID is not available after decoding the token.");
    return res.status(401).json({ error: "User ID is not available" });
  }

  // ✅ Fetch products from Printful API
  let result;
  try {
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${printful_token}`,
      },
    });

    console.log("Printful API response status:", resp.status);

    if (!resp.ok) {
      const error = await resp.json();
      console.error("Printful API error:", error);
      throw new Error(`Printful API error: ${error.message || resp.statusText}`);
    }

    const data = await resp.json();
    result = data.result;
    console.log("Printful API result:", result);

    if (!Array.isArray(result)) {
      throw new Error("Unexpected API result");
    }
  } catch (err) {
    console.error("❌ Failed to fetch products from Printful API:", err);
    return res.status(500).json({ error: "Failed to fetch products from Printful API", details: err.message });
  }

  // ✅ Write products to Firestore
  const batch = dbAdmin.batch();
  const syncedProductIds = [];

  for (const item of result) {
    if (!item.id) {
      console.warn("Skipping item with missing ID:", item);
      continue;
    }

    // Calculate price based on variants
    let price = 0;
    if (item.variants && Array.isArray(item.variants)) {
      const firstVariant = item.variants[0];
      price = firstVariant.retail_price || 0;
    }

    // Map Printful API fields to Firestore fields
    const ref = dbAdmin.collection("products").doc(item.id.toString());
    console.log("Writing product to Firestore with UID:", uid);
    batch.set(ref, {
      name: item.name || "Untitled Product",
      price,
      description: item.description || "No description available",
      thumbnail_url: item.thumbnail_url || "",
      external_id: item.external_id || "",
      synced: item.variants ? item.variants.length : 0,
      syncedAt: new Date().toISOString(),
      sellerId: uid,
    });
    syncedProductIds.push(item.id);
  }

  try {
    await batch.commit();
    console.log("Products synced successfully:", syncedProductIds);
  } catch (err) {
    console.error("Error writing to Firestore:", err);
    return res.status(500).json({ error: "Failed to write to Firestore", details: err.message });
  }

  // ✅ Return success response
  return res.status(200).json({
    count: syncedProductIds.length,
    syncedProductIds,
    message: "Products synced successfully",
  });
}