export default async function handler(req, res) {
  const { printful_token, printful_store_id } = req.cookies;

  const response = await fetch(`https://api.printful.com/stores/${printful_store_id}/products`, {
    headers: {
      Authorization: `Bearer ${printful_token}`,
    },
  });

  const data = await response.json();
  res.status(200).json(data);
}
