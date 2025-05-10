// pages/api/printful/connect.js
export default async function handler(req, res) {
  const redirectUrl = `https://www.printful.com/oauth/authorize?client_id=${process.env.PRINTFUL_CLIENT_ID}&redirect_url=${process.env.PRINTFUL_REDIRECT_URL}`;
  res.redirect(302, redirectUrl);
}
