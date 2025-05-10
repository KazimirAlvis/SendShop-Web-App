// pages/api/getUser.js
import { authAdmin } from "../../lib/firebaseAdmin";

export default async function handler(req, res) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = await authAdmin.verifyIdToken(token);
    return res.status(200).json({ uid: decoded.uid });
  } catch (err) {
    console.error("🔥 Firebase Admin Error:", {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
    });

    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired. Please refresh the token.",
        code: "token-expired",
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      code: err.code || "unknown",
      message: err.message,
    });
  }
}
