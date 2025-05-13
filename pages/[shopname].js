import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

export async function getServerSideProps({ params }) {
  const { shopname } = params;

  // Find shop by slug
  const shopSnap = await getDocs(
    query(collection(db, "shops"), where("slug", "==", shopname))
  );
  if (shopSnap.empty) {
    return { notFound: true };
  }
  const shopDoc = shopSnap.docs[0];
  const shop = shopDoc.data();
  const sellerId = shopDoc.id;

  // Fetch products for this shop
  const productsSnap = await getDocs(
    query(collection(db, "products"), where("sellerId", "==", sellerId))
  );
  const products = productsSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    props: {
      shop,
      products,
    },
  };
}

export default function PublicShop({ shop, products }) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{shop.storeName}&apos;s Store</h1>
      <p className="mb-8 text-gray-600">{shop.description || "Welcome to our shop!"}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
            {product.thumbnail_url && (
              <img
                src={product.thumbnail_url}
                alt={product.name}
                className="h-32 w-full object-cover rounded mb-2"
              />
            )}
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-500">{product.description}</p>
            <div className="mt-2 font-bold">${product.price?.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}