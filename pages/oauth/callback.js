// /pages/oauth/callback.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthCallback() {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (!code) return;

    async function sendCodeToAPI() {
      try {
        const res = await fetch("/api/oauth/handleToken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const result = await res.json();

        if (res.ok) {
          console.log("✅ OAuth token saved");
          router.push("/"); // or dashboard page
        } else {
          console.error("❌ OAuth failed:", result.error);
        }
      } catch (err) {
        console.error("❌ Network error:", err);
      }
    }

    sendCodeToAPI();
  }, [code]);

  return (
    <div className="p-10 text-center text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Connecting to Printful...</h1>
      <p className="text-sm text-gray-500">Please wait, this will only take a second.</p>
    </div>
  );
}
