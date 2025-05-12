import { serialize } from "cookie";

export default async function handler(req, res) {
  const { code } = req.body;

  // Check if Firebase token exists in cookies
  const firebaseToken = req.cookies.firebase_token;
  if (!firebaseToken) {
    console.error("❌ No Firebase token found");
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!code) {
    console.error("❌ No authorization code provided");
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("❌ Printful token exchange failed:", tokenData);
      throw new Error(tokenData.error || 'Failed to exchange token');
    }

    console.log("✅ Token exchange successful");

    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".sendshop.net" : "localhost"
    };

    // Set both tokens
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
