import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Sidebar() {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(
    router.pathname.startsWith("/dashboard/settings")
  );

  const linkClass = "block px-3 py-2 rounded hover:bg-gray-100";
  const activeClass = "bg-gray-200 font-semibold";

  return (
    <aside className="w-60 h-screen bg-gray-50 border-r px-4 py-6">
      <h3 className="text-xl font-bold mb-6">Seller Dashboard</h3>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`${linkClass} ${router.pathname === "/dashboard" ? activeClass : ""}`}
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/products"
              className={`${linkClass} ${router.pathname.startsWith("/dashboard/products") ? activeClass : ""}`}
            >
              Products
            </Link>
          </li>

          <li>
            <Link
              href="/dashboard/orders"
              className={`${linkClass} ${router.pathname.startsWith("/dashboard/orders") ? activeClass : ""}`}
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/messages"
              className={`${linkClass} ${router.pathname.startsWith("/dashboard/messages") ? activeClass : ""}`}
            >
              Messages
            </Link>
          </li>
          <li>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center justify-between"
            >
              <span>⚙️ Settings</span>
              <span>{showSettings ? "▲" : "▼"}</span>
            </button>
            {showSettings && (
              <ul className="pl-4 mt-2 space-y-1 text-sm">
                <li>
                  <Link
                    href="/dashboard/settings/appearance"
                    className={`${linkClass} ${router.pathname.includes("appearance") ? activeClass : ""}`}
                  >
                    Shop Appearance
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings/password"
                    className={`${linkClass} ${router.pathname.includes("password") ? activeClass : ""}`}
                  >
                    Change Password
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings/seo"
                    className={`${linkClass} ${router.pathname.includes("seo") ? activeClass : ""}`}
                  >
                    SEO Settings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/settings/payout"
                    className={`${linkClass} ${router.pathname.includes("payout") ? activeClass : ""}`}
                  >
                    Payout Info
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}
