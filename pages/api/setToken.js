import { serialize } from "cookie";

export default function handler(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token missing" });
  }

  res.setHeader(
    "Set-Cookie",
    serialize("firebase_token", token, { // ✅ Updated cookie name to `firebase_token`
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax", // ✅ Ensures cookie is sent with navigation requests
    })
  );

  return res.status(200).json({ success: true });
}
