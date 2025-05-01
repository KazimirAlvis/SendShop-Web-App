// /pages/api/oauth/handleToken.js

import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const response = await fetch('https://www.printful.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_uri: process.env.PRINTFUL_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ OAuth token error:', data);
      return res.status(500).json({ error: data.error || 'OAuth token exchange failed' });
    }

    // ✅ Store the access token in a secure cookie (temp solution)
    res.setHeader('Set-Cookie', serialize('printful_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: data.expires_in || 3600,
    }));

    console.log('✅ OAuth token received and stored');
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('OAuth handleToken server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
