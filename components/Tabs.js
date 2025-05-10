import Link from "next/link";
import { useRouter } from "next/router";

export default function Tabs() {
  const router = useRouter();
  const base = "/dashboard/settings";

  const tabs = [
    { name: "Appearance", path: `${base}/appearance` },
    { name: "Change Password", path: `${base}/password` },
    { name: "SEO", path: `${base}/seo` },
    { name: "Payout Info", path: `${base}/payout` },
  ];

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
      {tabs.map(tab => (
        <Link key={tab.path} href={tab.path}>
          <span style={{
            padding: "0.5rem 1rem",
            borderBottom: router.pathname === tab.path ? "2px solid black" : "2px solid transparent",
            cursor: "pointer"
          }}>
            {tab.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
