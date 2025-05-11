import { authAdmin } from "@/lib/firebaseAdmin";
import { parse } from "cookie";

export default async function handler(req, res) {
  try {
    const cookies = req.headers.cookie;
    console.log("Received cookies:", cookies);

    const { firebase_token } = parse(cookies);
    console.log("Parsed firebase_token:", firebase_token);

    if (!firebase_token) {
      return res.status(401).json({ error: "No Firebase token found in cookie" });
    }

    const decodedToken = await authAdmin.verifyIdToken(firebase_token);
    console.log("Decoded Firebase token:", decodedToken);

    return res.status(200).json({ uid: decodedToken.uid });
  } catch (err) {
    console.error("Error in /api/getUser:", err);
    return res.status(401).json({ error: "Invalid Firebase token" });
  }
}
