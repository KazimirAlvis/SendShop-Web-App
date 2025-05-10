// pages/api/getUser.js
import { authAdmin } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  const token = req.cookies.token;

  if (!token) {
    console.warn("⚠️ No token cookie found");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log("✅ Verifying token:", token.slice(0, 20) + "...");

    const decoded = await authAdmin.verifyIdToken(token);

    return res.status(200).json({
      uid: decoded.uid,
      email: decoded.email,
      provider: decoded.firebase?.sign_in_provider || "unknown",
    });
  } catch (err) {
    console.error("🔥 Firebase Admin Error:", {
      message: err.message,
      code: err.code,
      name: err.name,
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
