'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePendingInstructors } from '@/hooks/useVideos';
import { Button } from '@/components/Button';
import AdminSearchBar from '@/components/admin/AdminSearchBar';

export default function PendingInstructorsList() {
  const { instructors, loading, error, refetch } = usePendingInstructors();
  const [searchEmail, setSearchEmail] = useState('');

  const filteredInstructors = instructors.filter((ins) => {
    if (!searchEmail.trim()) return true;
    return ins.email?.toLowerCase().includes(searchEmail.toLowerCase().trim());
  });

  return (
    <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto space-y-6">
      {/* Sticky Header Style */}
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Kiểm duyệt nội dung</p>
          <h1 className="text-xl sm:text-3xl font-black text-black uppercase tracking-tight leading-none">Kiểm duyệt Video</h1>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          Làm mới ↻
        </Button>
      </div>

      {/* Search Bar */}
      <AdminSearchBar
        value={searchEmail}
        onChange={setSearchEmail}
        placeholder="Tìm kiếm theo Email giảng viên..."
        borderSize={2}
      />

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border-2 border-black p-6 text-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-lg uppercase mb-2">Đã xảy ra lỗi</h3>
          <p className="text-xs">{error}</p>
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
            Không có giảng viên nào cần duyệt video.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((ins) => (
            <div 
              key={ins.uploaderId} 
              className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {ins.avatarUrl ? (
                    <img 
                      src={ins.avatarUrl} 
                      alt={ins.fullName || ins.email} 
                      className="w-12 h-12 border-2 border-black rounded-none object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 border-2 border-black bg-yellow-100 flex items-center justify-center font-black text-lg">
                      {(ins.fullName || ins.email).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-black text-black text-base truncate uppercase">
                      {ins.fullName || 'Giảng viên'}
                    </h3>
                    <p className="text-xs text-black/60 truncate">{ins.email}</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 mb-6 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-black/70">Video chờ duyệt</span>
                  <span className="bg-amber-300 border-2 border-black px-3 py-1 font-black text-sm text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {ins.pendingCount}
                  </span>
                </div>
              </div>

              <Link href={`/dashboard/admin/videos/instructor/${ins.uploaderId}`} className="w-full block">
                <Button variant="primary" className="w-full">
                  DUYỆT VIDEO →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
