import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    console.log("❌ No authorization code provided");
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    console.log("🔄 Starting Printful token exchange with code:", code);
    
    // Log request payload
    const payload = {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.PRINTFUL_CLIENT_ID,
      client_secret: process.env.PRINTFUL_CLIENT_SECRET,
      redirect_uri: process.env.PRINTFUL_REDIRECT_URI
    };
    console.log("📤 Request payload:", payload);

    const tokenResponse = await fetch('https://api.printful.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await tokenResponse.json();
    console.log("📥 Printful response:", {
      status: tokenResponse.status,
      ok: tokenResponse.ok,
      data: data
    });

    if (!tokenResponse.ok) {
      throw new Error(data.error || 'Failed to exchange token');
    }

    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    };

    // Convert cookies to array before setting
    const cookies = [
      serialize('printful_token', data.access_token, cookieOptions),
      serialize('printful_store_id', data.store_id.toString(), cookieOptions)
    ];

    console.log("🍪 Setting cookies with options:", cookieOptions);
    res.setHeader('Set-Cookie', cookies);

    // Log response headers for debugging
    console.log("📤 Response headers:", res.getHeaders());

    return res.status(200).json({ 
      success: true,
      store_id: data.store_id,
      cookies_set: cookies.length
    });
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return res.status(500).json({ 
      error: error.message,
      details: "Failed to exchange Printful authorization code"
    });
  }
}
