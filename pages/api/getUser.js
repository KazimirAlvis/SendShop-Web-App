import { authAdmin } from "@/lib/firebaseAdmin";
import { parse } from "cookie";

export default async function handler(req, res) {
  // Check request method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = req.headers.cookie;
    console.log("Received cookies:", cookies);

    if (!cookies) {
      return res.status(401).json({ error: "No cookies found" });
    }

    let parsedCookies;
    try {
      parsedCookies = parse(cookies);
    } catch (parseError) {
      console.error("Cookie parsing error:", parseError);
      return res.status(400).json({ error: "Invalid cookie format" });
    }

    const { firebase_token } = parsedCookies;
    console.log("Parsed firebase_token:", firebase_token);

    if (!firebase_token) {
      return res.status(401).json({ error: "No Firebase token found in cookie" });
    }

    const decodedToken = await authAdmin.verifyIdToken(firebase_token);
    console.log("Decoded Firebase token:", decodedToken);

    return res.status(200).json({ 
      uid: decodedToken.uid,
      email: decodedToken.email 
    });
  } catch (err) {
    console.error("Error in /api/getUser:", err);
    
    // More specific error messages
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Firebase token expired" });
    }
    
    return res.status(401).json({ error: "Invalid Firebase token" });
  }
}
