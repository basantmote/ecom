import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../../../.env') })

import { PrismaClient } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── Cleanup (order matters due to foreign keys) ──────────────────────────
  await prisma.couponUsage.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.productReview.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.recentlyViewed.deleteMany()
  await prisma.inventoryLog.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.vendorDocument.deleteMany()
  await prisma.vendorAddress.deleteMany()
  await prisma.vendor.deleteMany()
  await prisma.deliveryPartner.deleteMany()
  await prisma.customerCredit.deleteMany()
  await prisma.creditTransaction.deleteMany()
  await prisma.userAddress.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.otpVerification.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('  ✓ Cleared existing data')

  // ─── Passwords ───────────────────────────────────────────────────────────
  const [adminHash, vendorHash, customerHash, driverHash] = await Promise.all([
    bcrypt.hash('Admin@123', 12),
    bcrypt.hash('Vendor@123', 12),
    bcrypt.hash('Test@1234', 12),
    bcrypt.hash('Driver@123', 12),
  ])

  // ─── Admin ───────────────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'admin@hamrobazaar.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: { create: { fullName: 'Platform Admin' } },
      credits: { create: { balance: 0 } },
    },
  })
  console.log('  ✓ Admin user created  (admin@hamrobazaar.com / Admin@123)')

  // ─── Vendors ─────────────────────────────────────────────────────────────
  const vendorData = [
    {
      email: 'tech@vendor.com',
      storeName: 'TechHub Nepal',
      slug: 'techhub-nepal',
      description: 'Nepal\'s largest electronics store. Genuine products, warranty assured.',
      commissionRate: 8.0,
    },
    {
      email: 'fashion@vendor.com',
      storeName: 'FashionStreet Nepal',
      slug: 'fashionstreet-nepal',
      description: 'Trendy fashion wear, footwear, and accessories for the modern Nepali.',
      commissionRate: 12.0,
    },
    {
      email: 'home@vendor.com',
      storeName: 'HomeStyle Nepal',
      slug: 'homestyle-nepal',
      description: 'Everything for your home — appliances, décor, beauty, and groceries.',
      commissionRate: 10.0,
    },
    {
      email: 'sport@vendor.com',
      storeName: 'SportZone Nepal',
      slug: 'sportzone-nepal',
      description: 'Sports equipment, fitness gear, and nutrition for every athlete.',
      commissionRate: 9.0,
    },
    {
      email: 'books@vendor.com',
      storeName: 'BookWorld Nepal',
      slug: 'bookworld-nepal',
      description: 'Books, stationery, toys, and games for all ages.',
      commissionRate: 7.0,
    },
  ]

  const vendors: Record<string, string> = {}

  for (const v of vendorData) {
    const user = await prisma.user.create({
      data: {
        email: v.email,
        passwordHash: vendorHash,
        role: 'VENDOR',
        status: 'ACTIVE',
        profile: { create: { fullName: v.storeName } },
        credits: { create: { balance: 0 } },
        vendor: {
          create: {
            storeName: v.storeName,
            slug: v.slug,
            description: v.description,
            commissionRate: v.commissionRate,
            status: 'APPROVED',
            approvedAt: new Date(),
          },
        },
      },
      include: { vendor: true },
    })
    vendors[v.slug] = user.vendor!.id
  }
  console.log('  ✓ 5 vendor accounts created (password: Vendor@123)')

  // ─── Customers ───────────────────────────────────────────────────────────
  const customerData = [
    { email: 'ram@test.com', name: 'Ram Sharma', phone: '+9779841000001', credits: 50000 },
    { email: 'sita@test.com', name: 'Sita Thapa', phone: '+9779841000002', credits: 10000 },
    { email: 'hari@test.com', name: 'Hari Bahadur', phone: '+9779841000003', credits: 0 },
    { email: 'maya@test.com', name: 'Maya Gurung', phone: '+9779841000004', credits: 25000 },
    { email: 'krishna@test.com', name: 'Krishna Maharjan', phone: '+9779841000005', credits: 0 },
  ]

  for (const c of customerData) {
    await prisma.user.create({
      data: {
        email: c.email,
        phone: c.phone,
        passwordHash: customerHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        profile: { create: { fullName: c.name } },
        credits: { create: { balance: c.credits } },
        cart: { create: {} },
        addresses: {
          create: {
            label: 'Home',
            street: 'Boudha Chowk, Newroad',
            city: 'Kathmandu',
            province: 'Bagmati',
            isDefault: true,
          },
        },
      },
    })
  }
  console.log('  ✓ 5 customer accounts created (password: Test@1234)')

  // ─── Delivery Partner ────────────────────────────────────────────────────
  await prisma.user.create({
    data: {
      email: 'driver@delivery.com',
      phone: '+9779851000001',
      passwordHash: driverHash,
      role: 'DELIVERY',
      status: 'ACTIVE',
      profile: { create: { fullName: 'Bikash Tamang' } },
      credits: { create: { balance: 0 } },
      deliveryPartner: {
        create: {
          vehicleType: 'BIKE',
          licensePlate: 'BA 1 CHA 2345',
          status: 'AVAILABLE',
        },
      },
    },
  })
  console.log('  ✓ Delivery partner created  (driver@delivery.com / Driver@123)')

  // ─── Categories ───────────────────────────────────────────────────────────
  const categoryDefs = [
    { name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=240&h=240&fit=crop&auto=format&q=70', position: 1 },
    { name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=240&h=240&fit=crop&auto=format&q=70', position: 2 },
    { name: 'Home & Living', slug: 'home-living', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240&h=240&fit=crop&auto=format&q=70', position: 3 },
    { name: 'Beauty', slug: 'beauty', imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=240&h=240&fit=crop&auto=format&q=70', position: 4 },
    { name: 'Sports', slug: 'sports', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=240&h=240&fit=crop&auto=format&q=70', position: 5 },
    { name: 'Books', slug: 'books', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=240&h=240&fit=crop&auto=format&q=70', position: 6 },
    { name: 'Groceries', slug: 'groceries', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=240&h=240&fit=crop&auto=format&q=70', position: 7 },
    { name: 'Toys & Kids', slug: 'toys', imageUrl: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=240&h=240&fit=crop&auto=format&q=70', position: 8 },
  ]

  const cats: Record<string, string> = {}
  for (const c of categoryDefs) {
    const cat = await prisma.category.create({ data: { ...c, isActive: true } })
    cats[c.slug] = cat.id
  }
  console.log('  ✓ 8 categories created')

  // ─── Products ────────────────────────────────────────────────────────────
  const techVendorId = vendors['techhub-nepal']
  const fashionVendorId = vendors['fashionstreet-nepal']
  const homeVendorId = vendors['homestyle-nepal']
  const sportVendorId = vendors['sportzone-nepal']
  const bookVendorId = vendors['bookworld-nepal']

  type ProductDef = {
    name: string
    slug: string
    description: string
    isFeatured?: boolean
    tags: string[]
    variants: { sku: string; attributes: Record<string, string>; price: number; comparePrice?: number; stock: number; images: string[] }[]
  }

  const productsByCategory: [string, string, ProductDef[]][] = [
    // [categorySlug, vendorId, products]
    ['electronics', techVendorId, [
      {
        name: 'Samsung Galaxy A55 5G',
        slug: 'samsung-galaxy-a55-5g',
        description: 'Experience blazing 5G speeds with the Galaxy A55. Features a stunning 6.6" Super AMOLED display, 50MP triple camera, and 5000mAh battery. Built for Nepal\'s network with Dual SIM support.',
        isFeatured: true,
        tags: ['smartphone', '5g', 'samsung', 'android'],
        variants: [
          { sku: 'A55-256-ICE', attributes: { color: 'Icy Blue', storage: '256GB' }, price: 5499900, comparePrice: 6299900, stock: 15, images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'A55-256-AWE', attributes: { color: 'Awesome Lilac', storage: '256GB' }, price: 5499900, comparePrice: 6299900, stock: 10, images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Redmi Note 13 Pro 5G',
        slug: 'redmi-note-13-pro-5g',
        description: 'The Redmi Note 13 Pro 5G packs a 200MP camera and Snapdragon 7s Gen 2 for flagship-level performance at a mid-range price. With 67W turbo charging, you\'ll be powered up in no time.',
        isFeatured: true,
        tags: ['smartphone', '5g', 'redmi', 'xiaomi', '200mp'],
        variants: [
          { sku: 'RN13PRO-256-BLK', attributes: { color: 'Midnight Black', storage: '256GB' }, price: 3699900, comparePrice: 4299900, stock: 20, images: ['https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'RN13PRO-256-WHT', attributes: { color: 'Arctic White', storage: '256GB' }, price: 3699900, comparePrice: 4299900, stock: 12, images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        slug: 'sony-wh-1000xm5',
        description: 'Industry-leading noise cancellation with eight microphones and two processors. 30-hour battery, multipoint Bluetooth, and premium sound quality. The ultimate headphones for Kathmandu\'s busy streets.',
        isFeatured: false,
        tags: ['headphones', 'wireless', 'sony', 'noise-cancelling'],
        variants: [
          { sku: 'XM5-BLK', attributes: { color: 'Black' }, price: 3499900, comparePrice: 3999900, stock: 8, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'XM5-SLV', attributes: { color: 'Silver' }, price: 3499900, comparePrice: 3999900, stock: 6, images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'JBL Flip 6 Bluetooth Speaker',
        slug: 'jbl-flip-6',
        description: 'Powerful sound in a compact, waterproof package. JBL Flip 6 delivers 12 hours of playtime with IP67 water and dust resistance. Perfect for picnics in Phewa Lake or office use.',
        isFeatured: false,
        tags: ['speaker', 'bluetooth', 'jbl', 'waterproof', 'portable'],
        variants: [
          { sku: 'FLIP6-RED', attributes: { color: 'Red' }, price: 1299900, comparePrice: 1599900, stock: 25, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'FLIP6-BLU', attributes: { color: 'Ocean Blue' }, price: 1299900, comparePrice: 1599900, stock: 20, images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'FLIP6-BLK', attributes: { color: 'Black' }, price: 1299900, comparePrice: 1599900, stock: 18, images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Apple AirPods Pro 2nd Gen',
        slug: 'apple-airpods-pro-2',
        description: 'Adaptive Audio, Personalized Spatial Audio, and 30-hour total battery life with MagSafe Charging Case. The best earbuds for iPhone and iPad users in Nepal.',
        isFeatured: true,
        tags: ['earbuds', 'apple', 'airpods', 'wireless', 'noise-cancelling'],
        variants: [
          { sku: 'APP2-WHT', attributes: { color: 'White' }, price: 2999900, comparePrice: 3499900, stock: 10, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'HP 15s Laptop Intel Core i5',
        slug: 'hp-15s-laptop-i5',
        description: '15.6" FHD display with Intel Core i5-1235U, 8GB DDR4 RAM, 512GB SSD, and Windows 11. Ideal for students and professionals across Nepal. 1-year local warranty.',
        isFeatured: true,
        tags: ['laptop', 'hp', 'windows', 'intel', 'student'],
        variants: [
          { sku: 'HP15S-I5-8-512', attributes: { RAM: '8GB', Storage: '512GB SSD' }, price: 8999900, comparePrice: 9999900, stock: 7, images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'HP15S-I5-16-512', attributes: { RAM: '16GB', Storage: '512GB SSD' }, price: 10499900, comparePrice: 11999900, stock: 5, images: ['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['fashion', fashionVendorId, [
      {
        name: 'Nike Air Max 270 Sneakers',
        slug: 'nike-air-max-270',
        description: 'The Nike Air Max 270 delivers maximum cushioning with the tallest Air unit yet. Lightweight knit upper and bold design. Available in sizes UK 6-12 for men.',
        isFeatured: true,
        tags: ['shoes', 'nike', 'sneakers', 'sports'],
        variants: [
          { sku: 'AM270-BLK-8', attributes: { color: 'Black/White', size: 'UK 8' }, price: 1399900, comparePrice: 1899900, stock: 10, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'AM270-BLK-9', attributes: { color: 'Black/White', size: 'UK 9' }, price: 1399900, comparePrice: 1899900, stock: 8, images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'AM270-WHT-8', attributes: { color: 'White/Blue', size: 'UK 8' }, price: 1399900, comparePrice: 1899900, stock: 12, images: ['https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: "Levi's 511 Slim Fit Jeans",
        slug: 'levis-511-slim-jeans',
        description: 'The iconic Levi\'s 511 slim fit sits below the waist and tapers from the knee. Made with stretch denim for all-day comfort. Perfect for Kathmandu\'s mild weather.',
        isFeatured: false,
        tags: ['jeans', 'levis', 'denim', 'slim-fit'],
        variants: [
          { sku: 'L511-32X32-INK', attributes: { size: '32x32', color: 'Ink Blue' }, price: 699900, comparePrice: 899900, stock: 15, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'L511-34X32-INK', attributes: { size: '34x32', color: 'Ink Blue' }, price: 699900, comparePrice: 899900, stock: 12, images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'L511-32X32-BLK', attributes: { size: '32x32', color: 'Black' }, price: 699900, comparePrice: 899900, stock: 10, images: ['https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Puma Running Shoes RS-X',
        slug: 'puma-rsx-running-shoes',
        description: 'Retro-inspired RS-X running shoes with chunky sole and vibrant color blocking. Cushioned insole for all-day comfort. Available for men and women.',
        isFeatured: false,
        tags: ['shoes', 'puma', 'running', 'sports'],
        variants: [
          { sku: 'PRSX-WHT-7', attributes: { color: 'White/Mint', size: 'UK 7' }, price: 849900, comparePrice: 1049900, stock: 12, images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'PRSX-WHT-8', attributes: { color: 'White/Mint', size: 'UK 8' }, price: 849900, comparePrice: 1049900, stock: 10, images: ['https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Ethnic Dhaka Kurta Suruwal Set',
        slug: 'dhaka-kurta-suruwal-set',
        description: 'Handwoven Dhaka fabric kurta suruwal — a pride of Nepal. Perfect for Dashain, Tihar, and cultural events. Available in traditional red-green and blue-gold patterns.',
        isFeatured: true,
        tags: ['ethnic', 'dhaka', 'kurta', 'nepali', 'traditional'],
        variants: [
          { sku: 'DHAKA-RED-M', attributes: { pattern: 'Red/Green', size: 'M' }, price: 399900, comparePrice: undefined, stock: 20, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'DHAKA-RED-L', attributes: { pattern: 'Red/Green', size: 'L' }, price: 399900, comparePrice: undefined, stock: 15, images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'DHAKA-BLU-M', attributes: { pattern: 'Blue/Gold', size: 'M' }, price: 399900, comparePrice: undefined, stock: 18, images: ['https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Adidas Essentials Hoodie',
        slug: 'adidas-essentials-hoodie',
        description: 'Stay warm with the Adidas Essentials Fleece Hoodie. Made from soft cotton-blend fleece with kangaroo pocket. A wardrobe staple for chilly Kathmandu winters.',
        isFeatured: false,
        tags: ['hoodie', 'adidas', 'sweatshirt', 'winter'],
        variants: [
          { sku: 'ADH-BLK-S', attributes: { color: 'Black', size: 'S' }, price: 599900, comparePrice: 799900, stock: 20, images: ['https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'ADH-BLK-M', attributes: { color: 'Black', size: 'M' }, price: 599900, comparePrice: 799900, stock: 25, images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'ADH-NVY-M', attributes: { color: 'Navy', size: 'M' }, price: 599900, comparePrice: 799900, stock: 18, images: ['https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Mahabir Pun Pashmina Shawl',
        slug: 'pashmina-shawl-100-pure',
        description: '100% pure Pashmina from Mustang goats. Ultra-soft, lightweight, and naturally warm. Hand-spun and hand-woven by artisans in Kathmandu valley. Each piece is unique.',
        isFeatured: true,
        tags: ['pashmina', 'shawl', 'nepali', 'handmade', 'luxury'],
        variants: [
          { sku: 'PASH-RED', attributes: { color: 'Crimson Red' }, price: 1299900, comparePrice: 1799900, stock: 10, images: ['https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'PASH-GRY', attributes: { color: 'Dove Grey' }, price: 1299900, comparePrice: 1799900, stock: 8, images: ['https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'PASH-BLK', attributes: { color: 'Midnight Black' }, price: 1299900, comparePrice: 1799900, stock: 12, images: ['https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['home-living', homeVendorId, [
      {
        name: 'Philips Air Fryer HD9200/91 4.1L',
        slug: 'philips-air-fryer-hd9200',
        description: 'Cook crispy, healthier meals with 90% less fat. 4.1L capacity fits a whole chicken. Rapid Air technology for fast and even cooking. Perfect for Nepali snacks like samosa and pakoda.',
        isFeatured: true,
        tags: ['air-fryer', 'philips', 'kitchen', 'appliances'],
        variants: [
          { sku: 'PHAF-4L-BLK', attributes: { color: 'Black', capacity: '4.1L' }, price: 1599900, comparePrice: 1999900, stock: 12, images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Prestige Pressure Cooker 5L Stainless',
        slug: 'prestige-pressure-cooker-5l',
        description: 'Prestige Nakshatra Plus 5L stainless steel pressure cooker. Heavy-grade body with safety lid system. Trusted by Nepali households for generations. Cooks dal-bhat in minutes.',
        isFeatured: false,
        tags: ['pressure-cooker', 'prestige', 'kitchen', 'stainless'],
        variants: [
          { sku: 'PPC-5L-SS', attributes: { capacity: '5L', material: 'Stainless Steel' }, price: 499900, comparePrice: 649900, stock: 30, images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Wooden Handcrafted Wall Clock',
        slug: 'wooden-wall-clock-handcrafted',
        description: 'Handcrafted wooden wall clock with carved Nepali motifs. Silent sweep movement, no ticking sound. Adds a warm, artisanal touch to any room. Made by local artisans in Bhaktapur.',
        isFeatured: false,
        tags: ['clock', 'wooden', 'handmade', 'decor', 'nepali'],
        variants: [
          { sku: 'WWC-30CM', attributes: { size: '30cm', wood: 'Sal Wood' }, price: 149900, comparePrice: 199900, stock: 25, images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'WWC-40CM', attributes: { size: '40cm', wood: 'Sal Wood' }, price: 249900, comparePrice: 299900, stock: 15, images: ['https://images.unsplash.com/photo-1611843467160-25afb8df1074?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Cotton Bed Sheet Set King Size',
        slug: 'cotton-bed-sheet-set-king',
        description: '400 thread count pure cotton king size bed sheet set. Includes 1 fitted sheet, 1 flat sheet, and 2 pillow covers. Breathable and durable for all seasons.',
        isFeatured: false,
        tags: ['bedsheet', 'cotton', 'king-size', 'bedroom'],
        variants: [
          { sku: 'CBSS-KNG-WHT', attributes: { color: 'Pure White', size: 'King' }, price: 299900, comparePrice: 399900, stock: 20, images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'CBSS-KNG-BLU', attributes: { color: 'Sky Blue', size: 'King' }, price: 299900, comparePrice: 399900, stock: 18, images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Bajaj Majesty OTX-35 Oven Toaster',
        slug: 'bajaj-majesty-otx35-oven',
        description: '35L oven toaster with 1500W heating element. Bake cakes, roast chicken, and grill sandwiches. 3 heating modes with 60-minute timer and stay-warm function.',
        isFeatured: false,
        tags: ['oven', 'bajaj', 'kitchen', 'baking'],
        variants: [
          { sku: 'BOTX-35L', attributes: { capacity: '35L', power: '1500W' }, price: 699900, comparePrice: 899900, stock: 8, images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['beauty', homeVendorId, [
      {
        name: "L'Oréal Revitalift 1.5% Pure Hyaluronic Acid Serum",
        slug: 'loreal-revitalift-serum',
        description: 'Dermatologist-tested serum with 1.5% pure Hyaluronic Acid. Visibly plumps skin, reduces fine lines, and intensely hydrates for 72 hours. 30ml bottle for 2-month supply.',
        isFeatured: true,
        tags: ['serum', 'loreal', 'skincare', 'hyaluronic-acid', 'anti-aging'],
        variants: [
          { sku: 'LRL-HA-30ML', attributes: { size: '30ml' }, price: 299900, comparePrice: 399900, stock: 50, images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Maybelline Fit Me Matte + Poreless Foundation',
        slug: 'maybelline-fit-me-foundation',
        description: 'Lightweight, buildable coverage that matches your skin perfectly. Oil-free and pore-minimizing formula for a natural finish. Available in 12 shades for South Asian skin tones.',
        isFeatured: false,
        tags: ['foundation', 'maybelline', 'makeup', 'oil-free'],
        variants: [
          { sku: 'MFM-115-IVORY', attributes: { shade: 'Natural Ivory 115' }, price: 159900, comparePrice: 189900, stock: 40, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'MFM-220-SAND', attributes: { shade: 'Natural Beige 220' }, price: 159900, comparePrice: 189900, stock: 35, images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'MFM-330-TOFFEE', attributes: { shade: 'Toffee 330' }, price: 159900, comparePrice: 189900, stock: 25, images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Biotique Bio Sunscreen SPF 40+ PA+++',
        slug: 'biotique-sunscreen-spf40',
        description: 'Matte finish, non-greasy sunscreen with broad-spectrum SPF 40+ PA+++ protection. Made with natural herbs — Alpine Berry, Aloe Vera, and Honey. Safe for Nepal\'s high-altitude UV exposure.',
        isFeatured: false,
        tags: ['sunscreen', 'biotique', 'skincare', 'spf40', 'natural'],
        variants: [
          { sku: 'BIO-SUN-50G', attributes: { size: '50g' }, price: 49900, comparePrice: 69900, stock: 80, images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Dove Deeply Nourishing Body Lotion 400ml',
        slug: 'dove-body-lotion-400ml',
        description: 'With NutriMoisture Complex, Dove Deeply Nourishing Body Lotion absorbs fast and keeps skin moisturized for 24 hours. Fragrance-free option available. Dermatologist recommended.',
        isFeatured: false,
        tags: ['lotion', 'dove', 'body-care', 'moisturizer'],
        variants: [
          { sku: 'DOVE-BL-400', attributes: { size: '400ml', variant: 'Deeply Nourishing' }, price: 79900, comparePrice: 99900, stock: 60, images: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        slug: 'the-ordinary-niacinamide-10',
        description: 'High-strength vitamin and mineral blemish formula. Reduces the appearance of pores and blemishes. 30ml bottle. Works great for oily, acne-prone skin in Nepal\'s humid monsoon season.',
        isFeatured: true,
        tags: ['serum', 'the-ordinary', 'niacinamide', 'skincare', 'acne'],
        variants: [
          { sku: 'TO-NIA-30ML', attributes: { size: '30ml' }, price: 149900, comparePrice: 199900, stock: 45, images: ['https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Lakme 9to5 Primer + Matte Lipstick',
        slug: 'lakme-9to5-lipstick',
        description: 'Lipstick with built-in primer for smudge-proof, 8-hour color. Creamy matte finish with rich pigment. 45 shades. Popular choice for Nepali women across all skin tones.',
        isFeatured: false,
        tags: ['lipstick', 'lakme', 'makeup', 'matte'],
        variants: [
          { sku: 'LKM-RED-RS3', attributes: { shade: 'Red Rust RS3' }, price: 64900, comparePrice: 79900, stock: 60, images: ['https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'LKM-PINK-PP4', attributes: { shade: 'Peach Pink PP4' }, price: 64900, comparePrice: 79900, stock: 50, images: ['https://images.unsplash.com/photo-1512341689857-198e7e2f3ca8?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['sports', sportVendorId, [
      {
        name: 'Optimum Nutrition Gold Standard Whey 2lb',
        slug: 'optimum-nutrition-whey-2lb',
        description: '24g of protein per serving with whey protein isolates as primary source. 5.5g of naturally occurring BCAAs. Over 20 delicious flavors. Trusted by athletes and fitness enthusiasts across Nepal.',
        isFeatured: true,
        tags: ['protein', 'whey', 'fitness', 'supplement', 'on'],
        variants: [
          { sku: 'ON-WH-2LB-CHOC', attributes: { flavor: 'Double Rich Chocolate', weight: '2lb' }, price: 599900, comparePrice: 749900, stock: 20, images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'ON-WH-2LB-VAN', attributes: { flavor: 'French Vanilla', weight: '2lb' }, price: 599900, comparePrice: 749900, stock: 15, images: ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Cosco Match Football Size 5',
        slug: 'cosco-match-football-size5',
        description: 'FIFA-quality 32-panel match football. PU outer with latex bladder. True flight trajectory and consistent bounce. Used by football clubs across Nepal. Size 5 (official match size).',
        isFeatured: false,
        tags: ['football', 'cosco', 'soccer', 'sports'],
        variants: [
          { sku: 'COSCO-FB-5-BLK', attributes: { color: 'Black/White', size: '5' }, price: 129900, comparePrice: 159900, stock: 30, images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Yonex Nanoray 7000i Badminton Racket',
        slug: 'yonex-nanoray-7000i-badminton',
        description: 'High-modulus graphite frame with Aero-Box frame for optimal aerodynamic efficiency. Extra slim shaft for quick strokes. Comes pre-strung. Great for beginners and intermediate players.',
        isFeatured: false,
        tags: ['badminton', 'yonex', 'racket', 'sports'],
        variants: [
          { sku: 'YNXNR7-BLU', attributes: { color: 'Blue/Orange' }, price: 349900, comparePrice: 449900, stock: 15, images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Premium Anti-Slip Yoga Mat 6mm',
        slug: 'premium-yoga-mat-6mm',
        description: 'Extra thick 6mm TPE foam yoga mat with alignment lines. Double-sided non-slip surface. Lightweight and foldable for gym or home use. Free carrying strap included.',
        isFeatured: false,
        tags: ['yoga', 'mat', 'fitness', 'exercise'],
        variants: [
          { sku: 'YOGA-6MM-PPL', attributes: { color: 'Purple', thickness: '6mm' }, price: 199900, comparePrice: 249900, stock: 35, images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'YOGA-6MM-BLK', attributes: { color: 'Black', thickness: '6mm' }, price: 199900, comparePrice: 249900, stock: 30, images: ['https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Adidas Aeroready Running T-Shirt',
        slug: 'adidas-aeroready-running-tshirt',
        description: 'Adidas AEROREADY moisture-absorbing fabric keeps you dry and comfortable during intense workouts. Reflective details for low-light visibility. Ideal for running in Ratnapark or Tundikhel.',
        isFeatured: false,
        tags: ['tshirt', 'adidas', 'running', 'sports', 'breathable'],
        variants: [
          { sku: 'ADR-BLK-M', attributes: { color: 'Black', size: 'M' }, price: 249900, comparePrice: 329900, stock: 30, images: ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'ADR-BLK-L', attributes: { color: 'Black', size: 'L' }, price: 249900, comparePrice: 329900, stock: 25, images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'ADR-RED-M', attributes: { color: 'Team Red', size: 'M' }, price: 249900, comparePrice: 329900, stock: 20, images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['books', bookVendorId, [
      {
        name: 'Atomic Habits by James Clear',
        slug: 'atomic-habits-james-clear',
        description: 'The world\'s #1 bestselling book on habits. Practical strategies for building good habits, breaking bad ones, and achieving any goal. Already transformed millions of lives globally.',
        isFeatured: true,
        tags: ['self-help', 'habits', 'productivity', 'bestseller'],
        variants: [
          { sku: 'AH-PAPER-ENG', attributes: { format: 'Paperback', language: 'English' }, price: 59900, comparePrice: 79900, stock: 80, images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Rich Dad Poor Dad by Robert Kiyosaki',
        slug: 'rich-dad-poor-dad',
        description: 'The bestselling personal finance book of all time. Learn what the rich teach their kids about money that the poor and middle class do not. Essential reading for Nepali entrepreneurs.',
        isFeatured: false,
        tags: ['finance', 'investing', 'personal-finance', 'bestseller'],
        variants: [
          { sku: 'RDPD-PAPER-ENG', attributes: { format: 'Paperback', language: 'English' }, price: 49900, comparePrice: 69900, stock: 60, images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'RDPD-PAPER-NEP', attributes: { format: 'Paperback', language: 'Nepali' }, price: 49900, comparePrice: undefined, stock: 40, images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Harry Potter Complete Box Set (1-7)',
        slug: 'harry-potter-box-set-1-7',
        description: 'All seven Harry Potter novels in a collector\'s box set — from Philosopher\'s Stone to Deathly Hallows. Paperback editions. The perfect gift for young readers across Nepal.',
        isFeatured: true,
        tags: ['harry-potter', 'fantasy', 'jk-rowling', 'box-set', 'fiction'],
        variants: [
          { sku: 'HP-BOX-ENG', attributes: { format: 'Paperback Box Set', language: 'English' }, price: 599900, comparePrice: 799900, stock: 15, images: ['https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'The Alchemist by Paulo Coelho',
        slug: 'the-alchemist-paulo-coelho',
        description: 'A magical story about following your dreams. Santiago\'s journey across the Sahara desert teaches us to listen to our hearts and recognize omens in life.',
        isFeatured: false,
        tags: ['fiction', 'philosophy', 'coelho', 'inspirational'],
        variants: [
          { sku: 'ALC-PAPER-ENG', attributes: { format: 'Paperback', language: 'English' }, price: 49900, comparePrice: undefined, stock: 90, images: ['https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Sapiens: A Brief History of Humankind',
        slug: 'sapiens-harari',
        description: 'Yuval Noah Harari\'s groundbreaking history of the human species. How did Homo sapiens become Earth\'s dominant species? A must-read for every curious mind.',
        isFeatured: false,
        tags: ['history', 'science', 'harari', 'non-fiction', 'bestseller'],
        variants: [
          { sku: 'SAP-PAPER-ENG', attributes: { format: 'Paperback', language: 'English' }, price: 79900, comparePrice: 99900, stock: 40, images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['groceries', homeVendorId, [
      {
        name: 'Dabur Honey Pure & Natural 500g',
        slug: 'dabur-honey-500g',
        description: '100% pure natural honey. NMR tested for purity. Rich in antioxidants and natural enzymes. Use in tea, salads, or as a natural sweetener. Ideal for Nepali households and health enthusiasts.',
        isFeatured: false,
        tags: ['honey', 'dabur', 'natural', 'grocery', 'health'],
        variants: [
          { sku: 'DABUR-HNY-500G', attributes: { weight: '500g' }, price: 69900, comparePrice: 79900, stock: 100, images: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'India Gate Basmati Rice 5kg',
        slug: 'india-gate-basmati-rice-5kg',
        description: 'Premium Basmati rice with long, slender grains and distinctive aroma. Aged for 2 years for better texture. Perfect for biryani, pulao, and everyday dal-bhat.',
        isFeatured: true,
        tags: ['rice', 'basmati', 'grocery', 'india-gate'],
        variants: [
          { sku: 'IGBAS-5KG', attributes: { weight: '5kg', variety: 'Classic' }, price: 129900, comparePrice: 149900, stock: 80, images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Premium Dry Fruits Mix 500g',
        slug: 'premium-dry-fruits-mix-500g',
        description: 'A nutritious blend of cashews, almonds, raisins, and pistachios. No artificial additives. Perfect for gifting during Dashain/Tihar or as a healthy daily snack.',
        isFeatured: false,
        tags: ['dry-fruits', 'nuts', 'healthy', 'snack', 'gift'],
        variants: [
          { sku: 'DFM-500G-MIX', attributes: { weight: '500g', type: 'Mixed' }, price: 89900, comparePrice: undefined, stock: 60, images: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: "Tata Tea Gold 50 Tea Bags",
        slug: 'tata-tea-gold-50-bags',
        description: 'Tata Tea Gold — blend of long leaf and whole leaf tea for a strong, aromatic cup. Perfect with milk for the classic Nepali masala chai experience. Box of 50 bags.',
        isFeatured: false,
        tags: ['tea', 'tata', 'grocery', 'beverage'],
        variants: [
          { sku: 'TATA-TEA-50', attributes: { count: '50 bags', type: 'Gold' }, price: 49900, comparePrice: 59900, stock: 150, images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Patanjali Pure Cow Ghee 1kg',
        slug: 'patanjali-cow-ghee-1kg',
        description: 'Made from pure cow milk using traditional Bilona method. Rich in vitamins A, D, E, and K. Used for cooking, religious rituals, and Ayurvedic health practices.',
        isFeatured: false,
        tags: ['ghee', 'patanjali', 'dairy', 'organic', 'grocery'],
        variants: [
          { sku: 'PAT-GHEE-1KG', attributes: { weight: '1kg' }, price: 89900, comparePrice: 99900, stock: 60, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Himalayan Pink Salt 1kg',
        slug: 'himalayan-pink-salt-1kg',
        description: 'Unrefined, naturally harvested pink salt from the Himalayan mountains. Rich in 84+ trace minerals. Use in cooking or as a bath salt. Packaged in resealable bag.',
        isFeatured: false,
        tags: ['salt', 'himalayan', 'organic', 'mineral', 'grocery'],
        variants: [
          { sku: 'HPS-1KG-FINE', attributes: { weight: '1kg', grind: 'Fine' }, price: 29900, comparePrice: undefined, stock: 200, images: ['https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],

    ['toys', bookVendorId, [
      {
        name: 'LEGO Classic Creative Bricks 790 Pieces',
        slug: 'lego-classic-creative-bricks-790',
        description: '790 LEGO bricks in 33 classic LEGO colors. Build cars, animals, houses, or anything you imagine. Great for developing creativity and motor skills. For ages 4+.',
        isFeatured: true,
        tags: ['lego', 'building-blocks', 'toys', 'kids', 'creative'],
        variants: [
          { sku: 'LEGO-CLX-790', attributes: { pieces: '790', ageRange: '4+' }, price: 399900, comparePrice: 499900, stock: 15, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Hot Wheels 10-Car Gift Pack',
        slug: 'hot-wheels-10-car-pack',
        description: '10 die-cast Hot Wheels cars in assorted styles. Each car is 1:64 scale. Authentic designs with cool racing graphics. Great for collectors and kids 3+.',
        isFeatured: false,
        tags: ['hot-wheels', 'cars', 'diecast', 'toys', 'boys'],
        variants: [
          { sku: 'HW-10CAR', attributes: { count: '10 cars', scale: '1:64' }, price: 129900, comparePrice: 149900, stock: 25, images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Barbie Fashionista Doll with Accessories',
        slug: 'barbie-fashionista-doll',
        description: 'Barbie doll in trendy outfit with accessories including a handbag, shoes, and jewelry. Long blonde hair. Promotes imagination and storytelling. For ages 3+.',
        isFeatured: false,
        tags: ['barbie', 'doll', 'toys', 'girls', 'fashionista'],
        variants: [
          { sku: 'BARBIE-FASH-PNK', attributes: { outfit: 'Pink Dress', hair: 'Blonde' }, price: 149900, comparePrice: 179900, stock: 20, images: ['https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Monopoly Classic Board Game',
        slug: 'monopoly-classic-board-game',
        description: 'The classic real estate trading board game. Buy, sell, and trade properties. Build houses and hotels. First player to bankrupt all opponents wins. For 2-8 players, ages 8+.',
        isFeatured: false,
        tags: ['monopoly', 'board-game', 'family', 'strategy', 'kids'],
        variants: [
          { sku: 'MONO-CLASSIC', attributes: { edition: 'Classic', players: '2-8' }, price: 249900, comparePrice: undefined, stock: 18, images: ['https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
      {
        name: 'Remote Control Car Off-Road Monster Truck',
        slug: 'rc-monster-truck-offroad',
        description: '2.4GHz radio-controlled monster truck with 4-wheel drive. Goes up to 30km/h on rough terrain. Rechargeable 7.4V battery. 30-minute playtime. For ages 6+.',
        isFeatured: true,
        tags: ['rc-car', 'remote-control', 'monster-truck', 'toys', 'boys'],
        variants: [
          { sku: 'RC-MT-RED', attributes: { color: 'Red', speed: '30km/h' }, price: 299900, comparePrice: 399900, stock: 12, images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop&auto=format&q=80'] },
          { sku: 'RC-MT-BLU', attributes: { color: 'Blue', speed: '30km/h' }, price: 299900, comparePrice: 399900, stock: 10, images: ['https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&h=400&fit=crop&auto=format&q=80'] },
        ],
      },
    ]],
  ]

  let productCount = 0
  for (const [catSlug, vendorId, products] of productsByCategory) {
    const categoryId = cats[catSlug]
    for (const p of products) {
      await prisma.product.create({
        data: {
          vendorId,
          categoryId,
          name: p.name,
          slug: p.slug,
          description: p.description,
          status: 'ACTIVE',
          isFeatured: p.isFeatured ?? false,
          tags: p.tags,
          variants: {
            create: p.variants.map((v) => ({
              sku: v.sku,
              attributes: v.attributes,
              price: v.price,
              comparePrice: v.comparePrice ?? null,
              stock: v.stock,
              reservedStock: 0,
              images: v.images,
              isActive: true,
            })),
          },
        },
      })
      productCount++
    }
  }
  console.log(`  ✓ ${productCount} products created across 8 categories`)

  // ─── Coupons ─────────────────────────────────────────────────────────────
  const now = new Date()
  const yearEnd = new Date('2026-12-31T23:59:59Z')
  const midYear = new Date('2026-08-31T23:59:59Z')

  const coupons = [
    {
      code: 'WELCOME10',
      type: 'PERCENTAGE' as const,
      value: 10,
      minOrderAmount: 0,
      maxDiscountAmount: 100000,
      maxUses: 500,
      perUserLimit: 1,
      validFrom: now,
      validUntil: yearEnd,
      isActive: true,
    },
    {
      code: 'SAVE500',
      type: 'FIXED' as const,
      value: 50000,
      minOrderAmount: 200000,
      maxUses: 200,
      validFrom: now,
      validUntil: yearEnd,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      type: 'FREE_SHIPPING' as const,
      value: 0,
      minOrderAmount: 50000,
      validFrom: now,
      validUntil: yearEnd,
      isActive: true,
    },
    {
      code: 'FLASH25',
      type: 'PERCENTAGE' as const,
      value: 25,
      minOrderAmount: 100000,
      maxDiscountAmount: 100000,
      maxUses: 100,
      perUserLimit: 1,
      validFrom: now,
      validUntil: midYear,
      isActive: true,
    },
    {
      code: 'TECHSALE15',
      type: 'PERCENTAGE' as const,
      value: 15,
      minOrderAmount: 500000,
      maxDiscountAmount: 200000,
      maxUses: 50,
      perUserLimit: 2,
      validFrom: now,
      validUntil: midYear,
      isActive: true,
    },
    {
      code: 'DASHAIN200',
      type: 'FIXED' as const,
      value: 20000,
      minOrderAmount: 100000,
      maxUses: 300,
      perUserLimit: 1,
      validFrom: now,
      validUntil: new Date('2026-10-31T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'EXPIRED50',
      type: 'PERCENTAGE' as const,
      value: 50,
      minOrderAmount: 0,
      maxUses: 10,
      validFrom: new Date('2025-01-01'),
      validUntil: new Date('2025-12-31'),
      isActive: false,
    },
  ]

  for (const c of coupons) {
    await prisma.coupon.create({ data: c })
  }
  console.log('  ✓ 7 coupons created (6 active, 1 expired demo)')

  console.log('\n✅ Seeding complete!\n')
  console.log('─────────────────────────────────────────────')
  console.log('LOGIN CREDENTIALS')
  console.log('─────────────────────────────────────────────')
  console.log('Admin:    admin@hamrobazaar.com  /  Admin@123')
  console.log('Vendor:   tech@vendor.com        /  Vendor@123')
  console.log('          fashion@vendor.com     /  Vendor@123')
  console.log('          home@vendor.com        /  Vendor@123')
  console.log('          sport@vendor.com       /  Vendor@123')
  console.log('          books@vendor.com       /  Vendor@123')
  console.log('Customer: ram@test.com           /  Test@1234')
  console.log('          sita@test.com          /  Test@1234')
  console.log('Delivery: driver@delivery.com    /  Driver@123')
  console.log('─────────────────────────────────────────────')
  console.log('ACTIVE COUPONS')
  console.log('─────────────────────────────────────────────')
  console.log('WELCOME10  — 10% off (max Rs.1000), 1x per user')
  console.log('SAVE500    — Rs.500 off, min order Rs.2000')
  console.log('FREESHIP   — Free shipping, min order Rs.500')
  console.log('FLASH25    — 25% off (max Rs.1000), min Rs.1000')
  console.log('TECHSALE15 — 15% off (max Rs.2000), min Rs.5000')
  console.log('DASHAIN200 — Rs.200 off, min order Rs.1000')
  console.log('─────────────────────────────────────────────\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
