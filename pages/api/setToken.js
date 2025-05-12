import { serialize } from "cookie";

export default async function handler(req, res) {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    // Exchange the authorization code for Printful access token
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
      throw new Error('Failed to exchange token with Printful');
    }

    const { access_token, store_id } = await tokenResponse.json();

    // Set both cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', access_token, {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      }),
      serialize('printful_store_id', store_id.toString(), {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: "lax",
      })
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ error: error.message });
  }
}
