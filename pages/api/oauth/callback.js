import { serialize } from "cookie";
import { exchangeCodeForToken, getStoreInfo } from "@/lib/printful";
import { db } from "@/lib/firebaseAdmin";
import { doc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    // Step 1: Exchange the code for an access token
    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;

    // Step 2: Get the store info using the access token
    const storeData = await getStoreInfo(accessToken);
    const store = storeData.result[0];
    const storeId = store.id;

    // Step 3: (Optional) Store Printful store info in Firebase
    const storeRef = doc(db, "printfulStores", storeId.toString());
    await setDoc(storeRef, {
      name: store.name,
      type: store.type,
      created: new Date(),
    }, { merge: true });

    // Step 4: Set cookies
    res.setHeader("Set-Cookie", [
      serialize("printful_token", accessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      }),
      serialize("printful_store_id", String(storeId), {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      }),
    ]);

    // Step 5: Redirect or return success
    const accept = req.headers.accept || "";
    if (accept.includes("text/html")) {
      res.writeHead(302, { Location: "/dashboard/products" });
      res.end();
    } else {
      res.status(200).json({ success: true });
    }
  } catch (err) {
    console.error("OAuth callback failed:", err);
    return res.status(500).json({ error: "Failed to authenticate with Printful" });
  }
}
