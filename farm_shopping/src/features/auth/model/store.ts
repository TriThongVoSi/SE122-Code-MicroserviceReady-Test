import { create } from 'zustand';
import { User, Address } from '@/src/shared/types';
import { mockUsers, mockAddresses } from '@/src/shared/api/mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  addresses: Address[];
  login: (email: string, role?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  addresses: [],
  login: (email, role) => {
    const foundUser = mockUsers.find(u => u.email === email) ||
      (role ? mockUsers.find(u => u.role === role) : mockUsers[0]);

    if (foundUser) {
      const userAddresses = mockAddresses.filter(a => a.userId === foundUser.id);
      set({ user: foundUser, isAuthenticated: true, addresses: userAddresses });
    }
  },
  logout: () => set({ user: null, isAuthenticated: false, addresses: [] }),
  updateProfile: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  })),
  addAddress: (addressData) => set((state) => {
    if (!state.user) return state;

    const isFirst = state.addresses.length === 0;
    const isDefault = isFirst ? true : addressData.isDefault;

    const newAddress: Address = {
      ...addressData,
      id: `a${Date.now()}`,
      userId: state.user.id,
      isDefault
    };

    let newAddresses = [...state.addresses, newAddress];

    if (isDefault && !isFirst) {
      newAddresses = newAddresses.map(a =>
        a.id === newAddress.id ? a : { ...a, isDefault: false }
      );
    }

    return { addresses: newAddresses };
  }),
  updateAddress: (id, data) => set((state) => {
    let newAddresses = state.addresses.map(a =>
      a.id === id ? { ...a, ...data } : a
    );

    if (data.isDefault) {
      newAddresses = newAddresses.map(a =>
        a.id === id ? a : { ...a, isDefault: false }
      );
    }

    return { addresses: newAddresses };
  }),
  deleteAddress: (id) => set((state) => {
    const addressToDelete = state.addresses.find(a => a.id === id);
    let newAddresses = state.addresses.filter(a => a.id !== id);

    if (addressToDelete?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }

    return { addresses: newAddresses };
  }),
  setDefaultAddress: (id) => set((state) => ({
    addresses: state.addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }))
  })),
}));
