import Link from 'next/link';
import { getButtonClasses } from '@/components/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 text-black">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 md:p-10 text-center max-w-md w-full">
        <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
        
        <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-4 bg-red-100 border border-red-900 inline-block px-3 py-1 mt-2">
          Trang không tồn tại
        </p>
        
        <p className="text-sm text-gray-600 mb-8 font-medium">
          Trang bạn đang tìm kiếm chưa được phát triển hoặc không tồn tại trong hệ thống StudyMate.
        </p>
        
        <Link 
          href="/dashboard"
          className={getButtonClasses('outline', 'md')}
        >
          Trở về Dashboard
        </Link>
      </div>
    </div>
  );
}
