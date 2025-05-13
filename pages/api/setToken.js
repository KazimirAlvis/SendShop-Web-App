import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    console.log("Exchanging code for Printful token...");
    const tokenResponse = await fetch('https://api.printful.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_uri: process.env.PRINTFUL_REDIRECT_URI
      })
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Printful token exchange failed:", data);
      throw new Error(data.error || 'Failed to exchange token');
    }

    // Set multiple cookies for different token aspects
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };

    res.setHeader('Set-Cookie', [
      // Main access token
      serialize('printful_token', data.access_token, cookieOptions),
      // Store ID for API calls
      serialize('printful_store_id', data.store_id.toString(), cookieOptions),
      // Refresh token for getting new access tokens
      serialize('printful_refresh_token', data.refresh_token, {
        ...cookieOptions,
        httpOnly: true // Keep refresh token secure
      })
    ]);

    console.log("Successfully set Printful tokens");
    return res.status(200).json({ 
      success: true,
      store_id: data.store_id
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: "Failed to exchange Printful authorization code"
    });
  }
}
