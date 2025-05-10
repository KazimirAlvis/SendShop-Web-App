// components/Header.js
import Link from 'next/link';

export default function Header({ user }) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold">SendShop</Link>
      <div>
        {user ? (
          <a
            href="/logout"
            className="text-red-500 hover:text-red-700 font-medium"
          >
            Logout
          </a>
        ) : (
          <>
            <Link href="/login" className="mr-4 text-blue-500 hover:text-blue-700">Login</Link>
            <Link href="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}
