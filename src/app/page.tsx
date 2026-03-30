import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

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
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-purple-200">
      {/* Navbar */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">S</div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 hidden sm:block">
              StudyMate
            </span>
          </div>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-purple-600 transition">Khóa học</Link>
            <Link href="#" className="hover:text-purple-600 transition">Sự kiện</Link>
            <Link href="#" className="hover:text-purple-600 transition">Blog</Link>
          </nav>

          <div className="flex items-center gap-4">
            {!userId ? (
              <>
                <Link href="/sign-in" className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition hidden sm:block">
                  Đăng nhập
                </Link>
                <Link 
                  href="/sign-up?role=student" 
                  className="bg-black hover:bg-slate-800 text-white text-sm font-semibold py-2 px-5 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-purple-600 hover:text-purple-800 transition mr-4">
                  Vào Dashboard
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-200 rounded-full blur-[120px] opacity-30 -z-10 pointer-events-none"></div>
        
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.15]">
            Học tập không giới hạn cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">StudyMate</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Nâng tầm kỹ năng và kiến thức của bạn ngay hôm nay.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/sign-up?role=student"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl shadow-purple-500/30 transition-all hover:-translate-y-1"
            >
              Học với StudyMate
            </Link>
            <Link 
              href="/sign-up?role=instructor"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border-2 border-slate-200 hover:border-indigo-600 text-slate-800 hover:text-indigo-600 font-bold text-lg transition-all hover:-translate-y-1"
            >
              Dạy trên StudyMate
            </Link>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
              Học mọi lúc mọi nơi
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
              Chứng chỉ hoàn thành
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Placeholder */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Các khóa học nổi bật</h2>
              <p className="text-slate-600">Được lựa chọn cẩn thận để giúp bạn bắt đầu lộ trình học tập.</p>
            </div>
            <Link href="#" className="hidden sm:block text-purple-600 font-semibold hover:text-purple-800 transition">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_COURSES.map((course) => (
              <div key={course.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 leading-none">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {course.id === 1 && (
                    <div className="absolute top-4 left-4 bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1 rounded-full shadow-md">Bán chạy</div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
                    {course.category}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 font-bold">{course.rating}</span>
                      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-slate-400 ml-1">({course.students})</span>
                    </div>
                    <div className="font-bold text-slate-900">{course.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <p>© 2026 StudyMate LMS. Demo Interface for Evaluation.</p>
      </footer>
    </div>
  );
}
