// pages/oauth/callback.js

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Connecting to Printful...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const { code, error: oauthError } = router.query;

    // Handle OAuth errors
    if (oauthError) {
      setError(`OAuth error: ${oauthError}`);
      return;
    }

    if (!code) return;

    const fetchToken = async () => {
      try {
        setStatus('Exchanging authorization code for token...');
        const res = await fetch(`/api/oauth/callback?code=${code}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("OAuth error response:", data);
          setError(data.error || 'OAuth failed.');
          return;
        }

        setStatus('Connected successfully! Redirecting...');
        
        // Success! Redirect to homepage or dashboard
        setTimeout(() => router.push('/'), 1000);
      } catch (err) {
        console.error("OAuth unexpected error:", err);
        setError('Unexpected error occurred during authentication.');
      }
    };

    fetchToken();
  }, [router.query, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="p-8 rounded-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Failed</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="p-8 rounded-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Printful Connection</h1>
        <p className="text-gray-700 mb-4">{status}</p>
        <div className="mt-4 h-2 bg-blue-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}