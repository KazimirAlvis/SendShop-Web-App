import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  // Only accept requests with Printful authorization code
  if (!code) {
    console.log("❌ No Printful authorization code provided");
    return res.status(400).json({ error: 'Missing Printful authorization code' });
  }

  try {
    console.log("🔄 Starting Printful token exchange with code:", code);
    
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

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(error.error || 'Failed to exchange Printful token');
    }

    const data = await tokenResponse.json();
    
    // Set Printful cookies
    res.setHeader('Set-Cookie', [
      serialize('token', data.access_token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: false,
        sameSite: 'lax'
      })
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Printful token exchange error:', error);
    return res.status(500).json({ error: error.message });
  }
}
