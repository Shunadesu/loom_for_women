import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import Message from '../src/models/Message.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loom';

async function seedOrdersAndMessages() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user (seller)
    let seller = await User.findOne({ phone: '0987654321' });
    if (!seller) {
      console.log('⚠️  No test user found, creating one...');
      seller = await User.create({
        phone: '0987654321',
        name: 'Nguyễn Thị Mai',
        role: 'user',
        location: 'KCN PouYuen',
        zaloVerified: true,
      });
    }

    console.log(`\n👤 Using seller: ${seller.name} (${seller.phone})`);

    // Find ANY products to use for orders
    let products = await Product.find().limit(3);
    console.log(`📦 Total products in DB: ${await Product.countDocuments()}`);
    
    if (products.length === 0) {
      console.log('❌ No products found in database. Please run seed-products.js first.');
      process.exit(1);
    }

    // Update products to belong to this seller
    console.log(`\n📦 Updating ${products.length} products to belong to seller ${seller.name}...`);
    for (const product of products) {
      product.sellerPhone = seller.phone;
      product.sellerName = seller.name;
      product.location = seller.location || 'KCN PouYuen';
      await product.save();
    }
    console.log(`✅ Updated products`);

    // Clear existing orders and messages for this seller
    await Order.deleteMany({ sellerUserId: seller._id });
    await Message.deleteMany({ sellerId: seller._id });
    console.log('🗑️  Cleared existing orders and messages');

    // Create sample orders
    console.log('\n📦 Creating sample orders...');
    const year = new Date().getFullYear();
    let orderCount = await Order.countDocuments();
    
    const orders = [
      {
        orderCode: `#ORD-${year}-${String(orderCount + 1).padStart(4, '0')}`,
        sellerUserId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Chị Mai Anh',
        buyerPhone: '0901234567',
        buyerAddress: 'KCN Tân Bình, Dĩ An, Bình Dương',
        productId: products[0]._id,
        productTitle: products[0].title,
        productPrice: products[0].price,
        quantity: 2,
        totalPrice: products[0].price * 2,
        status: 'pending',
        buyerNote: 'Giao giờ trưa giúp em nhé chị',
      },
      {
        orderCode: `#ORD-${year}-${String(orderCount + 2).padStart(4, '0')}`,
        sellerUserId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Anh Tuấn',
        buyerPhone: '0912345678',
        buyerAddress: 'KCN Long Hậu, Long An',
        productId: products[0]._id,
        productTitle: products[0].title,
        productPrice: products[0].price,
        quantity: 3,
        totalPrice: products[0].price * 3,
        status: 'shipped',
        buyerNote: 'Ship tới cổng xưởng giúp em',
        shippedAt: new Date(Date.now() - 86400000), // 1 day ago
      },
    ];

    if (products.length > 1) {
      orders.push({
        orderCode: `#ORD-${year}-${String(orderCount + 3).padStart(4, '0')}`,
        sellerUserId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Chị Hương',
        buyerPhone: '0923456789',
        buyerAddress: 'KCN VSIP, Bình Dương',
        productId: products[1]._id,
        productTitle: products[1].title,
        productPrice: products[1].price,
        quantity: 1,
        totalPrice: products[1].price,
        status: 'done',
        deliveredAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
      });
    }

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} sample orders`);

    // Create sample messages
    const messages = [
      {
        sellerId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Chị Lan',
        buyerPhone: '0934567890',
        buyerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
        lastMessage: 'Chị ơi, túi vải có màu xanh không ạ?',
        lastMessageAt: new Date(Date.now() - 2 * 3600000), // 2 hours ago
        productId: products[0]._id,
        productTitle: products[0].title,
        unreadCount: 1,
      },
      {
        sellerId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Anh Tuấn',
        buyerPhone: '0912345678',
        buyerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        lastMessage: 'Em đặt 5 cái móc khóa nhé, giao tới xưởng được không?',
        lastMessageAt: new Date(Date.now() - 86400000), // 1 day ago
        productId: products[1]?._id,
        productTitle: products[1]?.title || '',
        unreadCount: 0,
      },
      {
        sellerId: seller._id,
        sellerPhone: seller.phone,
        buyerName: 'Chị Hương',
        buyerPhone: '0923456789',
        buyerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        lastMessage: 'Cảm ơn chị nhé, hàng đẹp lắm!',
        lastMessageAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        unreadCount: 0,
      },
    ];

    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${createdMessages.length} sample messages`);

    console.log('\n✅ Seed completed successfully!');
    console.log(`\n📊 Summary for seller: ${seller.name} (${seller.phone})`);
    console.log(`   - Orders: ${createdOrders.length}`);
    console.log(`   - Messages: ${createdMessages.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedOrdersAndMessages();
