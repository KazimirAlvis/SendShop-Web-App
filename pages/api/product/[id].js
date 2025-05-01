// /pages/api/product/[id].js
export default async function handler(req, res) {
  const { id } = req.query;
  const token = req.cookies.printful_token;

  if (!token) {
    return res.status(401).json({ error: "Missing Printful token" });
  }

  try {
    const printfulRes = await fetch(`https://api.printful.com/sync/products/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await printfulRes.json();

    if (!printfulRes.ok) {
      return res.status(printfulRes.status).json({ error: data.error?.message || "Failed to fetch product details" });
    }

    return res.status(200).json({ result: data.result });
  } catch (error) {
    console.error("Product detail fetch error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
