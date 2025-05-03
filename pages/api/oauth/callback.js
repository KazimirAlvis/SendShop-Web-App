// pages/api/oauth/callback.js
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  console.log("Received authorization code:", code);

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.printful.com/oauth/token', {
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
    console.log("Token response:", tokenData);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return res.status(tokenResponse.status).json({ 
        error: tokenData.error || 'Failed to exchange code for token' 
      });
    }

    // Get store ID from Printful
    const storeResponse = await fetch('https://api.printful.com/stores', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const storeData = await storeResponse.json();
    console.log("Store data:", storeData);
    
    if (!storeResponse.ok || !storeData.result || storeData.result.length === 0) {
      console.error('Failed to get store ID:', storeData);
      return res.status(storeResponse.status).json({ 
        error: 'Failed to get store ID from Printful' 
      });
    }

    const storeId = storeData.result[0].id;

    // Set cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', tokenData.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: tokenData.expires_in,
        sameSite: 'strict',
        path: '/',
      }),
      serialize('printful_store_id', storeId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: tokenData.expires_in,
        sameSite: 'strict',
        path: '/',
      }),
    ]);

    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}