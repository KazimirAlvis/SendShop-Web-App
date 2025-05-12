import { serialize } from "cookie";

export default async function handler(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    console.log("🔄 Exchanging authorization code for Printful token...");
    const tokenResponse = await fetch('https://api.printful.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_uri: process.env.PRINTFUL_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("❌ Printful token exchange failed:", errorData);
      throw new Error(`Failed to exchange token with Printful: ${errorData.error || 'Unknown error'}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Token exchange successful");

    // Set cookies with domain attribute
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".sendshop.net" : "localhost"
    };

    res.setHeader('Set-Cookie', [
      serialize('printful_token', tokenData.access_token, cookieOptions),
      serialize('printful_store_id', tokenData.store_id.toString(), cookieOptions)
    ]);

    // Verify cookies were set
    console.log("🍪 Cookies set with options:", cookieOptions);

    return res.status(200).json({ 
      success: true,
      message: "Tokens set successfully"
    });
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: "Check server logs for more information"
    });
  }
}
