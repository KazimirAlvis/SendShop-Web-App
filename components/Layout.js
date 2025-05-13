import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export default function Layout({ children }) {
  const [shopSlug, setShopSlug] = useState(null);

  useEffect(() => {
    const fetchSlug = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const shopDoc = await getDoc(doc(db, "shops", user.uid));
        if (shopDoc.exists()) setShopSlug(shopDoc.data().slug);
      }
    };
    fetchSlug();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar shopSlug={shopSlug} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
