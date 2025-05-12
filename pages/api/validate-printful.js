import { parse } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookies = parse(req.headers.cookie || '');
  const printfulToken = cookies.printful_token;

  if (!printfulToken) {
    return res.status(401).json({ error: 'No Printful token found' });
  }

  try {
    const response = await fetch('https://api.printful.com/store', {
      headers: {
        'Authorization': `Bearer ${printfulToken}`,
      }
    });

    if (!response.ok) {
      throw new Error('Invalid Printful token');
    }

    const data = await response.json();
    return res.status(200).json({ 
      valid: true, 
      storeId: data.result.id 
    });
  } catch (error) {
    console.error('Printful validation error:', error);
    return res.status(401).json({ error: 'Invalid Printful token' });
  }
}