"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 pt-[32px] pb-[60px] px-[32px] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6 font-[Open_Sans]">
          Thank you for your order!
        </h1>

        <p className="text-lg text-gray-700 mb-8 font-[Open_Sans] max-w-md">
          Your order has been successfully submitted. You'll receive an email confirmation shortly.
        </p>

        <Link href="/" passHref legacyBehavior>
          <a className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded">
            Return to Home
          </a>
        </Link>
      </main>
    </div>
  );
}
