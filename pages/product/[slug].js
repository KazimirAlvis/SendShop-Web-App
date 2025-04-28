import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import slugify from 'slugify';
import Sidebar from '@/components/Sidebar'; // ✅ Import Sidebar

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

        if (matchedProduct) {
          // Fetch full details (to get variants)
          const detailResponse = await fetch(`/api/product/${matchedProduct.id}`);
          const detailData = await detailResponse.json();
          
          setProduct({
            ...matchedProduct,
            detail: detailData.result
          });
        } else {
          setProduct(null);
        }
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
    <div className="flex min-h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-row items-top pt-[32px] pb-[60px] px-[32px] gap-[60px]">
        <div className="w-1/2">
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full max-w-md h-96 object-cover rounded-lg mb-6"
          />
        </div>

        <div className="w-1/2 max-w-[380px]">
          <h1 className="font-[Open_Sans] text-[18px] mb-4 mt-[0px]">{product.name}</h1>

          {/* Price */}
          <p className="font-[Open_Sans] text-blue-600 font-bold text-xl mb-2">
            {product.detail?.sync_variants?.[0]?.retail_price
              ? `From $${product.detail.sync_variants[0].retail_price}`
              : 'Price Unavailable'}
          </p>

          {/* Size Dropdown */}
          {product.detail?.sync_variants?.length > 0 && (
            <div className="mb-6">
              <label htmlFor="size" className="block mb-2 font-[Open_Sans] text-gray-700 pb-[10px]">Select a Size:</label>
              <select id="size" name="size" className="text-[16px] py-[15px] border p-2 rounded w-full font-[Open_Sans]">
              {product.detail?.sync_variants?.map(variant => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} - ${variant.retail_price}
                  </option>
               ))}
              </select>
            </div>
            
          )}
          <p className="font-[Open_Sans] text-gray-600">Eight waving arms, suction cupped and swirled, This is a demonstration store of the theme. These products are not for sale, but we hope you'll explore the theme to see if it's right for your Big Cartel shop.</p>
        </div>
      </main>
    </div>
  );
}
