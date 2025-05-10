// pages/[store].js
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const StorePage = () => {
  const router = useRouter();
  const { store } = router.query;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold">
          {store ? `${store}'s Store` : 'SendShop Store'}
        </div>
        <Link href="/logout" className="text-red-500 hover:text-red-700 font-medium">
          Logout
        </Link>
      </header>

      <main className="p-6">
        <p>Store Page Content Coming Soon...</p>
      </main>
    </div>
  );
};

export default StorePage;
