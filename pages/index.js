import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          SendShop
        </div>
        <div>
          <Link href="/signup" className="mr-4 text-blue-500 hover:text-blue-700">Sign Up</Link>
          <Link href="/login" className="text-blue-500 hover:text-blue-700">Login</Link>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to SendShop!</h1>
          <p className="text-xl mb-6">The easiest way to launch your own branded Printful store.</p>
          <Link href="/signup" className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
