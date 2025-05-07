import Link from 'next/link';

export default function Signup() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Create Your SendShop Account</h1>

      <div className="flex flex-col space-y-4">
        <Link href={`https://www.printful.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_PRINTFUL_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_PRINTFUL_REDIRECT_URI}`}
          className="bg-blue-600 text-white py-3 px-6 rounded text-center hover:bg-blue-700">
          Connect Existing Printful Account
        </Link>

        <Link href="https://www.printful.com/a/affiliate-signup-link" target="_blank"
          className="bg-green-600 text-white py-3 px-6 rounded text-center hover:bg-green-700">
          Create New Printful Account (Affiliate)
        </Link>
      </div>

      <Link href="/" className="mt-6 text-blue-500 hover:text-blue-700">
        ← Back to home
      </Link>
    </div>
  );
}
