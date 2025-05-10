export default function handler(req, res) {
    res.setHeader('Set-Cookie', [
      'token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'printful_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'printful_store_id=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    ]);
    res.status(200).json({ success: true });
  }
  