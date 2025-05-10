import { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import Header from '@/components/Header';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    storeName: '',
    phone: '',
    address: '',
    newsletter: false,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: form.name,
        email: form.email,
        storeName: form.storeName,
        phone: form.phone,
        address: form.address,
        newsletter: form.newsletter,
        createdAt: new Date(),
      });

      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();

          await fetch('/api/setToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken }),
          });

          router.push('/dashboard');
        }
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try logging in instead.');
      } else {
        setError(err.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={null} />

      <main className="flex-grow flex items-center justify-center px-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full space-y-6">
          <h1 className="text-2xl font-bold">Create Your SendShop Account</h1>

          {error && <p className="text-red-600">{error}</p>}

          <input name="name" placeholder="Full Name" required className="input" onChange={handleChange} />
          <input name="email" type="email" placeholder="Email" required className="input" onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" required className="input" onChange={handleChange} />
          <input name="storeName" placeholder="Store Name" required className="input" onChange={handleChange} />
          <input name="phone" placeholder="Phone Number" required className="input" onChange={handleChange} />
          <input name="address" placeholder="Address" required className="input" onChange={handleChange} />

          <label className="flex items-center">
            <input type="checkbox" name="newsletter" className="mr-2" onChange={handleChange} />
            Sign me up for SendShop email updates
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Signing up...' : 'Sign Up & Continue'}
          </button>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-blue-500 hover:underline">Log in here</a>
          </p>
        </form>
      </main>

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
