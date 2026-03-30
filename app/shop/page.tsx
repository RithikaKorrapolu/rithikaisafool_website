import { getProducts } from "@/lib/shopify";
import ShopContent from "@/components/ShopContent";

export default async function Shop() {
  // Fetch products server-side
  const fetchedProducts = await getProducts();

  // Custom sort: Let Me Show You at the end
  const products = [...fetchedProducts].sort((a, b) => {
    const aTitle = a.title?.toLowerCase() || '';
    const bTitle = b.title?.toLowerCase() || '';
    const aIsLMSY = aTitle.includes('let me show you');
    const bIsLMSY = bTitle.includes('let me show you');

    if (aIsLMSY && !bIsLMSY) return 1;
    if (!aIsLMSY && bIsLMSY) return -1;
    return 0;
  });

  return <ShopContent products={products} />;
}
