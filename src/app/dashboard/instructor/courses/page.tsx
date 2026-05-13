'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';
import { useCategories } from '@/hooks/useCategories';
import { BookPlus, Search, Layout, PlayCircle, FolderArchive, FolderOpen, Plus } from 'lucide-react';
import Image from 'next/image';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/Button';

export default function InstructorCoursesPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | ''>('');
  const [newLevel, setNewLevel] = useState('BEGINNER');
  const [newPrice, setNewPrice] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('categoryId', filterCategory.toString());
      if (statusTab !== 'ALL') params.append('status', statusTab);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        // Xử lý các tầng bọc dữ liệu: { success: true, data: { data: [], meta: {} } }
        let courseList = [];
        if (json.data) {
          if (Array.isArray(json.data.data)) {
            courseList = json.data.data;
            if (json.data.meta?.totalPages) setTotalPages(json.data.meta.totalPages);
          } else if (Array.isArray(json.data)) {
            courseList = json.data;
          }
        } else if (Array.isArray(json)) {
          courseList = json;
        }

        setCourses(courseList);
      }
    } catch {
      toast.error('Lỗi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab, triggerFetch, page]);

  const handleSearch = () => {
    setPage(1);
    setTriggerFetch(prev => prev + 1);
  };

  const handleArchiveCourse = async (courseId: number, isArchived: boolean) => {
    const action = isArchived ? 'mở lưu trữ' : 'lưu trữ';
    if (!confirm(`Bạn có chắc chắn muốn ${action} khóa học này không?`)) return;
    try {
      const token = await getToken();
      const endpoint = isArchived ? 'unarchive' : 'archive';
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${courseId}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Đã ${action} khóa học`);
        fetchCourses();
      } else {
        toast.error(`Lỗi khi ${action} khóa học`);
      }
    } catch {
      toast.error('Lỗi kết nối');
    }
  };

  const handleCreateDraft = async () => {
    if (!newTitle.trim()) {
      toast.error('Vui lòng nhập tên khóa học');
      return;
    }
    if (!newCategoryId) {
      toast.error('Vui lòng chọn danh mục');
      return;
    }
    if (newPrice === '' || Number(newPrice) < 0) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/v1/instructor/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: newTitle.trim(), 
          categoryId: Number(newCategoryId),
          level: newLevel,
          price: Number(newPrice)
        })
      });
      if (res.ok) {
        const resData = await res.json();
        const courseId = resData.data?.id || resData.id;
        router.push(`/dashboard/instructor/courses/${courseId}/builder`);
      } else {
        toast.error('Không thể tạo khóa học mới');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <MainLayout role="INSTRUCTOR" allowedRoles={['INSTRUCTOR']}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2 block">Giảng viên</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black">Khóa học của tôi</h1>
          </div>
          <Button 
            className="w-full md:w-auto bg-black text-white hover:bg-yellow-400 hover:text-black transition-all group h-16 px-10 text-xl font-black"
            onClick={() => setIsModalOpen(true)}
          >
           <Plus className="w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" />
           TẠO KHÓA HỌC
          </Button>
        </div>

        {/* Filters section */}
        <div className="bg-amber-50 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block font-black uppercase text-xs mb-2 text-black">Tìm kiếm khóa học</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-black" />
              </div>
              <input 
                type="text" 
                placeholder="Nhập tên khóa học..."
                className="w-full bg-white border-4 border-black p-4 pl-12 font-bold focus:ring-4 focus:ring-yellow-400 outline-none transition-all placeholder:text-gray-300 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="block font-black uppercase text-xs mb-2 text-black">Danh mục</label>
            <div className="flex gap-2">
              <select 
                className="w-full bg-white border-4 border-black p-4 font-bold outline-none cursor-pointer focus:ring-4 focus:ring-yellow-400 text-black"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- TẤT CẢ DANH MỤC --</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name.toUpperCase()} className="font-black bg-gray-200">
                    {cat.children && cat.children.map(sub => (
                      <option key={sub.id} value={sub.id} className="font-bold bg-white">
                        {sub.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <Button onClick={handleSearch} className="aspect-square p-0 w-16 bg-black text-white hover:bg-yellow-400">
                <Search className="w-6 h-6 m-auto" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="flex flex-wrap gap-2 border-b-4 border-black pb-4">
           {['ALL', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'].map((status) => (
             <button
              key={status}
              onClick={() => { setStatusTab(status); setPage(1); }}
              className={`px-6 py-2 font-black uppercase tracking-tighter border-4 border-black transition-all ${
                statusTab === status 
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-y-1' 
                : 'bg-white text-black hover:bg-gray-100 hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}
             >
               {status === 'ALL' ? 'Tất cả' : 
                status === 'DRAFT' ? 'Nháp' :
                status === 'PENDING_REVIEW' ? 'Đang duyệt' : 
                status === 'PUBLISHED' ? 'Đang bán' : 'Đã lưu trữ'}
             </button>
           ))}
        </div>

        {/* Courses list */}
        <div className="space-y-6">
          {courses.length > 0 ? (
            <>
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="group bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all flex flex-col md:flex-row gap-8 items-center"
                >
                   {/* Thumbnail */}
                   <div className="w-full md:w-64 h-40 border-4 border-black relative overflow-hidden bg-gray-100">
                     {course.thumbnailUrl ? (
                       <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <Layout className="w-12 h-12" />
                       </div>
                     )}
                   </div>

                   {/* Info - REDESIGN: Chữ màu đen hết, chuyên nghiệp */}
                   <div className="flex-1 space-y-4 text-center md:text-left">
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none group-hover:text-amber-600 transition-colors text-black">
                        {course.title}
                      </h3>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                         {/* High contrast labels instead of colors */}
                         <div className="border-2 border-black px-3 py-1 bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-1">
                            {course.status === 'PUBLISHED' ? 'ĐANG BÁN' : 
                             course.status === 'DRAFT' ? 'BẢN NHÁP' : 
                             course.status === 'PENDING_REVIEW' ? 'ĐANG CHỜ DUYỆT' : 'ĐÃ LƯU TRỮ'}
                         </div>
                         <div className="border-2 border-black px-3 py-1 bg-white text-[10px] font-black uppercase tracking-widest text-black">
                            DANH MỤC: {course.category?.name || 'CHƯA PHÂN LOẠI'}
                         </div>
                         <div className="border-2 border-black px-3 py-1 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest">
                            MỨC ĐỘ: {course.level || 'CƠ BẢN'}
                         </div>
                         <div className="border-2 border-black px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest italic">
                            GIÁ: {course.price === 0 ? 'MIỄN PHÍ' : `${course.price.toLocaleString('vi-VN')}Đ`}
                         </div>
                      </div>

                      <div className="flex items-center justify-center md:justify-start gap-6 text-xs font-bold text-black uppercase italic opacity-70">
                         <div className="flex items-center gap-1">
                           <Layout className="w-4 h-4" />
                           {course.sectionCount || 0} Chương
                         </div>
                         <div className="flex items-center gap-1">
                           <PlayCircle className="w-4 h-4" />
                           {course.lessonCount || 0} Bài học
                         </div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex gap-4 w-full md:w-auto">
                      <Button 
                        className="flex-1 md:w-32 bg-emerald-400 hover:bg-emerald-500 h-16 text-black font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/builder`)}
                      >
                        XÂY DỰNG
                      </Button>
                      <Button 
                          className="flex-1 md:w-32 bg-amber-400 hover:bg-white h-16 text-black font-black uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          onClick={() => router.push(`/courses/${course.slug}/instructor-view`)}
                        >
                          XEM TRƯỚC
                      </Button>
                      <Button 
                        className={`w-16 h-16 p-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                          course.status === 'ARCHIVED' 
                          ? 'bg-emerald-400 hover:bg-emerald-500 text-black' 
                          : 'bg-rose-500 hover:bg-yellow-400 text-black'
                        }`}
                        onClick={() => handleArchiveCourse(course.id, course.status === 'ARCHIVED')}
                        title={course.status === 'ARCHIVED' ? 'Mở lưu trữ' : 'Lưu trữ'}
                      >
                        {course.status === 'ARCHIVED' ? (
                          <FolderOpen className="w-8 h-8 m-auto" />
                        ) : (
                          <FolderArchive className="w-8 h-8 m-auto" />
                        )}
                      </Button>
                   </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 py-8 border-t-4 border-black">
                   <Button 
                    className={`h-12 px-6 border-4 border-black font-black uppercase ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-white text-black hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                   >
                     Trước
                   </Button>
                   
                   <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i+1}
                          onClick={() => setPage(i + 1)}
                          className={`w-12 h-12 border-4 border-black font-black transition-all ${
                            page === i + 1 
                            ? 'bg-black text-white translate-y-1 shadow-none' 
                            : 'bg-white text-black hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                   </div>

                   <Button 
                    className={`h-12 px-6 border-4 border-black font-black uppercase ${page === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-white text-black hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   >
                     Sau
                   </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState 
              icon={BookPlus}
              title="KHÔNG THẤY KHÓA HỌC NÀO"
              description="BẠN CHƯA CÓ KHÓA HỌC NÀO TRONG DANH SÁCH NÀY. HÃY BẮT ĐẦU XÂY DỰNG NỘI DUNG ĐỂ CHIA SẺ KIẾN THỨC NGAY HÔM NAY!"
              action={{
                label: "+ TẠO KHÓA HỌC MỚI",
                onClick: () => setIsModalOpen(true)
              }}
            />
          )}
        </div>
      </div>

      {/* Modal - Giữ nguyên logic cũ nhưng wrap đẹp */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-2xl font-black hover:rotate-90 transition-transform text-black"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter leading-none border-b-4 border-black pb-4 text-black italic">Tạo Khóa Học Mới</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Tên khóa học</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Nhập tên khóa học..."
                  className="w-full border-4 border-black p-4 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder-gray-300 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] focus:shadow-none transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Giá (VNĐ)</label>
                   <input
                     type="number"
                     value={newPrice}
                     onChange={e => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                     className="w-full border-4 border-black p-4 font-black bg-gray-50 text-black"
                   />
                </div>
                <div>
                   <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Trình độ</label>
                   <select
                     value={newLevel}
                     onChange={e => setNewLevel(e.target.value)}
                     className="w-full border-4 border-black p-4 font-black bg-gray-50 text-black"
                   >
                     <option value="BEGINNER">Cơ bản</option>
                     <option value="INTERMEDIATE">Trung bình</option>
                     <option value="ADVANCED">Nâng cao</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">Danh mục</label>
                <select
                  value={newCategoryId}
                  onChange={e => setNewCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border-4 border-black p-4 font-black bg-gray-50 text-black"
                  disabled={categoriesLoading}
                >
                  <option value="" disabled>-- CHỌN DANH MỤC --</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name.toUpperCase()} className="font-black bg-gray-200">
                      {cat.children && cat.children.map(sub => (
                        <option key={sub.id} value={sub.id} className="font-bold bg-white">
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white text-black border-4 border-black h-16 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
              >
                HỦY
              </Button>
              <Button 
                onClick={handleCreateDraft}
                disabled={isSubmitting}
                className="flex-1 bg-black text-white h-16 font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] hover:bg-yellow-400 hover:text-black transition-all"
              >
                {isSubmitting ? 'ĐANG TẠO...' : 'TẠO MỚI'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
