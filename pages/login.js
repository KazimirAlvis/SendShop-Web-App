import Link from 'next/link';

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Log into Your Account</h1>

      <form className="flex flex-col space-y-4 w-full max-w-sm">
        <input type="email" placeholder="Email" required className="border p-3 rounded"/>
        <input type="password" placeholder="Password" required className="border p-3 rounded"/>
        <button className="bg-blue-600 text-white py-3 rounded hover:bg-blue-700">Login</button>
      </form>

      <Link href="/" className="mt-6 text-blue-500 hover:text-blue-700">
        ← Back to home
      </Link>
    </div>
  );
}
