export default async function handler(req, res) {
  const { id } = req.query;

  try {
    const response = await fetch(`https://api.printful.com/store/products/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Printful API error:', errorData);
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
