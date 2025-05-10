import { useEffect, useState } from 'react';

export default function DashboardHome() {
  const [storeName, setStoreName] = useState('loading...');

  useEffect(() => {
    async function fetchStoreName() {
      const res = await fetch('/api/store-info');
      const data = await res.json();
      setStoreName(data.storeName);
    }

    fetchStoreName();
  }, []);

  return (
    <>
      <h1>Welcome to {storeName} 👋</h1>
      <p>This is your seller dashboard overview.</p>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => alert('Connect to Printful (coming soon)')}>
          🔗 Connect to Printful
        </button>
      </div>
    </>
  );
}
