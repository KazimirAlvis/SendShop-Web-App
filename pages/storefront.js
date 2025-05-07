"use client";

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
        const basicProducts = data.result || [];

        const detailedProducts = await Promise.all(
          basicProducts
            .filter(product => product.name) // ensure slugify doesn't break
            .map(async (product) => {
              const detailResponse = await fetch(`/api/product/${product.id}`);
              const detailData = await detailResponse.json();

              const syncVariants = detailData.result?.sync_variants || [];

              let lowestPrice = null;
              if (syncVariants.length > 0) {
                const validPrices = syncVariants
                  .map(variant => parseFloat(variant.retail_price))
                  .filter(price => !isNaN(price));

                if (validPrices.length > 0) {
                  lowestPrice = Math.min(...validPrices).toFixed(2);
                }
              }

              return {
                ...product,
                price: lowestPrice,
                slug: slugify(product.name, { lower: true }),
              };
            })
        );

        setProducts(detailedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      {/* Announcement Banner */}
      <div className="w-full bg-[#000] py-3 text-center">
        <p className="font-bold text-[#fff] font-[Open_Sans]">
          Banner you can use to make announcements to your visitors
        </p>
      </div>

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[180px] flex flex-col items-center pt-[60px] px-[32px]">
          <div className="w-[150px] h-[150px] overflow-hidden rounded-full mb-0 pb-0">
            <img src="/images/PH-logo.png" alt="Store Logo" className="h-auto w-full mb-0" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 pt-[32px] pb-[60px] px-[32px]">
          <section className="header mb-8">
            <h1 className="text-4xl font-[Open_Sans] font-bold text-blue-600">
              Featured
            </h1>
          </section>

          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[32px]">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer">
                    <Link href={`/product/${product.slug}`}>
                      <div className="block text-[#000] no-underline">
                        <img
                          src={product.thumbnail_url}
                          alt={product.name}
                          className="w-full h-60 object-cover"
                        />
                        <div className="p-4 flex flex-col justify-between flex-grow text-center">
                          <h2 className="font-[Open_Sans] text-[16px] text-gray-800 mb-[5px] truncate mx-auto max-w-[260px]">
                            {product.name}
                          </h2>
                          {product.price && (
                            <p className="font-[Open_Sans] text-[16px] mt-[0px] text-black">
                              From ${product.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="font-[Open_Sans] text-[#000]">No products found.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
