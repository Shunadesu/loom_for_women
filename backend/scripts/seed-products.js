/**
 * Seed dữ liệu mẫu cho Cửa hàng Sinh kế: 8 categories + 10 products.
 *
 *   node scripts/seed-products.js
 *
 * - Idempotent: nếu category/product đã tồn tại (cùng slug) thì skip.
 * - Dữ liệu khớp với mockProducts.js để thống nhất giữa FE & BE.
 */

import 'dotenv/config';
import mongoose from 'mongoose';

import ProductCategory from '../src/models/ProductCategory.js';
import Product from '../src/models/Product.js';

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('Thiếu MONGODB_URI trong .env');
  process.exit(1);
}

const slugify = (str) =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const CATEGORIES = [
  { name: 'Tất cả', icon: '🌟', color: '#E60067', order: 0 },
  { name: 'Phụ kiện', icon: '👜', color: '#E60067', order: 1 },
  { name: 'Thời trang', icon: '👗', color: '#F472B6', order: 2 },
  { name: 'Đồ gia dụng', icon: '🏠', color: '#10B981', order: 3 },
  { name: 'Mỹ phẩm', icon: '💄', color: '#F59E0B', order: 4 },
  { name: 'Đồ handmade', icon: '🧶', color: '#8B5CF6', order: 5 },
  { name: 'Thực phẩm', icon: '🍯', color: '#0EA5E9', order: 6 },
  { name: 'Quà tặng', icon: '🎁', color: '#EF4444', order: 7 },
  { name: 'Khác', icon: '✨', color: '#64748B', order: 99 },
];

const PRODUCTS = [
  {
    categorySlug: 'phu-kien',
    title: 'Túi len móc thủ công',
    description: 'Túi len móc tay, nguyên liệu len cotton Việt Nam, kích thước 25x20cm.',
    thumbnail: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=600',
    price: 180000, originalPrice: 250000, stock: 12, salesCount: 142, rating: 4.8,
    sellerName: 'Chị Hoàng Thị Lan', sellerZaloUrl: 'https://zalo.me/0912345678',
    isFeatured: true,
  },
  {
    categorySlug: 'phu-kien',
    title: 'Khăn len đan tay',
    description: 'Khăn len đan tay ấm áp, phù hợp mùa đông, nhiều màu sắc.',
    thumbnail: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&q=80&w=600',
    price: 220000, originalPrice: 320000, stock: 8, salesCount: 89, rating: 4.9,
    sellerName: 'Chị Nguyễn Thị Mai', sellerZaloUrl: 'https://zalo.me/0923456789',
    isFeatured: true,
  },
  {
    categorySlug: 'thoi-trang',
    title: 'Váy hoa vintage',
    description: 'Váy hoa vintage phong cách Hàn Quốc, chất liệu cotton thoáng mát.',
    thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600',
    price: 380000, originalPrice: 450000, stock: 15, salesCount: 56, rating: 4.6,
    sellerName: 'Chị Trần Thị Hương', sellerZaloUrl: 'https://zalo.me/0934567890',
    isFeatured: true,
  },
  {
    categorySlug: 'do-gia-dung',
    title: 'Bình gốm Bát Tràng thủ công',
    description: 'Bình gốm sứ Bát Tràng, vẽ tay thủ công, đường kính 30cm.',
    thumbnail: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=600',
    price: 450000, originalPrice: 600000, stock: 5, salesCount: 23, rating: 5.0,
    sellerName: 'Anh Phạm Văn Nam', sellerZaloUrl: 'https://zalo.me/0945678901',
    isFeatured: false,
  },
  {
    categorySlug: 'my-pham',
    title: 'Son môi handmade organic',
    description: 'Son môi organic từ sáp ong và dầu dừa tự nhiên, an toàn cho môi.',
    thumbnail: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
    price: 95000, originalPrice: 120000, stock: 30, salesCount: 234, rating: 4.7,
    sellerName: 'Chị Lê Thị Thu', sellerZaloUrl: 'https://zalo.me/0956789012',
    isFeatured: true,
  },
  {
    categorySlug: 'do-handmade',
    title: 'Thú bông amigurumi',
    description: 'Thú bông amigurumi móc len, kích thước 20cm, an toàn cho trẻ em.',
    thumbnail: 'https://images.unsplash.com/photo-1605733513597-a8f8341084e6?auto=format&fit=crop&q=80&w=600',
    price: 150000, originalPrice: 200000, stock: 20, salesCount: 167, rating: 4.9,
    sellerName: 'Chị Đặng Thị Linh', sellerZaloUrl: 'https://zalo.me/0967890123',
    isFeatured: true,
  },
  {
    categorySlug: 'thuc-pham',
    title: 'Mật ong rừng Tây Bắc',
    description: 'Mật ong rừng nguyên chất Tây Bắc, 500ml, hũ thủy tinh.',
    thumbnail: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
    price: 280000, originalPrice: 350000, stock: 18, salesCount: 78, rating: 4.8,
    sellerName: 'Anh Hoàng Văn Sơn', sellerZaloUrl: 'https://zalo.me/0978901234',
    isFeatured: false,
  },
  {
    categorySlug: 'qua-tang',
    title: 'Hộp quà Tết handmade',
    description: 'Hộp quà Tết thủ công, bao gồm mứt, hạt dinh dưỡng và trà.',
    thumbnail: 'https://images.unsplash.com/photo-1607344645866-009c320bda?v=1&auto=format&fit=crop&q=80&w=600',
    price: 520000, originalPrice: 680000, stock: 10, salesCount: 45, rating: 4.9,
    sellerName: 'Chị Bùi Thị Hoa', sellerZaloUrl: 'https://zalo.me/0989012345',
    isFeatured: true,
  },
  {
    categorySlug: 'do-handmade',
    title: 'Sổ tay bìa da thủ công',
    description: 'Sổ tay bìa da handmade, giấy kraft dày 120gsm, 200 trang.',
    thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600',
    price: 165000, originalPrice: 220000, stock: 25, salesCount: 92, rating: 4.7,
    sellerName: 'Anh Nguyễn Văn Tú', sellerZaloUrl: 'https://zalo.me/0990123456',
    isFeatured: false,
  },
  {
    categorySlug: 'phu-kien',
    title: 'Mũ len đan tay',
    description: 'Mũ len đan tay ấm áp, phong cách Hàn Quốc, nhiều màu.',
    thumbnail: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=600',
    price: 120000, originalPrice: 180000, stock: 35, salesCount: 156, rating: 4.8,
    sellerName: 'Chị Vũ Thị Hằng', sellerZaloUrl: 'https://zalo.me/0901234567',
    isFeatured: false,
  },
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Đã kết nối MongoDB.');

    let categoryCount = 0;
    let productCount = 0;
    const catMap = {};

    for (const cat of CATEGORIES) {
      const slug = slugify(cat.name);
      let category = await ProductCategory.findOne({ slug });
      if (!category) {
        category = await ProductCategory.create({ ...cat, slug });
        categoryCount += 1;
        console.log(`[Seed] + Category: ${category.name}`);
      } else {
        console.log(`[Seed] = Category (đã có): ${category.name}`);
      }
      catMap[slug] = category._id;
    }

    for (const [i, p] of PRODUCTS.entries()) {
      const productSlug = slugify(p.title);
      let product = await Product.findOne({ slug: productSlug });
      if (product) {
        console.log(`[Seed] = Product (đã có): ${p.title}`);
        continue;
      }
      product = await Product.create({
        title: p.title,
        slug: productSlug,
        description: p.description,
        thumbnail: p.thumbnail,
        category: catMap[p.categorySlug] || null,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        salesCount: p.salesCount,
        rating: p.rating,
        sellerName: p.sellerName,
        sellerZaloUrl: p.sellerZaloUrl,
        isFeatured: p.isFeatured || false,
        isPublished: true,
        isActive: true,
        order: i,
      });
      productCount += 1;
      console.log(`[Seed] + Product: ${product.title}`);
    }

    console.log(
      `\n[Seed] Xong. Mới: ${categoryCount} categories, ${productCount} products.`
    );
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Lỗi:', err);
    process.exit(1);
  }
})();