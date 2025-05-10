import { serialize } from 'cookie';
import { getAccessToken } from '@/lib/printful'; // your helper

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code from Printful' });
  }

  try {
    const { access_token, store } = await getAccessToken(code);

    // Store token and store ID in cookies
    res.setHeader('Set-Cookie', [
      serialize('printful_token', access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      }),
      serialize('printful_store_id', store.id.toString(), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      }),
    ]);

    res.redirect('/dashboard/products'); // 👈 bring them to products page
  } catch (err) {
    console.error('Printful OAuth Error:', err);
    res.status(500).json({ error: 'Failed to authenticate with Printful' });
  }
}
