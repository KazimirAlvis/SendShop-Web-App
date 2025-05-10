import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Header from '@/components/Header';
import Link from "next/link";


export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/getUser');
      if (res.ok) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken = await userCred.user.getIdToken();

      await fetch('/api/setToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError(err.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={null} />

      <div className="flex items-center justify-center px-4 py-12">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold">Log In to SendShop</h1>

          {error && <p className="text-red-600">{error}</p>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="input"
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="input"
            onChange={handleChange}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-500 hover:underline">Sign up here</Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ccc;
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
