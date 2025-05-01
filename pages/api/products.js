import { parse } from 'cookie';

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  const token = cookies.printful_token;
  const storeId = cookies.printful_store_id;

  if (!token || !storeId) {
    return res.status(401).json({ error: "Missing access token" });
  }

  const response = await fetch(`https://api.printful.com/stores/${storeId}/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  res.status(200).json(data);
}
