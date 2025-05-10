import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    };
    doLogout();
  }, []);

  return <p className="p-6">Logging out...</p>;
}
