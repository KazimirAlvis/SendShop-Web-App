// pages/api/printful/callback.js
export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
    // Exchange code for token
    const response = await fetch("https://www.printful.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_url: process.env.PRINTFUL_REDIRECT_URL,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!data.access_token) {
      console.error("Printful token exchange failed:", data);
      return res.status(500).send("Token exchange failed");
    }

    // Optionally store the token in a cookie
    res.setHeader("Set-Cookie", [
      `printful_token=${data.access_token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    ]);

    // Redirect to dashboard after successful connection
    return res.redirect("/dashboard/products");
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).send("Callback error");
  }
}
