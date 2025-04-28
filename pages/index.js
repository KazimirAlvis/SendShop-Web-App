"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import slugify from 'slugify';
import Sidebar from '@/components/Sidebar';

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
          basicProducts.map(async (product) => {
            const detailResponse = await fetch(`/api/product/${product.id}`);
            const detailData = await detailResponse.json();
        
            console.log("Detail for:", product.name, detailData);
        
            const syncVariants = detailData.result?.sync_variants || [];
        
            console.log("Sync Variants:", syncVariants);
        
            let lowestPrice = null;
            if (syncVariants.length > 0) {
              const validPrices = syncVariants
                .map(variant => parseFloat(variant.retail_price))
                .filter(price => !isNaN(price));
        
              console.log("Valid Prices:", validPrices);
        
              if (validPrices.length > 0) {
                lowestPrice = Math.min(...validPrices).toFixed(2);
              }
            }
        
            console.log("Lowest price:", lowestPrice);
        
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
         <Sidebar />

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
              {Array.isArray(products) && products.length > 0 ? (
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
                          <h2 className="font-[Open_Sans]  text-gray-800 mb-[5px] truncate mx-auto max-w-[260px]">
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
