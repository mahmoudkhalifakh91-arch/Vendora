/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncVendoraOrderWithWaslha } from '../services/waslhaSync';
import { db } from '../../وصلها---خدمة-التوصيل-الذكية/services/firebase';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  Product, 
  Order, 
  CartItem, 
  Ticket, 
  ChatMessage, 
  Language, 
  Theme, 
  Notification, 
  User, 
  StoredUser,
  Seller,
  SellerWallet,
  Transaction,
  PayoutRequest,
  UserRole,
  PromoCoupon
} from '../types';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  tickets: Ticket[];
  chatMessages: ChatMessage[];
  cart: CartItem[];
  language: Language;
  theme: Theme;
  notifications: Notification[];
  currentOrderTrackingId: string;
  showWalkthrough: boolean;
  activeChatOpen: boolean;
  adminMode: boolean;
  notificationLogs: string[]; // Logs of simulated WhatsApp/Email alerts
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  currentUser: User | null;
  users: StoredUser[];
  
  // Multi-vendor Platform State
  sellers: Seller[];
  globalCommissionRate: number;
  transactions: Transaction[];
  payoutRequests: PayoutRequest[];
  wallets: Record<string, SellerWallet>;

  // Promotions/Coupons system
  promoCoupons: PromoCoupon[];
  addPromoCoupon: (coupon: Omit<PromoCoupon, 'id' | 'dateCreated'>) => void;
  updatePromoCoupon: (coupon: PromoCoupon) => void;
  deletePromoCoupon: (couponId: string) => void;

  // Handlers
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (
    customer: { 
      name: string; 
      email: string; 
      phone: string; 
      city: string; 
      address: string; 
      paymentMethod: 'card' | 'instapay' | 'meeza' | 'cod' 
    }, 
    discountAmount?: number, 
    couponCode?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: 'pending' | 'preparing' | 'shipping' | 'delivered') => void;
  addTicket: (type: 'complaint' | 'suggestion' | 'inquiry', name: string, email: string, title: string, description: string) => void;
  sendChatMessage: (text: string, sender: 'user' | 'agent') => void;
  trackOrder: (id: string) => Order | undefined;
  dismissWalkthrough: () => void;
  resetWalkthrough: () => void;
  setActiveChatOpen: (open: boolean) => void;
  setAdminMode: (admin: boolean) => void;
  setCurrentOrderTrackingId: (id: string) => void;
  registerUser: (name: string, email: string, phone: string, passwordHash: string) => { success: boolean; errorEn: string; errorAr: string };
  registerAdmin: (name: string, email: string, phone: string, passwordHash: string) => { success: boolean; errorEn: string; errorAr: string };
  loginUser: (email: string, passwordHash: string) => { success: boolean; errorEn: string; errorAr: string };
  logoutUser: () => void;
  updateUserProfile: (name: string, phone: string) => { success: boolean };
  
  // Product Admin Operations
  addProduct: (product: Omit<Product, 'id' | 'reviews' | 'rating' | 'salesCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (productId: string, rating: number, comment: string, userName: string) => void;
  clearLogs: () => void;

  // Multi-Vendor Operations
  registerSeller: (params: { name: string; email: string; phone: string; passwordHash: string; storeName: string; bioAr: string; bioEn: string; contactAddress: string; logo: string; banner: string }) => { success: boolean; errorEn: string; errorAr: string };
  approveSeller: (sellerId: string) => void;
  rejectSeller: (sellerId: string) => void;
  updateSellerCommissionRate: (sellerId: string, rate: number) => void;
  setGlobalCommissionRate: (rate: number) => void;
  createPayoutRequest: (params: { sellerId: string; amount: number; paymentMethod: 'bank_transfer' | 'instapay' | 'vodafone_cash'; paymentDetails: string }) => { success: boolean; errorEn: string; errorAr: string };
  approvePayoutRequest: (requestId: string) => void;
  rejectPayoutRequest: (requestId: string, reason?: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// SEED VENDORS
const SEED_SELLERS: Seller[] = [
  {
    id: 'seller-al_quds',
    name: 'المهندس شريف الخطيب',
    email: 'quds.feeds@azstore.eg',
    phone: '01015678912',
    storeName: 'القدس للأعلاف والإنتاج الداجني',
    logo: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=60',
    bioAr: 'القدس لإنتاج علف الدواجن والماشية عالي الجودة والبروتين بأسعار ممتازة وخامات مستوردة معتمدة من وزارة الزراعة.',
    bioEn: 'Al-Quds produces high-quality feed for poultry & livestock using premium certified imported raw materials.',
    contactAddress: 'المنطقة الصناعية، مدينة السادات، محافظة المنوفية',
    rating: 4.8,
    status: 'approved',
    customCommissionRate: 10,
    reviewsCount: 42,
    joinedDate: '2026-01-15'
  },
  {
    id: 'seller-vet_pharma',
    name: 'د. أسامة عبد الرحمن',
    email: 'nile.vet@azstore.eg',
    phone: '01122334455',
    storeName: 'النيل للمستحضرات الطبية والأدوية البيطرية',
    logo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=60',
    bioAr: 'مستودع رائد فائق الأمان لتوفير الأدوية البيطرية واللقاحات والمكملات الغذائية ومضادات السموم بمواصفات عالمية.',
    bioEn: 'A leading secure distributor of premium veterinary pharmaceuticals, vaccines, and high-potency nutritional additives.',
    contactAddress: 'شارع قصر العيني، وسط البلد، القاهرة',
    rating: 4.7,
    status: 'approved',
    customCommissionRate: 8,
    reviewsCount: 29,
    joinedDate: '2026-02-10'
  },
  {
    id: 'seller-delta_agri',
    name: 'م. محمود الشهاوي',
    email: 'delta.agri@azstore.eg',
    phone: '01223456789',
    storeName: 'الدلتا لمعدات الري والشبكات الزراعية',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=1000&auto=format&fit=crop&q=60',
    bioAr: 'توفير خراطيم الري بالتنقيط المتطورة، قطع غيار المطاحن وخطوط الإنتاج، والمعدات الهندسية الداعمة للميكنة الزراعية الحديثة.',
    bioEn: 'Delivering top-grade drip irrigation layouts, wear-resistant feed mill hammers, and engineering accessories.',
    contactAddress: 'طريق طنطا الإسكندرية الزراعي، كفر الزيات، الغربية',
    rating: 4.9,
    status: 'approved',
    customCommissionRate: 12,
    reviewsCount: 56,
    joinedDate: '2026-01-05'
  }
];

// SEED PRODUCTS INTEGRATING FEED, VET AND SPARE PARTS
const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-feed-1',
    nameEn: 'Super fattening poultry broiler feed (Premium protein 21%)',
    nameAr: 'علف بادي نامي تسمين سوبر دواجن (بروتين 21%)',
    descriptionEn: 'An highly specialized formulation designed with yellow corn, imported soybean meal, and customized enzymes. Perfect feed efficiency and optimal weight gain.',
    descriptionAr: 'علف متكامل مصنع بأحدث التقنيات يضم ذرة صفراء، كسب فول صويا مستورد وانزيمات هضم لتحقيق أعلى معدل تحويل غذائي وأوزان دواجن ممتازة آمنة.',
    price: 24500, // per ton
    image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500&auto=format&fit=crop&q=60',
    category: 'feed',
    rating: 4.9,
    salesCount: 88,
    stock: 25,
    featured: true,
    sellerId: 'seller-al_quds',
    sellerName: 'المهندس شريف الخطيب',
    sellerStore: 'القدس للأعلاف والإنتاج الداجني',
    batchNumber: 'BND-2026-05A',
    productionDate: '2026-05-10',
    expiryDate: '2027-05-10',
    supplierInfo: 'imported ingredients processing hub',
    warehouseLocation: 'Warehouse A - Silo 4',
    minStockLevel: 5,
    stockAlert: false,
    reviews: [
      { id: 'rev-feed-1', userName: 'أبو أحمد الداجني', rating: 5, comment: 'علف فائق الجودة ونسبة التحويل ممتازة فرقت معايا جداً في الدورة', date: '2026-05-20' }
    ]
  },
  {
    id: 'prod-feed-2',
    nameEn: 'Veterinary Probiotic Yeast digestive booster',
    nameAr: 'مستخلص خمائر بروبايوتك معزز للمناعة والهضم للماشية',
    descriptionEn: 'High density pure biological yeast extract which repopulates gut flora, improves nutrient absorption, and boosts milk production.',
    descriptionAr: 'منشط هضم بيولوجي طبيعي مئة بالمئة يحتوي على سلالات حية لدعم الكرش العضوي وتحفيز إنتاج اللبن وتعزيز قدرة الماشية على مقاومة الإجهاد.',
    price: 850,
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
    category: 'additives',
    rating: 4.8,
    salesCount: 154,
    stock: 120,
    featured: true,
    sellerId: 'seller-al_quds',
    sellerName: 'المهندس شريف الخطيب',
    sellerStore: 'القدس للأعلاف والإنتاج الداجني',
    batchNumber: 'PBO-8821',
    productionDate: '2026-04-01',
    expiryDate: '2028-04-01',
    supplierInfo: 'Novozymes Biotech Denmark',
    warehouseLocation: 'Warehouse B - Shelf Row 3',
    minStockLevel: 20,
    stockAlert: false,
    reviews: []
  },
  {
    id: 'prod-vet-1',
    nameEn: 'Veterinary Oxytetracycline Long-Acting Injection 20%',
    nameAr: 'مضاد حيوي تيرامايسين ممتد المفعول 20% للماشية',
    descriptionEn: 'Broad-spectrum antibiotic injection for the control and treatment of bovine respiratory disease, shipping fever and infectious foot rot.',
    descriptionAr: 'مضاد حيوي واسع المدى ممتد المفعول مخصص لعلاج والوقاية من الالتهاب الرئوي، حمى النقل والتعفن الحافر البكتيري في الأبقار والماشية.',
    price: 490,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    category: 'vet',
    rating: 4.7,
    salesCount: 220,
    stock: 4,
    featured: true,
    sellerId: 'seller-vet_pharma',
    sellerName: 'د. أسامة عبد الرحمن',
    sellerStore: 'النيل للمستحضرات الطبية والأدوية البيطرية',
    batchNumber: 'OTC-200-EGY',
    productionDate: '2026-03-15',
    expiryDate: '2028-03-15',
    supplierInfo: 'Nile Chemical Industries Egypt',
    warehouseLocation: 'Cold Storage Room Unit 1',
    minStockLevel: 10,
    stockAlert: true,
    reviews: [
      { id: 'rev-vet-1', userName: 'سفيان الغرباوي (طبيب بيطري)', rating: 5, comment: 'مفعوله ممتاز وسعره مناسب جداً، دواء أصيل لا غنى عنه في المزرعة', date: '2026-06-02' }
    ]
  },
  {
    id: 'prod-agri-1',
    nameEn: 'Delta Heavy-Duty Agricultural Drip Irrigation Pipe Roll (400m)',
    nameAr: 'لفافة خراطيم ري بالتنقيط الدلتا عالية التحمل (400 متر)',
    descriptionEn: 'Excellent flexible anti-clogging drip roll with standard 30cm spacing emitters designed to withstand harsh desert soils and high solar heat.',
    descriptionAr: 'لفة خرطوم ري بالتنقيط ممتازة مقاومة للانسداد والملوحة، بمسافات تنقيط قياسية 30 سم مغلفة لحمايتها من أشعة الشمس المباشرة الحارقة بمصر.',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60',
    category: 'agricultural',
    rating: 4.9,
    salesCount: 45,
    stock: 32,
    sellerId: 'seller-delta_agri',
    sellerName: 'م. محمود الشهاوي',
    sellerStore: 'الدلتا لمعدات الري والشبكات الزراعية',
    batchNumber: 'IRR-PE-16',
    productionDate: '2026-01-20',
    expiryDate: '2036-01-20',
    supplierInfo: 'Delta Plastic Extrusion Factory',
    warehouseLocation: 'Open Yard Row G',
    minStockLevel: 5,
    stockAlert: false,
    reviews: []
  },
  {
    id: 'prod-spare-1',
    nameEn: 'Titanium-Alloy Feed Mill Hammer Beater Set (12-Piece)',
    nameAr: 'طقم مطارق مفرمة وكباس أعلاف تيتانيوم مقوى (12 قطعة)',
    descriptionEn: 'High shear wear-resistant titanium alloy beaters. Extends lifecycle of feed crushing mill machinery under heavy-duty operations.',
    descriptionAr: 'مجموعة مكونة من 12 شاكوش طحن وتنعيم أعلاف مصنعة من سبيكة تيتانيوم صلب لتتحمل سرعات الدوران العالية وتقاوم التآكل في المصانع الكبرى.',
    price: 3600,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
    category: 'spare_parts',
    rating: 5.0,
    salesCount: 19,
    stock: 15,
    sellerId: 'seller-delta_agri',
    sellerName: 'م. محمود الشهاوي',
    sellerStore: 'الدلتا لمعدات الري والشبكات الزراعية',
    batchNumber: 'HAM-IND-T1',
    productionDate: '2026-02-05',
    expiryDate: '2046-02-05',
    supplierInfo: 'Ezz Steel & Alloy Castings',
    warehouseLocation: 'Heavy Spare Parts Bay 2',
    minStockLevel: 3,
    stockAlert: false,
    reviews: []
  },
  {
    id: 'prod-1',
    nameEn: 'iPhone 15 Pro Max (Titanium)',
    nameAr: 'آيفون 15 برو ماكس (تيتانيوم)',
    descriptionEn: 'The latest Apple masterpiece featuring durable lightweight aerospace-grade titanium design and high performance A17 Pro chip.',
    descriptionAr: 'أحدث تحفة من أبل بتصميم التيتانيوم القوي والخفيف المتوافق مع معايير الطيران، ومعالج A17 برو الخارق.',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
    category: 'mobiles',
    rating: 4.8,
    salesCount: 142,
    stock: 12,
    featured: true,
    reviews: [
      { id: 'rev-1', userName: 'Ahmed Ali', rating: 5, comment: 'ممتاز والشحن سريع جداً', date: '2026-06-01' },
      { id: 'rev-2', userName: 'Sarah Hassan', rating: 4.5, comment: 'Original product and excellent service!', date: '2026-06-03' }
    ]
  },
  {
    id: 'prod-2',
    nameEn: 'Egyptian Cotton Premium Bedding Set',
    nameAr: 'طقم ملاءات قطن مصري فاخر',
    descriptionEn: 'Woven from 100% long-staple certified Egyptian organic cotton, providing unparalleled silkiness and comfort for a deep sleep.',
    descriptionAr: 'منسوج من قطن مصري عضوي طويل التيلة 100٪، يوفر ملمساً ناعماً كالبلور وراحة لا تضاهى لنوم عميق ومريح.',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&auto=format&fit=crop&q=60',
    category: 'home_kitchen',
    rating: 4.9,
    salesCount: 320,
    stock: 45,
    featured: true,
    reviews: [
      { id: 'rev-3', userName: 'Noha Gamal', rating: 5, comment: 'جودة لا تصدق، قطن مصري أصيل ناعم ومريح للغاية', date: '2026-05-28' }
    ]
  },
  {
    id: 'prod-accessories-1',
    nameEn: 'Anker PowerCore Ultra-Compact 20000mAh Power Bank',
    nameAr: 'شاحن سفري أنكر باوركور فائق الصغر بسعة 20000 مللي أمبير',
    descriptionEn: 'High capacity portable power bank with high-speed charging technology, double output ports, and durable heavy-duty shell.',
    descriptionAr: 'شاحن سفري بسعة ضخمة وتقنية شحن سريع ذكية من أنكر، بفتحات شحن مزدوجة وهيكل متين مضاد للصدمات.',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1609592424085-f5899dddc832?w=500&auto=format&fit=crop&q=60',
    category: 'electronics_accessories',
    rating: 4.8,
    salesCount: 198,
    stock: 80,
    featured: true,
    reviews: []
  },
  {
    id: 'prod-games-1',
    nameEn: 'Sony PlayStation 4 Slim 1TB + Spider-Man Bundle',
    nameAr: 'جهاز بلايستيشن 4 سليم 1 تيرابايت مع حزمة لعبة سبايدرمان',
    descriptionEn: 'PlayStation 4 Slim console with high-definition HDR gaming performance, bundled with Marvel\'s Spider-Man physical card game disc.',
    descriptionAr: 'جهاز تشغيل ألعاب بلايستيشن 4 سليم بسعة تخزين 1 تيرابايت ودعم دقة HDR، مصحوباً بقرص لعبة مارفل سبايدرمان للتسلية والمغامرة المتكاملة.',
    price: 18900,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop&q=60',
    category: 'video_games',
    rating: 4.9,
    salesCount: 74,
    stock: 15,
    featured: true,
    reviews: []
  },
  {
    id: 'prod-perfumes-1',
    nameEn: 'Gucci Guilty Pour Homme Eau de Parfum Elegance',
    nameAr: 'عطر قوتشي غيلتي بور هوم أو دو بارفان الفاخر',
    descriptionEn: 'A modern, rich, olfactory expression of self-expression and sensuality, designed for the contemporary elegant gentleman.',
    descriptionAr: 'تعبير عطري عصري فاخر يتميز بمزيج ساحر من النوتات الخشبية والورد المثير والأرز الدافئ للرجال الأنيقين.',
    price: 4300,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60',
    category: 'perfumes',
    rating: 4.8,
    salesCount: 110,
    stock: 30,
    featured: false,
    reviews: []
  },
  {
    id: 'prod-laptops-1',
    nameEn: 'Apple MacBook Pro 14-inch M3 Liquid Retina',
    nameAr: 'كمبيوتر أبل ماك بوك برو 14 بوصة بمعالج إم 3 ماكس ديسيبل',
    descriptionEn: 'Workstation laptop featuring the hyper-efficient Apple M3 chip, beautiful Liquid Retina XDR display, and incredible 22-hour battery life.',
    descriptionAr: 'حاسوب ماك بوك برو فائق الأداء والسرعة بشاشة ليكويد ريتنا فائفة الوضوح وبطارية تدوم حتى 22 ساعة عمل متواصل من أبل.',
    price: 92000,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
    category: 'laptops',
    rating: 4.9,
    salesCount: 42,
    stock: 9,
    featured: true,
    reviews: []
  },
  {
    id: 'prod-cosmetics-1',
    nameEn: 'Essence Lash Princess False Lash Effect Mascara Black',
    nameAr: 'ماسكارا لاش برينسيس لتكثيف وتطويل الرموش من ايسنس',
    descriptionEn: 'Ultra-famous lash definition mascara giving the dramatic false lash look without clumping or flaking. Cruelty-free formula.',
    descriptionAr: 'الماسكارا الأشهر عالمياً بفرشاة مخروطية تمنح رموشاً كثيفة وطويلة للغاية تبدو كرموش بديلة مع ثبات ممتاز طوال اليوم ومقاومة للتكتل.',
    price: 380,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=60',
    category: 'cosmetics',
    rating: 4.7,
    salesCount: 520,
    stock: 140,
    featured: false,
    reviews: []
  },
  {
    id: 'prod-coffee-1',
    nameEn: 'Saachi Espresso Maker Coffee Machine with Steam nozzle',
    nameAr: 'ماكينة إعداد قهوة وإسبريسو ساتشي مع فوهة بخار',
    descriptionEn: 'High-pressure espresso maker features a 15-bar pump system, frothing wand for creamy lattes and cappuccinos, compact metallic finish.',
    descriptionAr: 'ماكينة إسبريسو وكابتشينو متكاملة بقوة ضغط 15 بار فائق الكفاءة، مع صانع رغوة حليب مدمج لتحضير أشهى المشروبات الساخنة بالمنزل.',
    price: 5400,
    image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0c6f?w=500&auto=format&fit=crop&q=60',
    category: 'home_kitchen',
    rating: 4.8,
    salesCount: 145,
    stock: 22,
    featured: true,
    reviews: []
  }
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    titleEn: 'Egypt Expansion Celebration! 🎉',
    titleAr: 'المنصة تدعم دمج كبار تجار الأعلاف والأدوية البيطرية! 🎉',
    bodyEn: 'We have updated our marketplace platform to host Egypt\'s biggest vendors for Animal Feeds, Supplements, and Spare parts!',
    bodyAr: 'تم تفعيل نظام كبار وكلاء تجار الأعلاف والمستحضرات الدوائية والبيطرية ومعدات الري بالتنقيط لتوفير عروض مباشرة من المصانع بأسعار حصرية.',
    type: 'offer',
    date: '2026-06-08'
  }
];

// Seed initial transaction history to populate analytics immediately
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-seed-1',
    sellerId: 'seller-al_quds',
    orderId: 'VD-48903-QUDS',
    type: 'sale',
    amount: 49000,
    commissionAmount: 4900,
    netAmount: 44100,
    status: 'cleared',
    date: '2026-06-01',
    descriptionEn: 'Bulk purchase of 2 Tons of Broiler Fattening Feed',
    descriptionAr: 'شراء نسيجي لكمية 2 طن علف تسمين بادي دواجن'
  },
  {
    id: 'tx-seed-2',
    sellerId: 'seller-vet_pharma',
    orderId: 'VD-11802-NILE',
    type: 'sale',
    amount: 1960,
    commissionAmount: 156.8,
    netAmount: 1803.2,
    status: 'cleared',
    date: '2026-06-04',
    descriptionEn: 'Purchase of 4 packs of Terramycin Injections',
    descriptionAr: 'شراء 4 عبوات تيرامايسين ممتد المفعول للماشية'
  }
];

// Seed initial wallet balances to support payout simulations immediately
const INITIAL_WALLETS: Record<string, SellerWallet> = {
  'seller-al_quds': {
    sellerId: 'seller-al_quds',
    balance: 44100,
    pendingBalance: 0,
    withdrawableBalance: 44100
  },
  'seller-vet_pharma': {
    sellerId: 'seller-vet_pharma',
    balance: 1803.2,
    pendingBalance: 1500,
    withdrawableBalance: 1803.2
  },
  'seller-delta_agri': {
    sellerId: 'seller-delta_agri',
    balance: 0,
    pendingBalance: 0,
    withdrawableBalance: 0
  }
};

const SEED_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'payout-1',
    sellerId: 'seller-al_quds',
    sellerName: 'المهندس شريف الخطيب',
    sellerStore: 'القدس للأعلاف والإنتاج الداجني',
    amount: 15000,
    paymentMethod: 'instapay',
    paymentDetails: 'sharif@instapay',
    status: 'pending',
    date: '2026-06-07'
  }
];

const SEED_PROMO_COUPONS: PromoCoupon[] = [
  {
    id: 'promo-free-egypt',
    code: 'FREE_EGYPT',
    titleEn: 'Free Shipping Coupon in Egypt ⚡',
    titleAr: 'قسيمة الشحن المجاني بمصر ⚡',
    descriptionEn: 'Use checkout code to get fully free shipping on all orders.',
    descriptionAr: 'استخدم كود الخصم الفوري لمضاعفة المبيعات والحصول على شحن مجاني بالكامل لكافة مشترياتك هذا اليوم.',
    discountType: 'free_shipping',
    discountValue: 0,
    minCartTotal: 1000,
    requiredCategory: 'all',
    minItemsCount: 1,
    isActive: true,
    termsDetailsAr: '*صالح لكل المحافظات والطلب الفردي',
    termsDetailsEn: '*Valid for all governorates and single orders',
    dateCreated: '2026-06-09'
  },
  {
    id: 'promo-gadget-15',
    code: 'MOBILE15',
    titleEn: '15% Off on premium smartphones 📱',
    titleAr: 'خصم 15% على الموبايلات وهواتف الذكية 📱',
    descriptionEn: 'Exclusive promo code for top-tier mobiles and smart devices.',
    descriptionAr: 'كود خصم بنسبة 15% على المشتريات من قسم الموبايلات.',
    discountType: 'percentage',
    discountValue: 15,
    minCartTotal: 15000,
    requiredCategory: 'mobiles',
    minItemsCount: 1,
    isActive: true,
    termsDetailsAr: '*صالح فقط لأقسام الهواتف الذكية والموبايل',
    termsDetailsEn: '*Valid only for smart mobile categories',
    dateCreated: '2026-06-09'
  }
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // PERSISTENCE LOADING SAFELY WITH MULTI-VENDOR
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('az_store_products');
    return saved ? JSON.parse(saved) : SEED_PRODUCTS;
  });

  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('az_store_sellers');
    return saved ? JSON.parse(saved) : SEED_SELLERS;
  });

  const [globalCommissionRate, setGlobalCommissionState] = useState<number>(() => {
    const saved = localStorage.getItem('az_store_global_commission');
    return saved ? parseFloat(saved) : 10;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('az_store_transactions');
    return saved ? JSON.parse(saved) : SEED_TRANSACTIONS;
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const saved = localStorage.getItem('az_store_payouts');
    return saved ? JSON.parse(saved) : SEED_PAYOUT_REQUESTS;
  });

  const [wallets, setWallets] = useState<Record<string, SellerWallet>>(() => {
    const saved = localStorage.getItem('az_store_wallets');
    return saved ? JSON.parse(saved) : INITIAL_WALLETS;
  });

  const [users, setUsers] = useState<StoredUser[]>(() => {
    const saved = localStorage.getItem('az_store_users');
    let loadedUsers: StoredUser[] = [];
    if (saved) {
      try {
        loadedUsers = JSON.parse(saved);
      } catch (e) {
        loadedUsers = [];
      }
    }
    
    if (loadedUsers.length === 0) {
      loadedUsers = [
        {
          id: 'user-default',
          name: 'أحمد محمود',
          email: 'ahmed@azstore.eg',
          phone: '01012345678',
          passwordHash: '123456',
          role: 'customer'
        }
      ];
    }

    // Always ensure Super Admin is seeded
    const hasSuperAdmin = loadedUsers.some(u => u.email.toLowerCase() === 'mahmoudkhalifa.kh91@gmail.com');
    if (!hasSuperAdmin) {
      loadedUsers.push({
        id: 'user-superadmin',
        name: 'محمود خليفة (المدير العام)',
        email: 'mahmoudkhalifa.kh91@gmail.com',
        phone: '01207466466',
        passwordHash: '01207466466',
        role: 'superadmin'
      });
    } else {
      // make sure Super Admin has the correct role and password in database
      loadedUsers = loadedUsers.map(u => {
        if (u.email.toLowerCase() === 'mahmoudkhalifa.kh91@gmail.com') {
          return {
            ...u,
            role: 'superadmin',
            passwordHash: '01207466466' // maintain correct details
          };
        }
        return u;
      });
    }

    // Seed default seller credentials so users can log in as seeded sellers directly to test
    const sellersToSeed = [
      { id: 'user-seller-al_quds', name: 'المهندس شريف الخطيب', email: 'quds.feeds@azstore.eg', phone: '01015678912', passwordHash: '123456', role: 'seller' as UserRole },
      { id: 'user-seller-vet_pharma', name: 'د. أسامة عبد الرحمن', email: 'nile.vet@azstore.eg', phone: '01122334455', passwordHash: '123456', role: 'seller' as UserRole },
      { id: 'user-seller-delta_agri', name: 'م. محمود الشهاوي', email: 'delta.agri@azstore.eg', phone: '01223456789', passwordHash: '123456', role: 'seller' as UserRole }
    ];

    sellersToSeed.forEach(s => {
      const exists = loadedUsers.some(u => u.email.toLowerCase() === s.email.toLowerCase());
      if (!exists) {
        loadedUsers.push(s);
      }
    });

    return loadedUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('az_store_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('az_store_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('az_store_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('az_store_chat');
    return saved ? JSON.parse(saved) : [
      { id: '1', sender: 'agent', text: 'مرحباً بك في سوق المزارعين وتجار الخامات المتكامل! كيف يمكنني مساعدتك اليوم؟ 😊', timestamp: '11:00 AM' },
      { id: '2', sender: 'agent', text: 'Welcome to the Feed & Agri Marketplace! We host certified premium suppliers. How can we support your farming business today?', timestamp: '11:01 AM' }
    ];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('az_store_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('az_store_language');
    return (saved as Language) || 'ar';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('az_store_theme');
    return (saved as Theme) || 'light';
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('az_store_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [currentOrderTrackingId, setCurrentOrderTrackingId] = useState<string>(() => {
    return localStorage.getItem('az_store_tracking_id') || '';
  });

  const [showWalkthrough, setShowWalkthrough] = useState<boolean>(() => {
    const saved = localStorage.getItem('az_store_walkthrough_dismissed');
    return saved !== 'true';
  });

  const [activeChatOpen, setActiveChatOpen] = useState<boolean>(false);
  const [adminMode, setAdminMode] = useState<boolean>(false);
  const [notificationLogs, setNotificationLogs] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  const [promoCoupons, setPromoCoupons] = useState<PromoCoupon[]>(() => {
    const saved = localStorage.getItem('az_store_coupons');
    return saved ? JSON.parse(saved) : SEED_PROMO_COUPONS;
  });

  // Synchronize dynamic collections with LocalStorage
  useEffect(() => {
    localStorage.setItem('az_store_coupons', JSON.stringify(promoCoupons));
  }, [promoCoupons]);

  useEffect(() => {
    localStorage.setItem('az_store_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('az_store_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('az_store_global_commission', globalCommissionRate.toString());
  }, [globalCommissionRate]);

  useEffect(() => {
    localStorage.setItem('az_store_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('az_store_payouts', JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    localStorage.setItem('az_store_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('az_store_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('az_store_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('az_store_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('az_store_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('az_store_language', language);
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('az_store_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('az_store_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('az_store_tracking_id', currentOrderTrackingId);
  }, [currentOrderTrackingId]);

  useEffect(() => {
    localStorage.setItem('az_store_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('az_store_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('az_store_current_user');
    }
  }, [currentUser]);

  // General state toggles
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const setTheme = (t: Theme) => setThemeState(t);
  const toggleLanguage = () => setLanguageState(prev => (prev === 'ar' ? 'en' : 'ar'));
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    addMockPushNotification(
      'Product added to Cart 🛒',
      'تم إضافة المنتج إلى السلة 🛒',
      `"${language === 'ar' ? product.nameAr : product.nameEn}" added.`,
      `تم إدخال "${language === 'ar' ? product.nameAr : product.nameEn}" في سلة التسوق.`
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(quantity, item.product.stock) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const addMockPushNotification = (titleEn: string, titleAr: string, bodyEn: string, bodyAr: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      titleEn,
      titleAr,
      bodyEn,
      bodyAr,
      type: 'status_update',
      date: new Date().toISOString().split('T')[0]
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const logNotification = (msg: string) => {
    setNotificationLogs(prev => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev
    ]);
  };

  // MULTI-VENDOR SPLIT-ORDER CHECKOUT IMPLEMENTATION
  const placeOrder = (customer: {
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    paymentMethod: 'card' | 'instapay' | 'meeza' | 'cod';
  }, discountAmount = 0, couponCode = '') => {
    // 1. Group cart items based on product.sellerId. If none exists, fallback to 'platform_default'
    const groups: Record<string, CartItem[]> = {};
    cart.forEach(item => {
      const sId = item.product.sellerId || 'platform';
      if (!groups[sId]) {
        groups[sId] = [];
      }
      groups[sId].push(item);
    });

    const createdOrders: Order[] = [];
    const nowStr = new Date().toISOString().split('T')[0];

    // Total cart size prior to applying any coupon discount
    const totalCartValueBeforeDiscount = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);

    // 2. Loop through each vendor group and create a separate split Order
    Object.entries(groups).forEach(([sId, itemSlice]) => {
      const orderNum = Math.floor(10000 + Math.random() * 90000);
      
      // Distinct tracking codes
      const trackingCode = `VD-${orderNum}-${sId === 'platform' ? 'HQ' : sId.substring(7, 10).toUpperCase()}`;
      const sliceTotal = itemSlice.reduce((tot, item) => tot + item.product.price * item.quantity, 0);

      // Apply proportional coupon discount discount if any
      const sliceProportionalDiscount = totalCartValueBeforeDiscount > 0
        ? parseFloat(((sliceTotal / totalCartValueBeforeDiscount) * discountAmount).toFixed(2))
        : 0;
      const finalSliceTotal = Math.max(0, sliceTotal - sliceProportionalDiscount);

      // Financial parameters
      let commissionRate = 10; // default
      if (sId !== 'platform') {
        const foundSeller = sellers.find(s => s.id === sId);
        if (foundSeller && foundSeller.customCommissionRate !== undefined) {
          commissionRate = foundSeller.customCommissionRate;
        } else {
          commissionRate = globalCommissionRate;
        }
      }

      const commissionAmount = parseFloat(((finalSliceTotal * commissionRate) / 100).toFixed(2));
      const netEarnings = parseFloat((finalSliceTotal - commissionAmount).toFixed(2));

      const splitOrder: Order = {
        id: trackingCode,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        city: customer.city,
        address: customer.address,
        items: [...itemSlice],
        total: finalSliceTotal,
        paymentMethod: customer.paymentMethod,
        status: 'pending',
        date: nowStr,
        progressPercent: 10,
        trackingHistory: [
          {
            status: 'pending',
            timestamp: new Date().toLocaleString(),
            locationEn: 'Cairo Logistics Hub',
            locationAr: 'مركز القاهرة اللوجستي الرئيسي',
            noteEn: 'Order placed on marketplace and dispatched to respective vendor warehouse.',
            noteAr: 'تم تسجيل الطلبية بنجاح وتحويلها لخط إنتاج ومستودع الهيئة التابعة للبائع.'
          }
        ],
        sellerId: sId,
        sellerCommissionRate: commissionRate,
        sellerCommissionAmount: commissionAmount,
        sellerNetEarnings: netEarnings
      };

      createdOrders.push(splitOrder);

      // 3. Log Financial ledger entries
      if (sId !== 'platform') {
        const newTx: Transaction = {
          id: `tx-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          sellerId: sId,
          orderId: trackingCode,
          type: 'sale',
          amount: finalSliceTotal,
          commissionAmount: commissionAmount,
          netAmount: netEarnings,
          status: 'pending', // Pending local clearance
          date: nowStr,
          descriptionEn: `Customer purchase of ${itemSlice.length} item(s) ${couponCode ? `with coupon ${couponCode}` : ''}`,
          descriptionAr: `عملية شراء من عميل لـ ${itemSlice.length} منتجات ${couponCode ? `باستخدام كود الخصم ${couponCode}` : ''}`
        };

        setTransactions(prev => [newTx, ...prev]);

        // Add to seller pending balance
        setWallets(prev => {
          const currentWallet = prev[sId] || { sellerId: sId, balance: 0, pendingBalance: 0, withdrawableBalance: 0 };
          const updatedWallet = {
            ...currentWallet,
            pendingBalance: parseFloat((currentWallet.pendingBalance + netEarnings).toFixed(2)),
            balance: parseFloat((currentWallet.balance + netEarnings).toFixed(2))
          };
          const nextWallets = { ...prev, [sId]: updatedWallet };
          localStorage.setItem('az_store_wallets', JSON.stringify(nextWallets));
          return nextWallets;
        });
      }
    });

    // 4. Update inventories and trigger safety low stock warning tags
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const cartMatch = cart.find(item => item.product.id === p.id);
        if (cartMatch) {
          const newStock = Math.max(0, p.stock - cartMatch.quantity);
          const needsAlert = newStock <= (p.minStockLevel || 5);
          return {
            ...p,
            stock: newStock,
            salesCount: p.salesCount + cartMatch.quantity,
            stockAlert: needsAlert
          };
        }
        return p;
      })
    );

    setOrders(prev => [...createdOrders, ...prev]);

    // Track the first tracking node
    const primaryId = createdOrders[0]?.id || '';
    if (primaryId) {
      setCurrentOrderTrackingId(primaryId);
    }
    clearCart();

    // Sync each split order with Waslha Delivery App
    createdOrders.forEach(async (sub) => {
      try {
        const waslhaId = await syncVendoraOrderWithWaslha(sub, customer);
        if (waslhaId) {
          logNotification(`🚲 [وصلها] تم ربط وتصدير الطلب لشبكة وصلها للتوصيل الذكي! معرف الشحنة في وصلها: ${waslhaId}`);
        }
      } catch (err) {
        console.error("Waslha sync failed inside placeOrder:", err);
      }
    });

    // Trace SMS & WhatsApp triggers
    createdOrders.forEach(sub => {
      const emailNotice = `📧 Email notification sent to ${customer.email}: Split order ${sub.id} received. Sub-total: ${sub.total} EGP.`;
      const waNotice = `💬 WhatsApp notification sent to ${customer.phone}: Hi ${customer.name}, your marketplace order branch ${sub.id} is cooking! Check: https://azstore.eg/track/${sub.id}`;
      logNotification(emailNotice);
      logNotification(waNotice);
    });

    addMockPushNotification(
      'Cart Splitted Successfully! 📦',
      'تم تفريع وتوزيع الطلبيات للبائعين! 📦',
      `Your purchase contains products from ${createdOrders.length} certified vendor(s). Primary code: ${primaryId}`,
      `تحتوي سلتكم على منتجات لعدد ${createdOrders.length} تجار متفارقين. كود المتابعة الرئيسي: ${primaryId}`
    );

    return createdOrders[0];
  };

  // UPDATE ORDER STATUS WITH FINANCIAL CLEARANCE TRIGGER
  const updateOrderStatus = (orderId: string, status: 'pending' | 'preparing' | 'shipping' | 'delivered') => {
    let progress = 10;
    let locEn = '';
    let locAr = '';
    let msgEn = '';
    let msgAr = '';

    switch (status) {
      case 'pending':
        progress = 10;
        locEn = 'Merchant Clearance Sorting Hub';
        locAr = 'مقر التوزيع والفرز التابع للتاجر المعين';
        msgEn = 'Order status marked as reviewed.';
        msgAr = 'تم تأكيد استلام الطلبية وبانتظار البدء في تحضير مستندات الشحن.';
        break;
      case 'preparing':
        progress = 40;
        locEn = 'Supplier Packaging Warehouse';
        locAr = 'مستودع التعبئة والفرز الفني لمورد الخامات';
        msgEn = 'Batch numbers and expiry guidelines verified. Packaging completed.';
        msgAr = 'تم فحص أرقام التشغيلات وتواريخ الصلاحية وتغليف شحنتكم بأمان.';
        break;
      case 'shipping':
        progress = 75;
        locEn = 'Transit to Governorates Center';
        locAr = 'في الطريق إلى محافظة العميل النهائية عبر شبكة الربط واللوجستيات';
        msgEn = 'Dispatched with Vendora Express specialized cargo carriers.';
        msgAr = 'الشحنة الزراعية في طريقها للمجموعات السريعة للنقل واللوجستيات.';
        break;
      case 'delivered':
        progress = 100;
        locEn = 'Delivered to farmland / client site';
        locAr = 'تم تسليم الشحنة وتوقيع الإيصال بموقع العميل';
        msgEn = 'Delivered and hand-signed.';
        msgAr = 'تم تسليم الشحنة للعميل بنجاح بعد التأكد من مطابقتها لكود التشغيلة.';
        break;
    }

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          // If order is delivered successfully, clear balance from Pending to Withdrawable for that vendor!
          if (status === 'delivered' && ord.status !== 'delivered' && ord.sellerId && ord.sellerId !== 'platform') {
            const sId = ord.sellerId;
            const earn = ord.sellerNetEarnings || 0;

            // Clear Transaction Status
            setTransactions(prevTx =>
              prevTx.map(tx => (tx.orderId === orderId ? { ...tx, status: 'cleared' as const } : tx))
            );

            // Shift Balance in wallet
            setWallets(current => {
              const currentWallet = current[sId] || { sellerId: sId, balance: 0, pendingBalance: 0, withdrawableBalance: 0 };
              const updatedWallet = {
                ...currentWallet,
                pendingBalance: Math.max(0, parseFloat((currentWallet.pendingBalance - earn).toFixed(2))),
                withdrawableBalance: parseFloat((currentWallet.withdrawableBalance + earn).toFixed(2))
              };
              const nextWallets = { ...current, [sId]: updatedWallet };
              localStorage.setItem('az_store_wallets', JSON.stringify(nextWallets));
              return nextWallets;
            });

            addMockPushNotification(
              `Payment Cleared directly to ${sId.replace('seller-', '').toUpperCase()} wallet! 💰`,
              `تم ترحيل أرباح البائع مباشرة لمحفظته القابلة للسحب! 💰`,
              `Net ${earn} EGP has been unlocked after successful delivery verification of ${orderId}.`,
              `تم الإفراج عن ${earn} جنيه مصري ونقلها لرصيدك القابل للسحب بعد تسليم الطلب ${orderId}.`
            );
          }

          const logExists = ord.trackingHistory.some(h => h.status === status);
          const updatedHistory = logExists
            ? ord.trackingHistory
            : [
                ...ord.trackingHistory,
                {
                  status,
                  timestamp: new Date().toLocaleString(),
                  locationEn: locEn,
                  locationAr: locAr,
                  noteEn: msgEn,
                  noteAr: msgAr
                }
              ];

          return {
            ...ord,
            status,
            progressPercent: progress,
            trackingHistory: updatedHistory
          };
        }
        return ord;
      })
    );
  };

  const addTicket = (type: 'complaint' | 'suggestion' | 'inquiry', name: string, email: string, title: string, description: string) => {
    const newT: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      senderName: name,
      senderEmail: email,
      title,
      description,
      status: 'open',
      date: new Date().toISOString().split('T')[0]
    };
    setTickets(prev => [newT, ...prev]);

    addMockPushNotification(
      'Service Ticket Opened 🎫',
      'تم إنشاء تذكرة دعم فني جديدة 🎫',
      `Our customer relationship hub will contact you on ${email} soon.`,
      `قام النظام بفتح تذكرتكم وسيقوم ممثل الدعم للمنصة الزراعية بالرد القريب.`
    );
  };

  const sendChatMessage = (text: string, sender: 'user' | 'agent') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);

    if (sender === 'user') {
      setTimeout(() => {
        let replyText = '';
        const norm = text.toLowerCase();
        if (norm.includes('track') || norm.includes('تتبع') || norm.includes('فين الطلب') || norm.includes('اين طلبي')) {
          replyText = language === 'ar'
            ? 'لتتبع شحناتك المقسمة لدى التجار، يرجى إدخال أكواد طلبات التجزئة في حقل التتبع أعلى شريط التنقل لعرض خرائط مسارات الري ومصانع الأعلاف المرتبطة بها.'
            : 'To track your split vendor orders, copy your localized sub-codes (e.g. VD-12345-QUDS) to the upper navbar navigation track field to monitor specialized cargo dispatch.';
        } else if (norm.includes('سعر') || norm.includes('بكم') || norm.includes('price') || norm.includes('جنيه') || norm.includes('egp')) {
          replyText = language === 'ar'
            ? 'أسعار الخامات الدورية والأعلاف الحيوانية يتم تحديثها محلياً وبشفافية بواسطة التجار. وتقتطع المنصة عمولات تتراوح بين 5-15% تسدد تلقائياً.'
            : 'Farming raw materials feed pricing is updated securely by vetted suppliers periodically. Platform commission ranges between 5% and 15%.';
        } else if (norm.includes('سجل') || norm.includes('تاجر') || norm.includes('seller') || norm.includes('register') || norm.includes('vendor')) {
          replyText = language === 'ar'
            ? 'مرحباً بك كشريك تشغيل! يمكنك النقر على خيار "سجل كبائع" في صفحة الحساب لعرض نموذج طلب الانضمام وتفعيل لوحة وإحصائيات مبيعاتك وأرباحك.'
            : 'Welcome as an operating partner! Click on "Register as Seller" inside your account dropdown portal to apply for a direct vendor store account.';
        } else {
          replyText = language === 'ar'
            ? 'شكراً لتواصلك مع منسقي سوق الخامات والأعلاف والشبكات الزراعية. تم توجيه رسالتك للوكيل المساعد للمبيعات لدراسة طلبك والرد فوراً.'
            : 'Thank you for reaching the Agricultural feed & supply operations. Your message is queued to help speed up direct merchant relations.';
        }

        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-reply-${Date.now()}`,
            sender: 'agent',
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }, 1000);
    }
  };

  const trackOrder = (id: string) => {
    return orders.find(ord => ord.id.toUpperCase() === id.trim().toUpperCase());
  };

  const dismissWalkthrough = () => {
    localStorage.setItem('az_store_walkthrough_dismissed', 'true');
    setShowWalkthrough(false);
  };

  const resetWalkthrough = () => {
    localStorage.removeItem('az_store_walkthrough_dismissed');
    setShowWalkthrough(true);
  };

  // PRODUCT OPERATIONS
  const addProduct = (newProd: Omit<Product, 'id' | 'reviews' | 'rating' | 'salesCount'>) => {
    const fullProd: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      salesCount: 0,
      reviews: []
    };
    setProducts(prev => [fullProd, ...prev]);

    addMockPushNotification(
      'New Product Launched! 🚀',
      'إطلاق منتج جديد بالمتجر! 🚀',
      `Check out newly added "${newProd.nameEn}" under ${newProd.category}.`,
      `تصفح المنتج المضاف حديثاً "${newProd.nameAr}" ضمن قسم ${newProd.category}.`
    );
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProd.id ? updatedProd : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addReview = (productId: string, rating: number, comment: string, userName: string) => {
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: userName || (language === 'ar' ? 'عميل المصدر' : 'Marketplace Client'),
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const updatedReviews = [newRev, ...p.reviews];
          const averageRating = parseFloat(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          return {
            ...p,
            reviews: updatedReviews,
            rating: averageRating
          };
        }
        return p;
      })
    );

    addMockPushNotification(
      'New Store Review ⭐',
      'تم إضافة تقييم مراجعة جديدة ⭐',
      `Merchant response metrics adjusted based on recent customer input.`,
      `أرباب المزارع أضافوا حكماً وتوصيةً حديثة على أداء وموثوقية المنتجات.`
    );
  };

  const clearLogs = () => setNotificationLogs([]);

  // AUTH REFACTORING
  const registerUser = (name: string, email: string, phone: string, passwordHash: string) => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return {
        success: false,
        errorEn: 'This email is already registered.',
        errorAr: 'هذا البريد الإلكتروني مسجل بالفعل.'
      };
    }

    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      passwordHash,
      role: 'customer'
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('az_store_users', JSON.stringify(updated));
      return updated;
    });

    const publicUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: 'customer'
    };
    setCurrentUser(publicUser);
    localStorage.setItem('az_store_current_user', JSON.stringify(publicUser));

    addMockPushNotification(
      'Account Created 🎉',
      'تم إنشاء حساب العميل بنجاح 🎉',
      `Welcome to Vendora Marketplace, ${name}! Search secure veterinary feeds.`,
      `مرحباً بك في سوق الأعلاف والخامات الزراعية يا ${name}! تم تفعيل حسابك كعميل.`
    );

    return { success: true, errorEn: '', errorAr: '' };
  };

  const registerAdmin = (name: string, email: string, phone: string, passwordHash: string) => {
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return {
        success: false,
        errorEn: 'This email is already registered.',
        errorAr: 'هذا البريد الإلكتروني مسجل بالفعل.'
      };
    }

    const newUser: StoredUser = {
      id: `admin-${Date.now()}`,
      name,
      email,
      phone,
      passwordHash,
      role: 'admin'
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('az_store_users', JSON.stringify(updated));
      return updated;
    });

    addMockPushNotification(
      'Admin Activated 🛠️',
      'تم تفعيل مدير جديد 🛠️',
      `Super Admin added ${name} as a store admin.`,
      `أضاف المدير العام ${name} كمسؤول/مدير جديد للنظام والعمليات آمنًا.`
    );

    return { success: true, errorEn: '', errorAr: '' };
  };

  const loginUser = (email: string, passwordHash: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return {
        success: false,
        errorEn: 'Account not found with this email.',
        errorAr: 'البريد الإلكتروني هذا غير مسجل لدينا.'
      };
    }

    if (found.passwordHash !== passwordHash) {
      return {
        success: false,
        errorEn: 'Incorrect password.',
        errorAr: 'كلمة المرور غير صحيحة.'
      };
    }

    // Check if user is seller and approved. If pending, block or let them see their status.
    if (found.role === 'seller') {
      const foundSeller = sellers.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (foundSeller && foundSeller.status === 'rejected') {
        return {
          success: false,
          errorEn: 'Your seller registration was rejected by marketplace administration.',
          errorAr: 'تم رفض طلب انضمامك كبائع من قبل إدارة المنصة.'
        };
      }
    }

    const publicUser: User = {
      id: found.id,
      name: found.name,
      email: found.email,
      phone: found.phone,
      role: found.role || 'customer'
    };
    setCurrentUser(publicUser);
    localStorage.setItem('az_store_current_user', JSON.stringify(publicUser));

    addMockPushNotification(
      'Logged in successfully 👋',
      'تم تسجيل الدخول بنجاح! 👋',
      `Welcome back, ${found.name}! Active Workspace ready.`,
      `أهلاً بعودتك يا ${found.name}! مساحة عملك النشطة جاهزة للتحضير.`
    );

    return { success: true, errorEn: '', errorAr: '' };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setAdminMode(false);
    localStorage.removeItem('az_store_current_user');
    addMockPushNotification(
      'Logged Out Successfully',
      'تم تسجيل الخروج بنجاح',
      `You have safely closed your active session.`,
      `لقد تم تأمين وإنهاء جلستك الحالية بنجاح.`
    );
  };

  const updateUserProfile = (name: string, phone: string) => {
    if (!currentUser) return { success: false };

    // Update users store list
    setUsers(prev => {
      const next = prev.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, name, phone };
        }
        return u;
      });
      localStorage.setItem('az_store_users', JSON.stringify(next));
      return next;
    });

    // Update current context
    const nextUser = { ...currentUser, name, phone };
    setCurrentUser(nextUser);
    localStorage.setItem('az_store_current_user', JSON.stringify(nextUser));

    // Also update matching seller if any
    setSellers(prev => {
      const next = prev.map(s => {
        if (s.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return { ...s, name, phone };
        }
        return s;
      });
      localStorage.setItem('az_store_sellers', JSON.stringify(next));
      return next;
    });

    addMockPushNotification(
      'Profile Updated successfully 👋',
      'تم تحديث الملف الشخصي بنجاح! 👋',
      'Your profile data and contact telephone were saved.',
      'تم حفظ وتعديل بيانات ملفك الشخصي بنجاح.'
    );

    return { success: true };
  };


  // ==========================================
  // MULTI-VENDOR OPERATIONS IMPLEMENTATIONS
  // ==========================================

  // Register Seller Operation
  const registerSeller = (params: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    storeName: string;
    bioAr: string;
    bioEn: string;
    contactAddress: string;
    logo: string;
    banner: string;
  }) => {
    const emailExists = users.some(u => u.email.toLowerCase() === params.email.toLowerCase());
    if (emailExists) {
      return {
        success: false,
        errorEn: 'An account with this email already exists.',
        errorAr: 'هناك حساب مسجل بهذا البريد الإلكتروني بالفعل.'
      };
    }

    const sellerId = `seller-${Date.now()}`;

    // 1. Create Seller Record (Status starts as 'pending')
    const newSeller: Seller = {
      id: sellerId,
      name: params.name,
      email: params.email,
      phone: params.phone,
      storeName: params.storeName,
      logo: params.logo || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60',
      banner: params.banner || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&auto=format&fit=crop&q=60',
      bioAr: params.bioAr,
      bioEn: params.bioEn,
      contactAddress: params.contactAddress,
      rating: 5.0,
      status: 'pending', // Requires admin approval!
      reviewsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setSellers(prev => [...prev, newSeller]);

    // 2. Add to Local Users with Seller Role
    const newStoredUser: StoredUser = {
      id: `user-${sellerId}`,
      name: params.name,
      email: params.email,
      phone: params.phone,
      passwordHash: params.passwordHash,
      role: 'seller'
    };

    setUsers(prev => [...prev, newStoredUser]);

    // 3. Initialize empty Wallet too
    setWallets(prev => {
      const initWallet: SellerWallet = { sellerId, balance: 0, pendingBalance: 0, withdrawableBalance: 0 };
      const nextWallets = { ...prev, [sellerId]: initWallet };
      localStorage.setItem('az_store_wallets', JSON.stringify(nextWallets));
      return nextWallets;
    });

    addMockPushNotification(
      'Seller Account Requested 🔑',
      'تم إرسال طلب تفعيل متجر للتاجر 🔑',
      `Your pending store "${params.storeName}" is submitted for Admin verification.`,
      `طلب تجهيز متجركم "${params.storeName}" قيد الفحص المرجعي والاعتماد من الإدارة.`
    );

    return { success: true, errorEn: '', errorAr: '' };
  };

  // Admin approves seller application
  const approveSeller = (sellerId: string) => {
    setSellers(prev =>
      prev.map(sel => {
        if (sel.id === sellerId) {
          addMockPushNotification(
            'Seller Account Approved! 🎊',
            'تم اعتماد متجر التاجر للشراكة المباشرة! 🎊',
            `Approved store "${sel.storeName}" can now list custom feeds and receive orders.`,
            `بشرى سارة! تمت الموافقة على متجركم "${sel.storeName}"، يمكنكم البدء في عرض الخامات الزراعية وتلقي الطلبات.`
          );
          return { ...sel, status: 'approved' as const };
        }
        return sel;
      })
    );
  };

  // Admin rejects seller application
  const rejectSeller = (sellerId: string) => {
    setSellers(prev =>
      prev.map(sel => {
        if (sel.id === sellerId) {
          addMockPushNotification(
            'Seller Registration Rejected ⚠️',
            'تم رفض طلب انضمام المتجر ⚠️',
            `Application for "${sel.storeName}" was rejected because of missing licensing documentation.`,
            `تم رفض طلب انضمام المتجر "${sel.storeName}" لعدم كفاية كشوف التصاريح والاعتماد الوزاري.`
          );
          return { ...sel, status: 'rejected' as const };
        }
        return sel;
      })
    );
  };

  // Admin changes commission rate per seller
  const updateSellerCommissionRate = (sellerId: string, rate: number) => {
    // Validate range strictly between 5% and 15%
    const boundedRate = Math.min(15, Math.max(5, rate));
    setSellers(prev =>
      prev.map(sel => (sel.id === sellerId ? { ...sel, customCommissionRate: boundedRate } : sel))
    );

    addMockPushNotification(
      'Seller Commission Rate Adjusted 📊',
      'تم تعديل نسبة عمولة المتجر 📊',
      `Commission rate for this merchant has been set to ${boundedRate}%.`,
      `تم تحديد نسبة اقتطاع العمولات لهذا المتجر بمقدار ${boundedRate}% للمشتريات.`
    );
  };

  const setGlobalCommissionRate = (rate: number) => {
    const boundedRate = Math.min(15, Math.max(5, rate));
    setGlobalCommissionState(boundedRate);
  };

  // Create payout request by vendor
  const createPayoutRequest = (params: {
    sellerId: string;
    amount: number;
    paymentMethod: 'bank_transfer' | 'instapay' | 'vodafone_cash';
    paymentDetails: string;
  }) => {
    const wallet = wallets[params.sellerId];
    if (!wallet || wallet.withdrawableBalance < params.amount) {
      return {
        success: false,
        errorEn: 'Insufficient withdrawable balance in wallet.',
        errorAr: 'رصيد المحفظة المتاح للسحب غير كافي للعملية.'
      };
    }

    const assocSeller = sellers.find(s => s.id === params.sellerId);
    if (!assocSeller) {
      return {
        success: false,
        errorEn: 'Seller store details not found.',
        errorAr: 'تفصيل حساب البائع غير مسجل بالنظام.'
      };
    }

    const requestId = `payout-${Date.now()}`;
    const newRequest: PayoutRequest = {
      id: requestId,
      sellerId: params.sellerId,
      sellerName: assocSeller.name,
      sellerStore: assocSeller.storeName,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      paymentDetails: params.paymentDetails,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    setPayoutRequests(prev => [newRequest, ...prev]);

    // Debit withdrawable, put in ledger balance directly or deduct it. Let's deduct immediately upon pending status to avoid double-draw!
    setWallets(current => {
      const active = current[params.sellerId];
      const updated = {
        ...active,
        withdrawableBalance: parseFloat((active.withdrawableBalance - params.amount).toFixed(2)),
        balance: parseFloat((active.balance - params.amount).toFixed(2))
      };
      const next = { ...current, [params.sellerId]: updated };
      localStorage.setItem('az_store_wallets', JSON.stringify(next));
      return next;
    });

    addMockPushNotification(
      'Payout Request Logged 🏦',
      'تم إرسال طلب سحب الأرباح وبانتظار الموافقة 🏦',
      `Requested ${params.amount} EGP via ${params.paymentMethod.replace('_', ' ').toUpperCase()}.`,
      `تم طلب سحب مبلغ ${params.amount} جنيه مصري عبر الحساب ${params.paymentDetails}.`
    );

    return { success: true, errorEn: '', errorAr: '' };
  };

  // Administrator confirms payout execution
  const approvePayoutRequest = (payoutId: string) => {
    setPayoutRequests(prev =>
      prev.map(p => {
        if (p.id === payoutId) {
          // Log Financial Payout Transaction
          const newPayoutTx: Transaction = {
            id: `tx-payout-${Date.now()}`,
            sellerId: p.sellerId,
            orderId: p.id,
            type: 'payout',
            amount: p.amount,
            commissionAmount: 0,
            netAmount: -p.amount,
            status: 'withdrawn',
            date: new Date().toISOString().split('T')[0],
            descriptionEn: `Payout processed via ${p.paymentMethod.toUpperCase()}`,
            descriptionAr: `تحويل الأرباح المستحقة بنجاح إلى حساب ${p.paymentMethod.toUpperCase()}`
          };

          setTransactions(txs => [newPayoutTx, ...txs]);

          addMockPushNotification(
            'Payout Request Disbursed! 🟢',
            'تم إتمام تحويل الأموال والخصم بنجاح! 🟢',
            `Funds for ${p.sellerStore} (${p.amount} EGP) sent out securely.`,
            `تم تحويل مبلغ الأرباح (${p.amount} جنيه مصري) لمتجر "${p.sellerStore}" بنجاح وبشكل آمن.`
          );

          return { 
            ...p, 
            status: 'approved' as const, 
            processedDate: new Date().toISOString().split('T')[0],
            notes: 'Successfully verified and bank transfer wire completed logs.'
          };
        }
        return p;
      })
    );
  };

  // Administrator rejects payout (cancels and returns funds)
  const rejectPayoutRequest = (payoutId: string, reason = 'Incorrect account details') => {
    setPayoutRequests(prev =>
      prev.map(p => {
        if (p.id === payoutId) {
          // Refund wallet balance!
          setWallets(current => {
            const active = current[p.sellerId];
            if (active) {
              const refunded = {
                ...active,
                withdrawableBalance: parseFloat((active.withdrawableBalance + p.amount).toFixed(2)),
                balance: parseFloat((active.balance + p.amount).toFixed(2))
              };
              const next = { ...current, [p.sellerId]: refunded };
              localStorage.setItem('az_store_wallets', JSON.stringify(next));
              return next;
            }
            return current;
          });

          addMockPushNotification(
            'Payout Request Cancelled/Rejected ⚠️',
            'تم إلغاء طلب سحب الأرباح للتاجر ⚠️',
            `Drawn ${p.amount} EGP has been refunded because: ${reason}`,
            `تم رفض تحويل أرباحك بقيمة ${p.amount} جنيه وإعادة الرصيد للمحفظة لسبب: ${reason}`
          );

          return {
            ...p,
            status: 'rejected' as const,
            processedDate: new Date().toISOString().split('T')[0],
            notes: `Rejected by admin. Reason: ${reason}`
          };
        }
        return p;
      })
    );
  };


  // Coupon/Promo handlers
  const addPromoCoupon = (newCoupon: Omit<PromoCoupon, 'id' | 'dateCreated'>) => {
    const coupon: PromoCoupon = {
      ...newCoupon,
      id: 'promo-' + Math.random().toString(36).substr(2, 9),
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setPromoCoupons(prev => [coupon, ...prev]);
  };

  const updatePromoCoupon = (updated: PromoCoupon) => {
    setPromoCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deletePromoCoupon = (couponId: string) => {
    setPromoCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // Real-time synchronization of order statuses from Waslha Delivery App back to Vendora
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    // Filter pending orders (not delivered yet)
    const pendingOrderIds = orders
      .filter(o => o.status !== 'delivered')
      .map(o => o.id);

    if (pendingOrderIds.length === 0) return;

    // Listen to changes in Waslha orders matching our Vendora order IDs
    const q = query(
      collection(db, 'orders'),
      where('vendoraOrderId', 'in', pendingOrderIds.slice(0, 10))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const waslhaOrder = change.doc.data();
          const vOrderId = waslhaOrder.vendoraOrderId;
          const waslhaStatus = waslhaOrder.status;

          let newStatus: 'pending' | 'preparing' | 'shipping' | 'delivered' | null = null;
          let progressPercent = 10;
          let notesAr = '';
          let notesEn = '';
          let locAr = '';
          let locEn = '';

          if (waslhaStatus === 'WAITING_FOR_OFFERS' || waslhaStatus === 'PENDING') {
            newStatus = 'pending';
            progressPercent = 15;
            locAr = 'مخازن فيندورا - أشمون 🏢';
            locEn = 'Vendora Ashmoun Hub';
            notesAr = 'جاري البحث عن كابتن شحن وتوصيل من مناديب تطبيق وصلها النشطين بالمنوفية 🚲';
            notesEn = 'Searching for active couriers in Al-Menofia via Waslha delivery app 🚲';
          } else if (waslhaStatus === 'ACCEPTED' || waslhaStatus === 'ASSIGNED') {
            newStatus = 'preparing';
            progressPercent = 45;
            locAr = 'مقر بائع فيندورا بأشمون 🛒';
            locEn = 'Merchant Warehouse - Ashmoun';
            const driverName = waslhaOrder.driverName || 'مندوب التوصيل';
            const driverPhone = waslhaOrder.driverPhone || '';
            notesAr = `تم قبول التوصيل وتكليف المندوب: ${driverName} (${driverPhone}) عبر تطبيق وصلها وجاري التجهيز 🚚`;
            notesEn = `Courier assigned: ${driverName} (${driverPhone}) via Waslha. Shipment preparing 🚚`;
          } else if (waslhaStatus === 'PICKED_UP' || waslhaStatus === 'PICKED' || waslhaStatus === 'IN_DELIVERY') {
            newStatus = 'shipping';
            progressPercent = 75;
            locAr = 'طريق شبين الكوم - أشمون الدائري 🛣️';
            locEn = 'Menofia Ring Road';
            notesAr = `الشحنة الآن مع المندوب وفي طريقها إليك! للمزيد تتبع حركة الكابتن ببرنامج وصلها 🗺️`;
            notesEn = `Order picked up and is currently in delivery! Track directly on Waslha map 🗺️`;
          } else if (waslhaStatus === 'DELIVERED') {
            newStatus = 'delivered';
            progressPercent = 100;
            locAr = 'عنوان تسليم العميل 🏠';
            locEn = 'Customer Drop-off Location';
            notesAr = 'تم التوصيل والتحصيل بنجاح تام بيد كابتن وصلها الذكية! شكراً لتسوقكم من فيندورا مصر 🎉';
            notesEn = 'Order successfully hand-delivered & collected by Waslha team unit. Thank you 🎉';
          }

          if (newStatus) {
            setOrders(prevOrders => {
              const matched = prevOrders.find(o => o.id === vOrderId);
              if (!matched) return prevOrders;
              if (matched.status === newStatus && matched.progressPercent === progressPercent) {
                return prevOrders;
              }

              return prevOrders.map(o => {
                if (o.id === vOrderId) {
                  const alreadyLogged = o.trackingHistory.some(h => h.noteAr === notesAr);
                  const updatedHistory = alreadyLogged 
                    ? o.trackingHistory 
                    : [
                        {
                          status: newStatus!,
                          timestamp: new Date().toLocaleTimeString(),
                          locationAr: locAr,
                          locationEn: locEn,
                          noteAr: notesAr,
                          noteEn: notesEn
                        },
                        ...o.trackingHistory
                      ];

                  return {
                    ...o,
                    status: newStatus!,
                    progressPercent,
                    trackingHistory: updatedHistory
                  };
                }
                return o;
              });
            });
          }
        }
      });
    }, (error) => {
      console.warn("Live status syncing listener encountered an error:", error);
    });

    return () => unsubscribe();
  }, [orders]);


  return (
    <StoreContext.Provider
      value={{
        products,
        orders,
        tickets,
        chatMessages,
        cart,
        language,
        theme,
        notifications,
        currentOrderTrackingId,
        showWalkthrough,
        activeChatOpen,
        adminMode,
        notificationLogs,
        currentUser,
        users,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        authModalOpen,
        setAuthModalOpen,

        // Multi-Vendor Platform Exposing
        sellers,
        globalCommissionRate,
        transactions,
        payoutRequests,
        wallets,

        // Promotions/Coupons system
        promoCoupons,

        // Handlers
        setLanguage,
        setTheme,
        toggleLanguage,
        toggleTheme,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        addTicket,
        sendChatMessage,
        trackOrder,
        dismissWalkthrough,
        resetWalkthrough,
        setActiveChatOpen,
        setAdminMode,
        setCurrentOrderTrackingId,
        registerUser,
        registerAdmin,
        loginUser,
        logoutUser,
        updateUserProfile,
        
        // Product Operations
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        clearLogs,

        // Multi-Vendor Handlers
        registerSeller,
        approveSeller,
        rejectSeller,
        updateSellerCommissionRate,
        setGlobalCommissionRate,
        createPayoutRequest,
        approvePayoutRequest,
        rejectPayoutRequest,

        // Promotions/Coupons Handlers
        addPromoCoupon,
        updatePromoCoupon,
        deletePromoCoupon
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
};
