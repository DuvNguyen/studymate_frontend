import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { InstructorSignupButton } from "../components/InstructorSignupButton";
import { StudentSignupButton } from "../components/StudentSignupButton";
import PublicLayout from "../components/PublicLayout";
import FeaturedCourses from "../components/FeaturedCourses";


export default async function HomePage() {
  let userId = null;
  try {
    const authSession = await auth();
    userId = authSession?.userId;
  } catch {
    // ignore
  }

  return (
    <PublicLayout>
      <div className="bg-gray-50 text-black font-sans selection:bg-emerald-300 selection:text-black">
        {/* Hero Section */}
        <section className="-mt-36 relative pt-36 pb-20 lg:pt-44 lg:pb-24 overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b-4 border-black bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
          
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-sm font-black uppercase tracking-widest text-emerald-700 mb-6 bg-emerald-100 border-2 border-emerald-900 inline-block px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -rotate-2">
              Nền tảng học tập thế hệ mới
            </p>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-black mb-8 uppercase leading-[1.15]">
              Học tập không giới hạn cùng <br />
              <span className="bg-amber-300 px-3 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block mt-2">StudyMate</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-800 font-bold mb-12 max-w-2xl mx-auto border-2 border-black p-4 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Nâng tầm kỹ năng và kiến thức của bạn ngay hôm nay.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {!userId ? (
                <StudentSignupButton 
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none"
                >
                  Học với StudyMate
                </StudentSignupButton>
              ) : (
                <Link 
                  href="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-400 hover:bg-emerald-500 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none inline-flex items-center justify-center"
                >
                  Dashboard
                </Link>
              )}
              <InstructorSignupButton 
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1.5 active:translate-x-1.5 active:shadow-none"
              >
                Dạy trên StudyMate
              </InstructorSignupButton>
            </div>
            
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm font-black uppercase tracking-widest text-black">
              <div className="flex items-center gap-3 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="w-6 h-6 border-2 border-black bg-emerald-400 flex items-center justify-center -rotate-6">✓</span>
                Học mọi lúc mọi nơi
              </div>
              <div className="flex items-center gap-3 bg-white border-2 border-black px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="w-6 h-6 border-2 border-black bg-emerald-400 flex items-center justify-center rotate-6">✓</span>
                Chứng chỉ hoàn thành
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses Placeholder */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
              <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6">
                <h2 className="text-3xl font-black text-black uppercase tracking-tight mb-2">Các khóa học nổi bật</h2>
                <p className="text-gray-700 font-bold">Được lựa chọn cẩn thận để giúp bạn bắt đầu lộ trình học tập.</p>
              </div>
              <Link href="/courses" className="inline-block px-6 py-3 bg-amber-300 hover:bg-amber-400 text-black font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none">
                Xem tất cả 
              </Link>
            </div>

            <FeaturedCourses />
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
