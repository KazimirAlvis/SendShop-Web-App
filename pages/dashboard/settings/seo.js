import { useEffect, useState } from "react";
import Tabs from "@/components/Tabs";
import { getAuth } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function SEOSettings() {
  const [seo, setSeo] = useState({
    title: "",
    description: "",
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
        const data = docSnap.data().seo || {};
        setSeo({
          title: data.title || "",
          description: data.description || "",
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
        { seo },
        { merge: true }
      );
      setMessage("✅ SEO updated successfully!");
    } catch (err) {
      console.error("SEO update failed:", err);
      setMessage("❌ Error saving SEO settings.");
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">SEO Settings</h1>
      <Tabs />

      <form onSubmit={handleSave} className="mt-6 space-y-4 bg-white border p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Meta Title</label>
          <input
            type="text"
            value={seo.title}
            onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Meta Description</label>
          <textarea
            rows={4}
            value={seo.description}
            onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Save SEO Settings
        </button>
      </form>
    </div>
  );
}
