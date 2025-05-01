// /pages/api/products.js
export default async function handler(req, res) {
  const token = req.cookies.printful_token;
  const storeId = req.cookies.printful_store_id;

  if (!token || !storeId) {
    return res.status(401).json({ error: "Missing Printful token or store ID" });
  }

  try {
    const printfulRes = await fetch(`https://api.printful.com/sync/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      return res.status(printfulRes.status).json({ error: data.error?.message || "Failed to fetch products" });
    }

    return res.status(200).json({ result: data.result });
  } catch (error) {
    console.error("Products fetch error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
