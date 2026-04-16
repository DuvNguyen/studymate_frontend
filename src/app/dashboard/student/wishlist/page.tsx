'use client';

import MainLayout from '@/components/MainLayout';
import Link from 'next/link';
import { Button } from '@/components/Button';

export default function StudentWishlistPage() {
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

        <div className="bg-white border-4 border-black border-dashed p-20 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-20 h-20 bg-pink-100 border-4 border-black rounded-none flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-4xl">❤️</span>
          </div>
          <p className="text-lg font-black text-black uppercase mb-2">Chưa có khóa học nào</p>
          <p className="text-sm font-bold text-gray-500 uppercase mb-8">Hãy thêm các khóa học bạn yêu thích vào đây để xem sau</p>
          <Link href="/courses">
            <Button size="lg" className="bg-pink-400 hover:bg-pink-500 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
              Xem danh sách khóa học
            </Button>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
