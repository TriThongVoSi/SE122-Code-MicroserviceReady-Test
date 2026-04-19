export type Role = 'guest' | 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  bio?: string;
  region?: string;
  farmId?: string;
  status?: 'active' | 'inactive' | 'banned';
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  detail?: string;
  isDefault: boolean;
  label: 'home' | 'office' | 'other';
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  region: string;
  address: string;
  description: string;
  image: string;
}

export interface Season {
  id: string;
  farmId: string;
  name: string;
  cropType: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned';
}

export interface Lot {
  id: string;
  seasonId: string;
  code: string;
  harvestDate: string;
  quantity: number;
  status: 'available' | 'sold_out' | 'in_transit';
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
  sellerId: string;
  farmId: string;
  seasonId: string;
  lotId: string;
  region: string;
  traceable: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'hidden';
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string; // Simplified for single-seller orders
  items: OrderItem[];
  total: number;
  shippingFee: number;
  status: OrderStatus;
  address: string;
  phone: string;
  paymentMethod: 'COD' | 'Bank Transfer';
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
