'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useInstructorPortfolio } from '@/hooks/useInstructorPortfolio';
import PublicLayout from '@/components/PublicLayout';
import { Button } from '@/components/Button';
import LoadingScreen from '@/components/LoadingScreen';
import EmptyState from '@/components/EmptyState';
import { ArrowLeft, Award, Calendar, User, BookOpen, Quote, FileText } from 'lucide-react';
import Image from 'next/image';

export default function InstructorPortfolioPage() {
  const { id } = useParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: instructor, loading, error } = useInstructorPortfolio(id as string, currentPage, 9);

  const totalPages = instructor ? Math.ceil(instructor.totalCourses / 9) : 0;

  if (loading) {
    return (
      <PublicLayout>
        <LoadingScreen 
          title="ĐANG TẢI HỒ SƠ GIẢNG VIÊN..." 
          description="VUI LÒNG CHỜ GIÂY LÁT TRONG KHI CHÚNG TÔI TRUY XUẤT THÔNG TIN CHUYÊN GIA."
        />
      </PublicLayout>
    );
  }

  if (error || !instructor) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <h1 className="text-4xl font-black uppercase mb-4">404</h1>
            <p className="font-bold mb-8 uppercase text-gray-600">Không tìm thấy thông tin giảng viên</p>
            <Button onClick={() => router.back()} className="w-full">Quay lại</Button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header/Hero Section */}
        <div className="bg-zinc-900 border-b-8 border-black pt-10 pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-white font-black uppercase tracking-tighter mb-10 hover:text-yellow-400 transition-colors"
            >
              <div className="bg-white group-hover:bg-yellow-400 p-1 border-2 border-black">
                <ArrowLeft className="w-4 h-4 text-black" />
              </div>
              Quay lại
            </button>

            <div className="md:flex gap-10 items-end">
              <div className="relative w-48 h-48 md:w-64 md:h-64 border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-8 md:mb-0 flex-shrink-0">
                {instructor.avatarUrl ? (
                  <Image 
                    src={instructor.avatarUrl} 
                    alt={instructor.fullName} 
                    fill sizes="(max-width: 768px) 192px, 256px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-yellow-400">
                    <User className="w-24 h-24 text-black" />
                  </div>
                )}
              </div>
              
              <div className="text-white">
                <div className="inline-block bg-yellow-400 text-black px-4 py-1 font-black uppercase tracking-widest text-sm border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  GIẢNG VIÊN CHÍNH THỨC
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
                  {instructor.fullName}
                </h1>
                <div className="flex flex-wrap gap-6 text-white font-bold uppercase text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Gia nhập từ {new Date(instructor.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Chuyên gia đào tạo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 -mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Sidebar info */}
            <div className="space-y-8">
              <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black uppercase mb-6 border-b-4 border-black pb-2 text-black">Liên hệ & Mạng xã hội</h3>
                <div className="space-y-4 font-bold text-black italic">
                  <p>Hệ thống StudyMate</p>
                  <p>Hỗ trợ học viên 24/7</p>
                </div>
                 <Button 
                   className="w-full mt-6 bg-black text-white hover:bg-yellow-400"
                   onClick={() => window.open('https://zalo.me/0987834129', '_blank')}
                 >
                   GỬI TIN NHẮN
                 </Button>
              </div>

              <div className="bg-amber-100 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-1">
                 <h3 className="text-xl font-black uppercase mb-4 text-black">Cam kết chất lượng</h3>
                 <p className="text-sm font-bold leading-relaxed text-black">
                   Mọi khóa học của {instructor.fullName} đều được kiểm duyệt nghiêm ngặt về nội dung và thực hành thực tế.
                 </p>
              </div>
            </div>

            {/* Main bio and certificates */}
            <div className="lg:col-span-2 space-y-12">
               {/* Bio */}
               <section>
                 <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3 text-white">
                   <div className="w-2 h-8 bg-yellow-400 border-2 border-black"></div>
                   Về giảng viên
                 </h2>
                 <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                    {instructor.bio && instructor.bio !== 'Chưa có thông tin giới thiệu.' ? (
                      <p className="text-lg font-bold leading-relaxed whitespace-pre-line text-gray-800 italic">
                        &quot;{instructor.bio}&quot;
                      </p>
                    ) : (
                      <EmptyState 
                        compact 
                        icon={Quote}
                        title="CHƯA CẬP NHẬT GIỚI THIỆU"
                        description="GIẢNG VIÊN NÀY HIỆN CHƯA CẬP NHẬT THÔNG TIN GIỚI THIỆU BẢN THÂN. HÃY QUAY LẠI SAU NHÉ!"
                      />
                    )}
                 </div>
               </section>

               {/* Certificates */}
               <section>
                 <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3 text-black">
                   <div className="w-2 h-8 bg-black"></div>
                   Bằng cấp & Chứng chỉ
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instructor.certificates && instructor.certificates.length > 0 ? (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      instructor.certificates.map((cert: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform group cursor-pointer"
                          onClick={() => cert.url && window.open(cert.url, '_blank')}
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div className="p-2 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <Award className="w-6 h-6 text-black" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-black">VERIFIED</span>
                           </div>
                           <h4 className="font-black text-lg uppercase leading-tight mb-2 group-hover:text-amber-600 transition-colors text-black">
                             {cert.name || 'Chứng chỉ chuyên môn'}
                           </h4>
                           <p className="text-xs font-bold text-black uppercase tracking-tighter">
                             Click để xem bản gốc
                           </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full">
                        <EmptyState 
                          compact
                          icon={FileText}
                          title="CHƯA CÓ BẰNG CẤP CÔNG KHAI"
                          description="GIẢNG VIÊN CHƯA CẬP NHẬT HOẶC CHƯA CÔNG KHAI CÁC BẰNG CẤP VÀ CHỨNG CHỈ CHUYÊN MÔN."
                        />
                      </div>
                    )}
                 </div>
                </section>
              </div>
            </div>
          </div>

       
        <div className="max-w-5xl mx-auto px-4 mt-20">
           <section>
             <h2 className="text-4xl font-black uppercase mb-10 flex items-center gap-3 text-black">
               <div className="w-3 h-10 bg-black"></div>
               Khóa học đang giảng dạy
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
               {instructor.courses && instructor.courses.length > 0 ? (
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  instructor.courses.map((course: any) => (
                   <div 
                     key={course.id} 
                     className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group flex flex-col h-full"
                     onClick={() => router.push(`/courses/${course.slug}`)}
                   >
                      <div className="relative h-48 border-b-4 border-black overflow-hidden bg-gray-100">
                        {course.thumbnailUrl ? (
                          <Image 
                            src={course.thumbnailUrl} 
                            alt={course.title} 
                            fill sizes="(max-width: 768px) 192px, 256px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-black/20" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="bg-yellow-400 border-2 border-black px-3 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                            {course.categoryName || 'General'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <h4 className="text-xl font-black uppercase leading-tight mb-4 group-hover:text-amber-600 transition-colors text-black">
                          {course.title}
                        </h4>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-1 bg-gray-50 text-black">
                            {course.level}
                          </span>
                          <span className="text-xl font-black italic text-black">
                            {course.price === 0 ? 'MIỄN PHÍ' : `${course.price.toLocaleString('vi-VN')}Đ`}
                          </span>
                        </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="col-span-full">
                   <EmptyState 
                     compact
                     icon={BookOpen}
                     title="CHƯA CÓ KHÓA HỌC CÔNG KHAI"
                     description="GIẢNG VIÊN HIỆN TẠI CHƯA CÓ KHÓA HỌC NÀO ĐƯỢC XUẤT BẢN TRÊN HỆ THỐNG."
                   />
                 </div>
               )}
             </div>

             {/* Pagination Controls */}
             {totalPages > 1 && (
               <div className="flex justify-center items-center gap-4 mt-16 py-10 border-t-4 border-black">
                  <Button 
                   variant="outline"
                   className={`h-12 px-8 border-4 border-black font-black uppercase text-black ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-white hover:bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                   disabled={currentPage === 1}
                   onClick={() => setCurrentPage((p: number) => Math.max(1, p - 1))}
                  >
                    Trước
                  </Button>
                  
                  <div className="flex gap-2">
                     {[...Array(totalPages)].map((_, i) => (
                       <button
                         key={i+1}
                         onClick={() => setCurrentPage(i + 1)}
                         className={`w-12 h-12 border-4 border-black font-black transition-all ${
                           currentPage === i + 1 
                           ? 'bg-black text-white translate-y-1 shadow-none' 
                           : 'bg-white text-black hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                         }`}
                       >
                         {i + 1}
                       </button>
                     ))}
                  </div>

                  <Button 
                   variant="outline"
                   className={`h-12 px-8 border-4 border-black font-black uppercase text-black ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-white hover:bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}`}
                   disabled={currentPage === totalPages}
                   onClick={() => setCurrentPage((p: number) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </Button>
               </div>
             )}
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
