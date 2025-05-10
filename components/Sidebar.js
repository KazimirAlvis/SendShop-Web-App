import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(router.pathname.startsWith("/dashboard/settings"));

  return (
    <aside className="w-60 bg-gray-100 h-screen flex flex-col justify-between p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Seller Dashboard</h3>
        <ul className="space-y-2">
          <li><Link href="/dashboard" className="block hover:underline">Overview</Link></li>
          <li><Link href="/dashboard/products" className="block hover:bg-gray-100">Products</Link></li>
          <li><Link href="/dashboard/orders" className="block hover:underline">Orders</Link></li>
          <li><Link href="/dashboard/messages" className="block hover:underline">Messages</Link></li>
          <li>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left hover:underline"
            >
              ⚙️ Settings {showSettings ? "▲" : "▼"}
            </button>
            {showSettings && (
              <ul className="ml-4 mt-2 space-y-1">             
                <li><Link href="/dashboard/settings/appearance" className="block hover:underline">Shop Appearance</Link></li>
                <li><Link href="/dashboard/settings/password" className="block hover:underline">Change Password</Link></li>
                <li><Link href="/dashboard/settings/seo" className="block hover:underline">SEO Settings</Link></li>
                <li><Link href="/dashboard/settings/payout" className="block hover:underline">Payout Info</Link></li>
              </ul>
            )}
          </li>
          <li className="mt-4">
  <button
    onClick={() => {
      const clientId = process.env.NEXT_PUBLIC_PRINTFUL_CLIENT_ID;
      const redirectUrl = `${window.location.origin}/api/printful/callback`;
      window.location.href = `https://www.printful.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_url=${redirectUrl}`;
    }}
    className="text-sm text-blue-600 hover:underline"
  >
    🔗 Connect to Printful
  </button>
</li>

        </ul>
      </div>

      {/* 👇 Sign Out Button at Bottom */}
      <button
        onClick={async () => {
          await fetch("/api/logout");
          window.location.href = "/login";
        }}
        className="mt-6 text-sm text-red-600 hover:underline"
      >
        🔓 Sign Out
      </button>
    </aside>
  );
}
