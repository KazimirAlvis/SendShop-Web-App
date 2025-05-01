import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.printful_token;
  const storeId = cookies.printful_store_id;

  if (!token) {
    return res.status(401).json({ error: "Missing access token" });
  }

  if (!storeId) {
    return res.status(401).json({ error: "Missing store ID" });
  }

  try {
    const printfulRes = await fetch(`https://api.printful.com/stores/${storeId}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      console.error("Printful API error:", data);
      return res.status(printfulRes.status).json({ error: data.error || 'Failed to fetch products from Printful' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("❌ Fetch products failed:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
