import { serialize } from 'cookie';

export default async function handler(req, res) {
  const { code } = req.query;

  // Exchange code for access token
  const tokenResponse = await fetch('https://www.printful.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.PRINTFUL_CLIENT_ID,
      client_secret: process.env.PRINTFUL_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Retrieve store ID
  const storeResponse = await fetch('https://api.printful.com/stores', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const storeData = await storeResponse.json();
  const storeId = storeData.result[0]?.id;

  // Set cookies
  res.setHeader('Set-Cookie', [
    serialize('printful_token', accessToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    }),
    serialize('printful_store_id', storeId, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    }),
  ]);
  

  res.redirect('/');
}
