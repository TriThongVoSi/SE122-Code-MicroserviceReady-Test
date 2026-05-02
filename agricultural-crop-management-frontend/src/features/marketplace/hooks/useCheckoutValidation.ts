import { useMemo } from 'react';
import { z } from 'zod';
import type { MarketplaceAddress, MarketplacePaymentMethod } from '@/shared/api';

const phoneSchema = z.string().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ.');

export type CheckoutValidationInput = {
  addressMode: 'saved' | 'new';
  selectedAddress: MarketplaceAddress | null;
  recipientName: string | undefined;
  phone: string | undefined;
  shippingAddressLine: string;
  paymentMethod: MarketplacePaymentMethod;
};

export type CheckoutValidationResult = { valid: true } | { valid: false; message: string };

export function useCheckoutValidation() {
  return useMemo(() => ({
    validateCheckout(input: CheckoutValidationInput): CheckoutValidationResult {
      const hasAddress = input.addressMode === 'saved'
        ? Boolean(input.selectedAddress)
        : input.shippingAddressLine.trim().length > 0;
      if (!hasAddress) return { valid: false, message: 'Vui lòng chọn hoặc nhập địa chỉ giao hàng.' };
      if (!input.recipientName?.trim()) return { valid: false, message: 'Vui lòng nhập tên người nhận.' };
      const phone = input.phone?.trim() ?? '';
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) return { valid: false, message: phoneResult.error.issues[0]?.message ?? 'Số điện thoại không hợp lệ.' };
      if (!input.shippingAddressLine.trim()) return { valid: false, message: 'Vui lòng nhập địa chỉ giao hàng.' };
      if (input.paymentMethod !== 'COD' && input.paymentMethod !== 'BANK_TRANSFER') return { valid: false, message: 'Phương thức thanh toán không hợp lệ.' };
      return { valid: true };
    },
  }), []);
}
