import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code." });
  }

  // Step 1: Exchange code for access token
  const tokenResponse = await fetch('https://www.printful.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.PRINTFUL_CLIENT_ID,
      client_secret: process.env.PRINTFUL_CLIENT_SECRET,
      code,
      redirect_uri: process.env.PRINTFUL_REDIRECT_URI, // ✅ REQUIRED!
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("❌ Token Error:", tokenData);
    return res.status(500).json({ error: tokenData.error || 'OAuth token error' });
  }

  const accessToken = tokenData.access_token;

  // Step 2: Retrieve store ID
  const storeResponse = await fetch('https://api.printful.com/stores', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const storeData = await storeResponse.json();

  if (!storeResponse.ok || !storeData.result?.[0]) {
    console.error("❌ Store ID Error:", storeData);
    return res.status(500).json({ error: 'Unable to retrieve store ID' });
  }

  const storeId = storeData.result[0].id;

  // Step 3: Set access_token and store_id in cookies
  res.setHeader('Set-Cookie', [
    serialize('printful_token', accessToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    }),
    serialize('printful_store_id', storeId.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    }),
  ]);

  console.log("✅ OAuth complete. Token + Store ID set.");

  // Step 4: Redirect
  res.redirect('/');
}
