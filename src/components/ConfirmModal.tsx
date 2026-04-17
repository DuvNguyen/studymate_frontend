'use client';

import React from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'success' | 'warning' | 'primary';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy bỏ',
  confirmVariant = 'primary',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    primary: 'bg-emerald-400 hover:bg-emerald-500',
    danger: 'bg-red-400 hover:bg-red-500',
    success: 'bg-emerald-400 hover:bg-emerald-500',
    warning: 'bg-amber-400 hover:bg-amber-500',
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b-4 border-black border-dashed">
          <div className="w-12 h-12 bg-amber-300 border-4 border-black flex items-center justify-center -rotate-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black">!</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-black tracking-tighter">
            {title}
          </h3>
        </div>

        {/* Body */}
        <div className="mb-0 border-l-8 border-black pl-6 py-4 bg-gray-50 mb-8">
          <p className="text-sm font-bold text-gray-800 uppercase leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onConfirm}
            className={`flex-1 ${variantStyles[confirmVariant]} text-black font-black uppercase tracking-widest py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-widest py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
