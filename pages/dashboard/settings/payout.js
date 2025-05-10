import { useEffect, useState } from "react";
import Tabs from "@/components/Tabs";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function PayoutSettings() {
  const [payout, setPayout] = useState({
    fullName: "",
    paypalEmail: "",
    address: "",
    taxId: "",
  });

  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);

    const fetchData = async () => {
      const docRef = doc(db, "shops", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().payout || {};
        setPayout({
          fullName: data.fullName || "",
          paypalEmail: data.paypalEmail || "",
          address: data.address || "",
          taxId: data.taxId || "",
        });
      }
    };

    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await setDoc(
        doc(db, "shops", userId),
        { payout },
        { merge: true }
      );
      setMessage("✅ Payout info saved successfully!");
    } catch (err) {
      console.error("Payout update error:", err);
      setMessage("❌ Failed to save payout info.");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">💸 Payout Info</h1>
      <Tabs />

      <form onSubmit={handleSave} className="mt-6 space-y-4 bg-white border p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Full Legal Name</label>
          <input
            type="text"
            value={payout.fullName}
            onChange={(e) => setPayout({ ...payout, fullName: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">PayPal Email</label>
          <input
            type="email"
            value={payout.paypalEmail}
            onChange={(e) => setPayout({ ...payout, paypalEmail: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Mailing Address</label>
          <textarea
            rows={3}
            value={payout.address}
            onChange={(e) => setPayout({ ...payout, address: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tax ID / EIN</label>
          <input
            type="text"
            value={payout.taxId}
            onChange={(e) => setPayout({ ...payout, taxId: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {message && (
          <p className="text-sm mt-2 text-green-600">{message}</p>
        )}

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Save Payout Info
        </button>
      </form>
    </div>
  );
}
