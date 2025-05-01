// /pages/api/products.js

export default async function handler(req, res) {
  const token = req.cookies.printful_token; // Grab token from cookie

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  try {
    const printfulRes = await fetch("https://api.printful.com/sync/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      console.error("🛑 Printful API Error:", data);
      return res.status(printfulRes.status).json({ error: data.error?.message || "Unknown error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("🔥 Server Error:", err);
    return res.status(500).json({ error: "Server error while fetching products" });
  }
}
