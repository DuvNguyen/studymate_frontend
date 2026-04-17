'use client';

import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { useWishlist } from '@/hooks/useWishlist';
import CourseCard from '@/components/CourseCard';

export default function StudentWishlistPage() {
  const { wishlist, loading, error, toggleWishlist } = useWishlist();

  return (
    <MainLayout role="STUDENT">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase text-black tracking-tighter mb-2">
            DANH SÁCH YÊU THÍCH
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest border-l-4 border-black pl-4">
            LƯU LẠI NHỮNG KHÓA HỌC BẠN QUAN TÂM
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border-4 border-black h-80 animate-pulse shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border-4 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-red-500">
            {error}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white border-4 border-black border-dashed p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-20 h-20 bg-amber-100 border-4 border-black rounded-none flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <p className="text-lg font-black text-black uppercase mb-2">Chưa có khóa học nào</p>
            <p className="text-sm font-bold text-gray-500 uppercase mb-8">Hãy thêm các khóa học bạn yêu thích vào đây để xem sau</p>
            <Link href="/courses">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
                Khám phá khóa học ngay
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((item) => (
              <div key={item.id} className="relative group">
                <CourseCard course={item.course} />
                <button
                  onClick={() => toggleWishlist(item.course.id)}
                  className="absolute top-2 right-2 w-10 h-10 bg-white border-4 border-black text-black font-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                  title="Xóa khỏi danh sách yêu thích"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
