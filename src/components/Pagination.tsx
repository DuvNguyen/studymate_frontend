'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-10 h-10 border-2 font-black transition-all ${
            currentPage === i
              ? 'bg-yellow-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white border-black text-black hover:bg-yellow-400 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-10 h-10 flex items-center justify-center border-2 border-black transition-all ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
            : 'bg-white text-black hover:bg-yellow-400 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none'
        }`}
      >
        <ChevronLeft size={20} strokeWidth={3} />
      </button>

      <div className="flex items-center gap-2">
        {renderPageNumbers()}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 flex items-center justify-center border-2 border-black transition-all ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
            : 'bg-white text-black hover:bg-yellow-400 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none'
        }`}
      >
        <ChevronRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
};
