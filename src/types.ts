/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number; // in EGP
  image: string;
  category: string; // 'electronics' | 'fashion' | 'home' | 'beauty' | 'feed' | 'additives' | 'vet' | 'spare_parts' | 'agricultural'
  rating: number;
  reviews: Review[];
  stock: number;
  featured?: boolean;
  salesCount: number;

  // Multi-vendor product ownership
  sellerId?: string;
  sellerName?: string;
  sellerStore?: string;

  // Agricultural, Feed, and Veterinary industry features
  batchNumber?: string;
  expiryDate?: string;
  productionDate?: string;
  supplierInfo?: string;
  warehouseLocation?: string;
  minStockLevel?: number;
  stockAlert?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderHistoryLog {
  status: 'pending' | 'preparing' | 'shipping' | 'delivered';
  timestamp: string;
  locationEn: string;
  locationAr: string;
  noteEn: string;
  noteAr: string;
}

export interface Order {
  id: string; // tracking code, e.g., VD-74892
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string; // Egypt cities
  address: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'card' | 'instapay' | 'meeza' | 'cod';
  status: 'pending' | 'preparing' | 'shipping' | 'delivered';
  date: string;
  trackingHistory: OrderHistoryLog[];
  progressPercent: number; // 0 to 100 for the Egyptian route map

  // Multi-vendor split-order tracking
  sellerId?: string; // which seller this order slice belongs to
  sellerCommissionRate?: number; // the commission rate used
  sellerCommissionAmount?: number; // the commission fee deducted
  sellerNetEarnings?: number; // net payout added to seller wallet
}

export interface Ticket {
  id: string;
  type: 'complaint' | 'suggestion' | 'inquiry';
  senderName: string;
  senderEmail: string;
  title: string;
  description: string;
  status: 'open' | 'resolved';
  date: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  type: 'offer' | 'status_update' | 'general';
  date: string;
}

export type UserRole = 'superadmin' | 'admin' | 'customer' | 'seller' | 'delivery';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: UserRole;
}

export interface StoredUser extends User {
  passwordHash: string; // Stored user simulation password
}

// MULTI-VENDOR SELLER SPECIFIC INTERFACES (FINANCIALS & ACCOUNTS)

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  logo: string;
  banner: string;
  bioAr: string;
  bioEn: string;
  contactAddress: string;
  rating: number; // calculated rating
  status: 'pending' | 'approved' | 'rejected';
  customCommissionRate?: number; // Custom rate (5% to 15%). If empty, global default (10%) is used.
  reviewsCount: number;
  joinedDate: string;
}

export interface SellerWallet {
  sellerId: string;
  balance: number; // Withdrawable + Pending combined or standard ledger balance
  pendingBalance: number; // Sales pending clearance (not yet delivered/settled)
  withdrawableBalance: number; // Funds ready to withdraw
}

export interface Transaction {
  id: string;
  sellerId: string;
  orderId: string;
  type: 'sale' | 'payout' | 'commission_refund';
  amount: number; // transaction total
  commissionAmount: number; // platform commission fee
  netAmount: number; // seller net earnings (amount - commission)
  status: 'pending' | 'cleared' | 'withdrawn';
  date: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface PayoutRequest {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerStore: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'instapay' | 'vodafone_cash';
  paymentDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  processedDate?: string;
  notes?: string;
}

// PROMOTIONAL MARKETING COUPONS & DISCOUNTS SYSTEM
export interface PromoCoupon {
  id: string;
  code: string; // e.g. "FREE_EGYPT", "ELECTRONICS_SUPREME"
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  discountType: 'free_shipping' | 'percentage' | 'fixed';
  discountValue: number; // For percentage (e.g., 10 for 10%) or fixed (e.g., 150 for 150 EGP), or 0 for free shipping
  minCartTotal: number; // e.g. 1000 EGP
  requiredCategory: string; // 'all' or specific category code like 'mobiles', 'electronics_accessories', 'laptops', 'video_games', 'perfumes', 'cosmetics', 'home_kitchen', 'others'
  minItemsCount: number; // Minimum total quantity of items (e.g. 1, 2, 3...)
  isActive: boolean;
  termsDetailsAr: string;
  termsDetailsEn: string;
  dateCreated: string;
}

