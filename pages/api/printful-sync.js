import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { parse } from "cookie";

export default async function handler(req, res) {
  console.log("Starting Printful sync process...");

  // Validate request method
  if (req.method !== "POST") {
    console.error("Method not allowed:", req.method);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Get tokens from both cookies and Authorization header
  const authHeader = req.headers.authorization;
  const cookies = req.headers.cookie;
  
  if (!cookies && !authHeader) {
    return res.status(401).json({ error: "No authentication credentials found" });
  }

  // Parse tokens from different sources
  const parsedCookies = cookies ? parse(cookies) : {};
  const firebase_token = authHeader?.startsWith('Bearer ') 
    ? authHeader.split('Bearer ')[1] 
    : parsedCookies.firebase_token;
  const printful_token = parsedCookies.printful_token;

  if (!firebase_token) {
    return res.status(401).json({ error: "No Firebase token found" });
  }

  if (!printful_token) {
    return res.status(401).json({ error: "No Printful token found" });
  }

  // Verify Firebase token and extract UID
  let uid;
  try {
    const decodedToken = await authAdmin.verifyIdToken(firebase_token);
    uid = decodedToken.uid;
    console.log("Authenticated user:", decodedToken.email);
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    return res.status(401).json({ 
      error: "Invalid Firebase token",
      code: err.code === "auth/id-token-expired" ? "TOKEN_EXPIRED" : "INVALID_TOKEN"
    });
  }

  // Fetch products from Printful API
  let result;
  try {
    const resp = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${printful_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resp.ok) {
      const error = await resp.json();
      throw new Error(error.message || `HTTP ${resp.status}: ${resp.statusText}`);
    }

    const data = await resp.json();
    result = data.result;

    if (!Array.isArray(result)) {
      throw new Error("Invalid response format from Printful API");
    }
  } catch (err) {
    console.error("Printful API error:", err);
    return res.status(500).json({ 
      error: "Failed to fetch products from Printful",
      details: err.message 
    });
  }

  // Prepare Firestore batch operations
  const batch = dbAdmin.batch();
  const syncedProducts = [];

  for (const product of result) {
    if (!product.id) continue;

    // Calculate product price
    const price = product.variants?.[0]?.retail_price || 0;

    // Create product document reference
    const productRef = dbAdmin.collection("products").doc(product.id.toString());

    // Prepare product data
    const productData = {
      name: product.name || "Untitled Product",
      price: parseFloat(price),
      description: product.description || "",
      thumbnail_url: product.thumbnail_url || "",
      external_id: product.external_id || "",
      variantCount: product.variants?.length || 0,
      syncedAt: new Date().toISOString(),
      sellerId: uid,
      updatedAt: new Date().toISOString()
    };

    // Add to batch
    batch.set(productRef, productData, { merge: true });
    syncedProducts.push({
      id: product.id,
      name: product.name
    });
  }

  // Update shop document with sync information
  const shopRef = dbAdmin.collection("shops").doc(uid);
  batch.set(shopRef, {
    lastSyncAt: new Date().toISOString(),
    productCount: syncedProducts.length,
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // Commit all changes
  try {
    await batch.commit();
    console.log(`Successfully synced ${syncedProducts.length} products`);

    return res.status(200).json({
      success: true,
      message: "Products synced successfully",
      count: syncedProducts.length,
      products: syncedProducts
    });
  } catch (err) {
    console.error("Firestore batch commit failed:", err);
    return res.status(500).json({
      error: "Failed to save products",
      details: err.message
    });
  }
}

// Add API config
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};