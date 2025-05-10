import { serialize } from 'cookie';
import { authAdmin, dbAdmin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';

export default async function handler(req, res) {
  const { code } = req.query;
  const idToken = req.cookies['token']; // This is your Firebase Auth ID token

  if (!code || !idToken) {
    return res.status(400).json({ error: 'Missing code or user token' });
  }

  try {
    // Step 1: Verify Firebase user
    const decodedToken = await authAdmin.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Step 2: Exchange code for access token
    const tokenResponse = await fetch('https://www.printful.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.PRINTFUL_CLIENT_ID,
        client_secret: process.env.PRINTFUL_CLIENT_SECRET,
        redirect_url: process.env.PRINTFUL_REDIRECT_URL,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return res.status(500).json({ error: tokenData.error || 'Token exchange failed' });
    }

    const accessToken = tokenData.access_token;

    // Step 3: Get Printful Store ID
    const storeResponse = await fetch('https://api.printful.com/stores', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const storeData = await storeResponse.json();

    if (!storeResponse.ok || !storeData.result?.[0]) {
      console.error('Failed to get store ID:', storeData);
      return res.status(500).json({ error: 'Failed to retrieve store ID' });
    }

    const storeId = storeData.result[0].id;

    // Step 4: Update Firestore user document
    await dbAdmin.collection('users').doc(userId).update({
      printfulConnected: true,
      printfulStoreId: storeId,
      printfulAccessToken: accessToken, // optional: or encrypt/store securely elsewhere
    });

    // Step 5: Set cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', accessToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      }),
      serialize('printful_store_id', String(storeId), {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Callback Error:', error);
    return res.status(500).json({ error: 'Server error during callback' });
  }
}
