import { useEffect, useState } from "react";
import Tabs from "@/components/Tabs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { getAuth } from "firebase/auth";

export default function AppearanceSettings() {
  const [form, setForm] = useState({
    storeName: "",
    title: "",
    socials: {
      instagram: "",
      twitter: "",
    },
    announcement: "",
    receiptMessage: "",
  });

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setUserId(user.uid);

    const fetchData = async () => {
      const docRef = doc(db, "shops", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setForm((prev) => ({ ...prev, ...docSnap.data().shopAppearance }));
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (!userId) return alert("User not loaded yet");

    await setDoc(
      doc(db, "shops", userId),
      { shopAppearance: form },
      { merge: true }
    );
    alert("Saved ✅");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Shop Appearance</h1>
      <Tabs />

      <form
        className="space-y-6 mt-6 bg-white shadow rounded p-6 border"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div>
          <label className="block font-medium mb-1">Store Name</label>
          <input
            type="text"
            value={form.storeName}
            onChange={(e) =>
              setForm({ ...form, storeName: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Store Title / Tagline</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Instagram</label>
            <input
              type="text"
              value={form.socials.instagram}
              onChange={(e) =>
                setForm({
                  ...form,
                  socials: { ...form.socials, instagram: e.target.value },
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Twitter</label>
            <input
              type="text"
              value={form.socials.twitter}
              onChange={(e) =>
                setForm({
                  ...form,
                  socials: { ...form.socials, twitter: e.target.value },
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Shop Announcement</label>
          <textarea
            rows={3}
            value={form.announcement}
            onChange={(e) =>
              setForm({ ...form, announcement: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Receipt Thank You Message</label>
          <textarea
            rows={3}
            value={form.receiptMessage}
            onChange={(e) =>
              setForm({ ...form, receiptMessage: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-black text-white font-medium px-6 py-2 rounded hover:bg-gray-800"
          >
            Save Appearance
          </button>
        </div>
      </form>
    </div>
  );
}
