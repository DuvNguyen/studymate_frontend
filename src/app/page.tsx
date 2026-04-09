import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { InstructorSignupButton } from "../components/InstructorSignupButton";
import { StudentSignupButton } from "../components/StudentSignupButton";
import Navbar from "../components/Navbar";

const MOCK_COURSES = [
  {
    id: 1,
    title: "Lập trình ReactJS Thực Chiến Dành Cho Người Mới Bắt Đầu",
    instructor: "Nguyễn Văn A",
    category: "Lập trình Web",
    price: "1,299,000đ",
    thumbnail: "https://placehold.co/600x400/6366f1/ffffff?text=ReactJS",
    rating: 4.8,
    students: 1240,
  },
  {
    id: 2,
    title: "Thiết Kế Đồ Họa Cơ Bản Với Adobe Illustrator CC",
    instructor: "Trần Thị B",
    category: "Design",
    price: "899,000đ",
    thumbnail: "https://placehold.co/600x400/ec4899/ffffff?text=Illustrator",
    rating: 4.9,
    students: 2310,
  },
  {
    id: 3,
    title: "Tiếng Anh Giao Tiếp Cho Dân IT Mất Gốc Lên Level B1",
    instructor: "Lê Văn C",
    category: "Ngoại ngữ",
    price: "1,500,000đ",
    thumbnail: "https://placehold.co/600x400/10b981/ffffff?text=English",
    rating: 4.7,
    students: 840,
  },
  {
    id: 4,
    title: "Phân Tích Dữ Liệu Chuyên Sâu Cùng Python và Pandas",
    instructor: "Phạm Minh D",
    category: "Khoa học Dữ liệu",
    price: "2,000,000đ",
    thumbnail: "https://placehold.co/600x400/f59e0b/ffffff?text=Data+Science",
    rating: 4.9,
    students: 310,
  },
];

export default async function HomePage() {
  let userId = null;
  try {
    const authSession = await auth();
    userId = authSession?.userId;
  } catch (e) {
    // ignore
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans selection:bg-emerald-300 selection:text-black">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-24 overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-b-4 border-black bg-white shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] mb-16">
        
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_COURSES.map((course) => (
              <div key={course.id} className="group bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="relative h-48 w-full border-b-4 border-black bg-emerald-200 overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300 scale-105"
                  />
                  {course.id === 1 && (
                    <div className="absolute top-4 left-4 bg-amber-400 border-2 border-black text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Bán chạy</div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-900 bg-purple-200 border-2 border-purple-900 px-2 py-1 inline-block mb-4 self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {course.category}
                  </div>
                  <h3 className="text-xl font-black text-black uppercase leading-tight mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm font-bold text-gray-600 mb-6">{course.instructor}</p>
                  
                  <div className="mt-auto flex items-center justify-between border-t-4 border-black pt-4">
                    <div className="flex items-center gap-1">
                      <span className="bg-black text-white px-2 py-1 text-xs font-black">{course.rating} ★</span>
                      <span className="text-xs font-bold text-gray-500 ml-1">({course.students})</span>
                    </div>
                    <div className="font-black text-black text-xl">{course.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-4 border-black py-12 text-center mt-20">
        <p className="font-black uppercase tracking-widest text-[10px] sm:text-xs text-black">© 2026 StudyMate LMS. Demo Interface for Evaluation.</p>
      </footer>
    </div>
  );
}
