// /pages/api/createOrder.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies.printful_token;
  const storeId = req.cookies.printful_store_id;

  if (!token || !storeId) {
    return res.status(401).json({ error: "Missing Printful token or store ID" });
  }

  const { formData, cartItems } = req.body;

  if (!formData || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Missing form data or cart items" });
  }

  try {
    const response = await fetch("https://api.printful.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        confirm: true,
        recipient: {
          name: formData.name,
          address1: formData.address,
          city: formData.city,
          state_code: formData.state,
          country_code: formData.country,
          zip: formData.zip,
          email: formData.email
        },
        items: cartItems.map(item => ({
          sync_variant_id: item.variantId,
          quantity: item.quantity
        }))
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Printful API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Unknown error" });
    }

    console.log("✅ Order Created:", data);
    return res.status(200).json({ success: true, order: data });
  } catch (error) {
    console.error("Create Order API server error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
