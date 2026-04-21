'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

interface CartContextType {
  cart: any;
  loading: boolean;
  error: string;
  fetchCart: () => Promise<void>;
  addToCart: (courseId: number) => Promise<{ success: boolean; error?: string }>;
  removeFromCart: (itemId: number) => Promise<void>;
  checkout: () => Promise<{ success: boolean; order?: any; error?: string }>;
  checkoutLoading: boolean;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string, manualSubtotal?: number) => Promise<{ success: boolean; error?: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        console.warn('[CartContext] No token available, skipping fetch');
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carts`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        console.warn('[CartContext] Fetch cart failed:', result);
        setError(result.message || 'Failed to fetch cart');
        return;
      }
      
      console.log('[CartContext] Fetched cart data:', result.data);
      setCart(result.data);
    } catch (err: any) {
      console.error('[CartContext] Error in fetchCart:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    } else {
      setCart(null);
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  }, [isSignedIn, fetchCart]);

  const applyCoupon = async (code: string, manualSubtotal?: number) => {
    let subtotal: number;
    
    if (manualSubtotal !== undefined) {
      subtotal = manualSubtotal;
    } else {
      if (!cart || cart.cart_items.length === 0) return { success: false, error: 'Giỏ hàng trống' };
      subtotal = cart.cart_items.reduce((acc: number, item: any) => acc + Number(item.course?.price || 0), 0);
    }
    
    if (isNaN(subtotal)) return { success: false, error: 'Không thể xác định số tiền đơn hàng' };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coupons/validate?code=${code}&subtotal=${subtotal}`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || 'Mã giảm giá không hợp lệ');
      }
      
      setAppliedCoupon(code);
      setDiscountAmount(result.data?.discountAmount || result.discountAmount || 0);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const addToCart = async (courseId: number) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Vui lòng đăng nhập để thêm vào giỏ hàng');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carts`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ courseId }),
      });

      const result = await res.json();

      if (!res.ok) {
         throw new Error(result.message || 'Lỗi thêm vào giỏ hàng');
      }
      
      setCart(result.data);
      return { success: true };
    } catch (err: any) {
      // Don't console.error here to avoid Next.js dev overlay for business logic errors
      return { success: false, error: err.message };
    }
  };

  const checkout = async () => {
    setCheckoutLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Vui lòng đăng nhập để thanh toán');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/checkout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ couponCode: appliedCoupon })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Lỗi thanh toán');
      }
      
      // Cart is clear in backend, fetch empty cart
      await fetchCart();
      setAppliedCoupon(null);
      setDiscountAmount(0);
      return { success: true, order: result.data };
    } catch (err: any) {
      console.error('[CartContext] Error in checkout:', err.message);
      return { success: false, error: err.message };
    } finally {
      setCheckoutLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/carts/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Lỗi xóa khỏi giỏ');
      
      setCart(result.data);
    } catch (err: any) {
      console.error('[CartContext] Error in removeFromCart:', err.message);
      setError(err.message);
    }
  };

  return (
    <CartContext.Provider value={{ 
      cart, loading, error, fetchCart, addToCart, removeFromCart, checkout, checkoutLoading,
      appliedCoupon, discountAmount, applyCoupon, removeCoupon 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
