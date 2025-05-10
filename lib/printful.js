export async function exchangeCodeForToken(code) {
  const payload = {
    code,
    client_id: process.env.PRINTFUL_CLIENT_ID,
    client_secret: process.env.PRINTFUL_CLIENT_SECRET,
    redirect_uri: process.env.PRINTFUL_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  console.log("🔍 Token exchange payload:", payload);

  const res = await fetch("https://www.printful.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Printful token exchange failed:", errorText);
    throw new Error("Token exchange failed");
  }

  return await res.json();
}

export async function getStoreInfo(token) {
  const res = await fetch("https://api.printful.com/stores", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Printful store info fetch failed:", errorText);
    throw new Error("Failed to fetch store info");
  }

  return await res.json();
}
