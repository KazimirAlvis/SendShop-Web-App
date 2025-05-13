import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  HomeIcon,
  CubeIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  LinkIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ shopSlug }) {
  const router = useRouter();
  const [showSettings, setShowSettings] = useState(router.pathname.startsWith("/dashboard/settings"));
  const [showConnections, setShowConnections] = useState(router.pathname.startsWith("/dashboard/connections"));

  const navItem =
    "flex items-center gap-2 px-3 py-2 rounded transition-colors group";
  const navHover =
    "hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-100 focus:text-blue-700";
  const navActive = "bg-blue-50 text-blue-700 font-semibold";

  return (
    <aside className="w-64 bg-gray-50 h-screen flex flex-col justify-between p-4 border-r border-gray-200">
      <div>
        <h3 className="text-lg font-semibold mb-6 text-blue-700">Seller Dashboard</h3>
        <ul className="space-y-1">
          <li>
            <Link
              href="/dashboard"
              className={`${navItem} ${navHover} ${router.pathname === "/dashboard" ? navActive : ""}`}
            >
              <HomeIcon className="h-5 w-5" />
              Overview
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/products"
              className={`${navItem} ${navHover} ${router.pathname === "/dashboard/products" ? navActive : ""}`}
            >
              <CubeIcon className="h-5 w-5" />
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/orders"
              className={`${navItem} ${navHover} ${router.pathname === "/dashboard/orders" ? navActive : ""}`}
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Orders
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/messages"
              className={`${navItem} ${navHover} ${router.pathname === "/dashboard/messages" ? navActive : ""}`}
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Messages
            </Link>
          </li>
          {/* Settings Dropdown */}
          <li>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`${navItem} ${navHover} w-full text-left ${showSettings ? navActive : ""}`}
            >
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
              <span className="ml-auto">{showSettings ? "▲" : "▼"}</span>
            </button>
            {showSettings && (
              <ul className="ml-6 mt-1 space-y-1 bg-blue-50 rounded p-2">
                <li>
                  <Link href="/dashboard/settings/appearance" className={`${navItem} ${navHover}`}>
                    Shop Appearance
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings/password" className={`${navItem} ${navHover}`}>
                    Change Password
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings/seo" className={`${navItem} ${navHover}`}>
                    SEO Settings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/settings/payout" className={`${navItem} ${navHover}`}>
                    Payout Info
                  </Link>
                </li>
              </ul>
            )}
          </li>
          {/* Connections Dropdown */}
          <li>
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`${navItem} ${navHover} w-full text-left ${showConnections ? navActive : ""}`}
            >
              <LinkIcon className="h-5 w-5" />
              Connections
              <span className="ml-auto">{showConnections ? "▲" : "▼"}</span>
            </button>
            {showConnections && (
              <ul className="ml-6 mt-1 space-y-1 bg-blue-50 rounded p-2">
                <li>
                  <Link href="/dashboard/connections/printful" className={`${navItem} ${navHover}`}>
                    Printful
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/connections/stripe" className={`${navItem} ${navHover}`}>
                    Stripe
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/connections/domain" className={`${navItem} ${navHover}`}>
                    Custom Domain
                  </Link>
                </li>
                {/* Add more connections here */}
              </ul>
            )}
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        {shopSlug && (
          <Link
            href={`/${shopSlug}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition mb-2 justify-center"
          >
            <EyeIcon className="h-5 w-5" />
            View Your Shop
          </Link>
        )}
        <button
          onClick={async () => {
            await fetch("/api/logout");
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 text-sm text-red-600 hover:underline justify-center"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
