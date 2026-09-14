import { supabase } from '../../../lib/supabase';
import ProductDetailClient from './ProductDetailClient';

// توليد الكارت المعاين ديناميكياً للروابط عند المشاركة على التواصل الاجتماعي
export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'المنتج غير موجود | LYNX',
    };
  }

  return {
    title: `${product.title} | LYNX Store`,
    description: `اشتري الآن ${product.title} بسعر ${product.price} ج.م من متجر LYNX.`,
    openGraph: {
      title: `${product.title} - ${product.price} ج.م`,
      description: product.description || 'اكتشف أحدث تصاميم الستريت وير من LYNX.',
      images: [
        {
          url: product.image_url || '/placeholder.png',
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
