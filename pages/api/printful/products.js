// pages/api/printful/products.js
export default async function handler(req, res) {
  const token = req.cookies.printful_token;

  if (!token) {
    return res.status(401).json({ error: "Not connected to Printful" });
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error("Printful API error:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
}
