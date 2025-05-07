// pages/api/products.js
import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.printful_token;

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const limit = 20;
  const offset = parseInt(req.query.offset || '0');

  try {
    const printfulRes = await fetch(`https://api.printful.com/sync/products?offset=${offset}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      console.error("Printful API error:", data);
      return res.status(printfulRes.status).json({ error: data.error || 'Failed to fetch synced products' });
    }

    return res.status(200).json({
      result: data.result,
      paging: data.paging, // Includes total, offset, limit
    });
  } catch (err) {
    console.error("❌ Fetch products failed:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
