import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Callback() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    const { code } = router.query;

    if (!code) return;

    const fetchToken = async () => {
      try {
        const res = await fetch(`/api/oauth/callback?code=${code}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'OAuth failed.');
          return;
        }

        // ✅ Success! Redirect to homepage or dashboard
        router.push('/');
      } catch (err) {
        console.error(err);
        setError('Unexpected error.');
      }
    };

    fetchToken();
  }, [router.query]);

  if (error) return <p>OAuth failed: {error}</p>;

  return <p>Connecting to Printful...<br />Please wait, this will only take a second.</p>;
}
