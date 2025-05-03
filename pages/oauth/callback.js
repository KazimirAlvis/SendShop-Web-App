import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Connecting to Printful...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const { code, error: oauthError } = router.query;

    if (oauthError) {
      setError(`OAuth error: ${oauthError}`);
      return;
    }

    if (!code) return; // Wait until query param is available

    const fetchToken = async () => {
      try {
        setStatus('Exchanging code for token...');
        const res = await fetch(`/api/oauth/callback?code=${code}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'OAuth failed.');
          return;
        }

        setStatus('Connected! Redirecting...');
        setTimeout(() => router.push('/'), 1000);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError('Something went wrong during authentication.');
      }
    };

    fetchToken();
  }, [router.query]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 font-bold mb-4">Authentication Failed</h1>
          <p className="mb-4">{error}</p>
          <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-4 py-2 rounded">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl text-blue-600 font-bold mb-4">Printful Connection</h1>
        <p>{status}</p>
        <div className="mt-4 h-2 bg-blue-200 rounded animate-pulse w-48 mx-auto"></div>
      </div>
    </div>
  );
}
