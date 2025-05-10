import { serialize } from 'cookie';
import { exchangeCodeForToken, getStoreDetails } from '@/lib/printful';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code from Printful' });
  }

  try {
    // 🔄 Exchange OAuth code for access token
    const tokenRes = await exchangeCodeForToken(code);
    const access_token = tokenRes.access_token;

    // 🏪 Get store info from Printful
    const storeRes = await getStoreDetails(access_token);
    const store = storeRes.result;

    if (!store || !store.id) {
      throw new Error("Missing store ID from Printful response");
    }

    // 🍪 Set auth token + store ID as cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
      serialize('printful_store_id', store.id.toString(), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      }),
    ]);

    // ✅ Redirect to dashboard/products
    res.redirect('/dashboard/products');
  } catch (err) {
    console.error('Printful OAuth Error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Printful' });
  }
}
