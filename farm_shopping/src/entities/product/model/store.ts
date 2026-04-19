import { create } from 'zustand';
import { Product } from '@/src/shared/types';
import { mockProducts } from '@/src/shared/api/mock';

interface ProductState {
  products: Product[];
  getSellerProducts: (sellerId: string) => Product[];
  getProductById: (id: string) => Product | undefined;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string, status: Product['status']) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  getSellerProducts: (sellerId) => {
    return get().products.filter((p) => p.sellerId === sellerId);
  },
  getProductById: (id) => {
    return get().products.find((p) => p.id === id);
  },
  createProduct: (productData) => set((state) => {
    const newProduct: Product = {
      ...productData,
      id: `p${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { products: [newProduct, ...state.products] };
  }),
  updateProduct: (id, productData) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, ...productData, updatedAt: new Date().toISOString() } : p
    ),
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id),
  })),
  toggleProductStatus: (id, status) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    ),
  })),
}));
