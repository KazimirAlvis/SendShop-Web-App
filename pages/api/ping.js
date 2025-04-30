// pages/api/ping.js
export default function handler(req, res) {
    console.log("✅ /api/ping hit!");
    res.status(200).json({ message: "pong" });
  }
  