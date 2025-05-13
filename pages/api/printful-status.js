import { parse } from 'cookie';

export default function handler(req, res) {
  const cookies = parse(req.headers.cookie || '');
  res.status(200).json({ connected: !!cookies.printful_token });
}