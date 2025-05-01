import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code." });
  }

  try {
    const response = await fetch("https://www.printful.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        grant_type: "authorization_code",
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_uri: process.env.PRINTFUL_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OAuth Token Error:", data);
      return res.status(500).json({ error: data.error || "OAuth failed." });
    }

    const { access_token, store_id, expires_in } = data;

    // 🔐 Store the token and store ID in cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: expires_in || 3600,
      }),
      serialize('printful_store_id', String(store_id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: expires_in || 3600,
      }),
    ]);

    console.log("✅ OAuth Success:", data);

    return res.redirect('/'); // or redirect to a dashboard
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).json({ error: "Server error during OAuth callback." });
  }
}
