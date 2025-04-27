export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.printful.com/store/products', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer qaB5KQwd3OOWZ3Wm4wgViPDnNs1ZGD442psrXWj6'
      }
    });

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}
