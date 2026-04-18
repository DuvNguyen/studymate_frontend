'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/Button';
import { useWallet } from '@/hooks/useWallet';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: any;
  currentUser: any;
  onSuccess?: () => void;
}

export function WithdrawalModal({ 
  isOpen, 
  onClose, 
  wallet,
  currentUser,
  onSuccess
}: WithdrawalModalProps) {
  const { requestPayout } = useWallet();

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-fill bank info from profile
  useEffect(() => {
    if (currentUser) {
      if (!bankName && currentUser.bankName) setBankName(currentUser.bankName);
      if (!bankAccountNumber && currentUser.bankAccountNumber) setBankAccountNumber(currentUser.bankAccountNumber);
      if (!bankAccountName && currentUser.bankAccountName) setBankAccountName(currentUser.bankAccountName);
    }
  }, [currentUser, bankName, bankAccountNumber, bankAccountName]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await requestPayout({
        amount: Number(amount),
        bankName,
        bankAccountName,
        bankAccountNumber,
      });
      setSuccess(true);
      setAmount('');
      if (onSuccess) onSuccess();
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div 
        className="w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-yellow-400">
          <h3 className="text-2xl font-black uppercase tracking-tighter text-black italic">
            Phiếu yêu cầu rút tiền
          </h3>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white border-4 border-black text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none font-black text-2xl"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[80vh]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-zinc-50 border-4 border-black p-4 mb-2">
              <p className="text-[10px] font-black uppercase text-gray-500 mb-1">SỐ DƯ KHẢ DỤNG</p>
              <p className="text-2xl font-black text-emerald-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance_available || 0)}
              </p>
            </div>

            {[
              { label: 'Số tiền muốn rút (≥ 500.000 VNĐ)', value: amount, setter: setAmount, type: 'number', placeholder: '0' },
              { label: 'Ngân hàng', value: bankName, setter: setBankName, type: 'text', placeholder: 'VD: Vietcombank' },
              { label: 'Chủ tài khoản', value: bankAccountName, setter: setBankAccountName, type: 'text', placeholder: 'VI VI NGUYEN' },
              { label: 'Số tài khoản', value: bankAccountNumber, setter: setBankAccountNumber, type: 'text', placeholder: '0001000xxxx' },
            ].map((field, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2">
                  <span className="w-1 h-1 bg-black"></span>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full border-2 border-black p-4 font-black text-md outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_rgba(0,0,0,1)] rounded-none transition-all focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none placeholder:text-gray-300 text-black"
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}
            
            {error && (
              <div className="bg-red-500 border-2 border-black p-4 text-[10px] font-black text-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                 LỖI: {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-400 border-2 border-black p-4 text-[10px] font-black text-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                ✓ Đã gửi yêu cầu rút tiền!
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-16 bg-black text-white hover:bg-emerald-400 hover:text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all group mt-6"
              disabled={loading || !amount}
            >
              <span className="text-lg font-black uppercase tracking-widest group-hover:italic transition-all">
                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN RÚT →'}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
