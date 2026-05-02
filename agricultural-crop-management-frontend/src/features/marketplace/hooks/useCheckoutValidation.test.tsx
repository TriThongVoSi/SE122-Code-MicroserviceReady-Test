import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCheckoutValidation } from './useCheckoutValidation';

describe('useCheckoutValidation', () => {
  it('rejects checkout without shipping address', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'saved',
      selectedAddress: null,
      recipientName: undefined,
      phone: undefined,
      shippingAddressLine: '',
      paymentMethod: 'COD',
    })).toEqual({ valid: false, message: 'Vui lòng chọn hoặc nhập địa chỉ giao hàng.' });
  });

  it('rejects invalid phone numbers', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'new',
      selectedAddress: null,
      recipientName: 'Nguyen Van A',
      phone: 'abc',
      shippingAddressLine: 'HCM',
      paymentMethod: 'BANK_TRANSFER',
    })).toEqual({ valid: false, message: 'Số điện thoại không hợp lệ.' });
  });

  it('accepts a complete checkout payload', () => {
    const { result } = renderHook(() => useCheckoutValidation());

    expect(result.current.validateCheckout({
      addressMode: 'new',
      selectedAddress: null,
      recipientName: 'Nguyen Van A',
      phone: '0912345678',
      shippingAddressLine: '1 Nguyen Trai, HCM',
      paymentMethod: 'BANK_TRANSFER',
    })).toEqual({ valid: true });
  });
});
