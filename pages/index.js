import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={null} />

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to SendShop!</h1>
          <p className="text-xl mb-6">The easiest way to launch your own branded Printful store.</p>
          <Link
            href="/signup"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
