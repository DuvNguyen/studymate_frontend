'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { toast } from 'react-hot-toast';
import { useCategories } from '@/hooks/useCategories';

export default function InstructorCoursesPage() {
  const { getToken } = useAuth();
  const router = useRouter();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [statusTab, setStatusTab] = useState('ALL');
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number | ''>('');
  const [newLevel, setNewLevel] = useState('BEGINNER');
  const [newPrice, setNewPrice] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [statusTab, triggerFetch]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterCategory) params.append('categoryId', filterCategory.toString());
      if (statusTab !== 'ALL') params.append('status', statusTab);

      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.data || data);
      }
    } catch (e) {
      toast.error('Lỗi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setTriggerFetch(prev => prev + 1);
  };

  const handleArchiveCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ khóa học này không? (Khóa học sẽ bị ẩn khỏi gian hàng chung)')) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3001/api/v1/instructor/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Đã lưu trữ khóa học');
        fetchCourses();
      } else {
        toast.error('Lỗi khi lưu trữ khóa học');
      }
    } catch (e) {
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
    if (newPrice === '' || newPrice < 0) {
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
    } catch (e) {
      toast.error('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-none" />
      </div>
    );
  }

  return (
    <MainLayout role="INSTRUCTOR">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/70 mb-1">Giảng viên</p>
            <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Khóa học của tôi</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-transform"
          >
            + TẠO KHÓA HỌC
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-black uppercase mb-1 text-black">Tìm kiếm khóa học</label>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập tên khóa học..."
              className="w-full bg-white border-2 border-black px-4 py-2 font-black text-black outline-none focus:bg-yellow-100"
            />
          </div>
          <div className="w-64">
            <label className="block text-xs font-black uppercase mb-1 text-black">Danh mục</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-white border-2 border-black px-4 py-2 font-black text-black outline-none focus:bg-yellow-100 disabled:opacity-50"
              disabled={categoriesLoading}
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
          </div>
          <button 
            onClick={handleSearch}
            className="bg-emerald-400 border-2 border-black px-6 py-2 font-black uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 hover:translate-y-px hover:translate-x-px hover:shadow-none transition-all"
          >
            TÌM KIẾM
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 pb-2 overflow-x-auto">
          {['ALL', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'ARCHIVED'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-2 font-black uppercase text-xs border-2 border-black whitespace-nowrap transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none ${
                statusTab === tab ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {tab === 'ALL' ? 'TẤT CẢ' : tab === 'DRAFT' ? 'NHÁP' : tab === 'PENDING_REVIEW' ? 'ĐANG DUYỆT' : tab === 'PUBLISHED' ? 'ĐANG BÁN' : 'ĐÃ LƯU TRỮ'}
            </button>
          ))}
        </div>

        {courses.length === 0 ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center">
            <p className="text-xl font-black uppercase tracking-widest text-black/40 leading-none">
              Bạn chưa có khóa học nào.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-black uppercase leading-tight mb-1">{course.title}</h3>
                  <div className="flex gap-2 items-center flex-wrap">
                    <span className="px-3 py-1 bg-yellow-100 text-black border-2 border-black font-black text-xs uppercase shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {course.status}
                    </span>
                    <span className="text-xs font-black text-black uppercase border-2 border-black px-2 py-1">
                      Danh mục: {course.category?.name || 'Đã chọn'}
                    </span>
                    <span className="text-xs font-black text-black uppercase border-2 border-black px-2 py-1">
                      Mức độ: {course.level}
                    </span>
                    <span className="text-xs font-black text-black uppercase border-2 border-black px-2 py-1 bg-green-100">
                      Giá: {course.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => router.push(`/dashboard/instructor/courses/${course.id}/builder`)}
                    className="flex-1 md:flex-none px-6 py-3 bg-emerald-400 text-black font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    XÂY DỰNG
                  </button>
                  {course.status !== 'ARCHIVED' && (
                    <button 
                      onClick={() => handleArchiveCourse(course.id)}
                      className="px-4 py-3 bg-red-500 text-black font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:translate-y-px hover:translate-x-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                      title="Lưu trữ khóa học"
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-2xl font-black hover:rotate-90 transition-transform"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black uppercase mb-6 tracking-tighter leading-none border-b-4 border-black pb-4">Tạo Khóa Học Mới</h2>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                  Tên khóa học
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Nhập tên khóa học..."
                  className="w-full border-2 border-black p-4 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder-gray-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                  Giá bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Nhập giá khóa học..."
                  min="0"
                  className="w-full border-2 border-black p-4 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none placeholder-gray-500 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                  Trình độ (Level)
                </label>
                <select
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value)}
                  className="w-full border-2 border-black p-4 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all"
                >
                  <option value="BEGINNER">Cơ bản</option>
                  <option value="INTERMEDIATE">Trung bình</option>
                  <option value="ADVANCED">Nâng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2 text-black">
                  Danh mục
                </label>
                <select
                  value={newCategoryId}
                  onChange={e => setNewCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border-2 border-black p-4 font-black text-lg bg-gray-50 focus:bg-yellow-50 outline-none disabled:opacity-50 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:translate-x-[2px] transition-all"
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
                {categoriesLoading && <p className="text-[10px] uppercase font-bold mt-1 text-amber-600">Đang tải danh mục...</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-white border-2 border-black px-6 py-4 font-black uppercase tracking-widest text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none transition-all"
              >
                HỦY
              </button>
              <button 
                onClick={handleCreateDraft}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-400 border-2 border-black px-6 py-4 font-black text-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-500 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'ĐANG TẠO...' : 'TẠO MỚI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
