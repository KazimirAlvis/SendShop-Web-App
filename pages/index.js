import { useEffect, useState } from 'react';
import Link from 'next/link';
import slugify from 'slugify';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        const productsWithSlugs = (data.result || []).map(product => ({
          ...product,
          slug: slugify(product.name, { lower: true }),
        }));
        setProducts(productsWithSlugs);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
    	<section class="header">
	      <h1 className="text-4xl font-bold mb-6 text-blue-600">
	        Clothing Shop
	      </h1>
		  </section>

      {loading ? (
        <p className="text-gray-500">Loading products...</p>
      ) : (
        <div className="w-3/4 grid grid-cols-4 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.isArray(products) && products.length > 0 ? (
            products.map(product => (
              <div key={product.id} className="border-solid bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                <Link href={`/product/${product.slug}`} passHref legacyBehavior>
                  <a className="block">
                    <img
                      src={product.thumbnail_url}
                      alt={product.name}
                      className="w-full h-60 object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <h2 className="font-[Open_Sans] text-lg font-semibold text-gray-800 mb-2 truncate">
                        {product.name}
                      </h2>
                      <p className="font-[Open_Sans] text-blue-500 font-bold">$24.99</p> {/* Placeholder price */}
                    </div>
                  </a>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No products found.</p>
          )}
        </div>
      )}
    </main>
  );
}
