import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import slugify from 'slugify';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const productsWithSlugs = (data.result || []).map(product => ({
          ...product,
          slug: slugify(product.name, { lower: true }),
        }));

        const matchedProduct = productsWithSlugs.find(prod => prod.slug === slug);

        setProduct(matchedProduct || null);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <p className="text-center p-8 text-gray-500">Loading product...</p>;
  }

  if (!product) {
    return <p className="text-center p-8 text-red-500">Product not found.</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <img
        src={product.thumbnail_url}
        alt={product.name}
        className="w-full max-w-md h-96 object-cover rounded-lg mb-6"
      />
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{product.name}</h1>
      <p className="text-blue-600 font-bold text-xl mb-2">$24.99</p> {/* Placeholder price */}
      <p className="text-gray-600">More details coming soon...</p>
    </main>
  );
}
