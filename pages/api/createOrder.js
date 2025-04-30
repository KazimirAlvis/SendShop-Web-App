// /pages/api/createOrder.js
console.log("🔥 API /api/createOrder HIT");

export default async function handler(req, res) {
  console.log("🔥 createOrder API hit"); // <----- ADD THIS
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { formData, cartItems } = req.body;
  
    if (!formData || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Missing form data or cart items" });
    }
  
    try {
      const printfulResponse = await fetch("https://api.printful.com/orders", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PRINTFUL_API_KEY}`, 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: true, // ✅ This submits the order instead of saving as draft
          recipient: {
            name: formData.name,
            address1: formData.address,
            city: formData.city,
            state_code: formData.state,
            country_code: formData.country,
            zip: formData.zip,
            email: formData.email,
          },
          items: cartItems.map(item => ({
            sync_variant_id: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
  
      const data = await printfulResponse.json();
  
      if (!printfulResponse.ok) {
        console.error("Printful API error:", data);
        return res.status(printfulResponse.status).json({ error: data.error?.message || "Unknown error" });
      }
  
      console.log("✅ Order Created:", data); // 🔥 Add this to see the success in terminal
  
      return res.status(200).json({ success: true, order: data });
    } catch (error) {
      console.error("Create Order API server error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
  