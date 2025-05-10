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
    console.error("Auth error:", err.code || err.message);

    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired. Please refresh the token.",
        code: "token-expired",
      });
    }

    return res.status(401).json({
      error: "Invalid token",
      code: err.code || "invalid-token",
    });
  }
}
