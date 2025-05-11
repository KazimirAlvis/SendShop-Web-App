import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin"; // Ensure authAdmin is imported
import { parse } from "cookie";
import { getAuth } from "firebase/auth";

console.log("authAdmin initialized:", !!authAdmin);
console.log("dbAdmin initialized:", !!dbAdmin);

const auth = getAuth();
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const token = await user.getIdToken();
    document.cookie = `firebase_token=${token}; path=/;`;
  }
});

export default async function handler(req, res) {
  console.log("Request method:", req.method); // Debug log

  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method); // Debug log
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const cookies = req.headers.cookie;
  console.log("Received cookies:", cookies);

  if (!cookies) {
    return res.status(401).json({ error: "No cookie header found" });
  }

  // ✅ Parse the correct tokens from cookies
  const { printful_token, firebase_token } = parse(cookies);
  console.log("Parsed tokens:", { printful_token, firebase_token });

  if (!printful_token) {
    return res.status(401).json({ error: "No Printful token found in cookie" });
  }

  if (!firebase_token) {
    return res.status(401).json({ error: "No Firebase token found in cookie" });
  }

  let uid; // Declare uid in the outer scope

  try {
    const decodedToken = await authAdmin.verifyIdToken(firebase_token);
    console.log("Decoded Firebase token:", decodedToken);
    uid = decodedToken.uid; // Assign uid here
    console.log("Decoded UID:", uid);
  } catch (err) {
    console.error("Failed to verify Firebase token:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }

  if (!uid) {
    return res.status(401).json({ error: "User ID is not available" });
  }

  try {
    // ✅ Fetch products from Printful API
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

      const { result } = await resp.json();
      console.log("Printful API result:", result);

      if (!Array.isArray(result)) {
        throw new Error("Unexpected API result");
      }
    } catch (err) {
      console.error("❌ Sync failed:", err);
      return res.status(500).json({ error: "Sync failed", details: err.message });
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
        sellerId: uid, // Use the verified UID
      });
      syncedProductIds.push(item.id);
    }

    await batch.commit();
    console.log("Products synced successfully:", syncedProductIds);

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

