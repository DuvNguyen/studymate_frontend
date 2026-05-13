'use client';

import { useState, useEffect } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/Button';
import { Pagination } from '@/components/Pagination';

export default function CourseManagementQueue() {
  const { courses, meta, loading, fetchCourses, approveCourse, rejectCourse, suspendCourse } = useAdminCourses();
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Tabs & Search states
  const [activeTab, setActiveTab] = useState<'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ALL'>('PENDING_REVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [page, setPage] = useState(1);
  const [triggerFetch, setTriggerFetch] = useState(0);

  const [rejectReason, setRejectReason] = useState('');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendingCourseId, setSuspendingCourseId] = useState<number | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchCourses({ page, limit: 5, status: activeTab, search: searchQuery, categoryId: filterCategory ? String(filterCategory) : '' });
  }, [fetchCourses, activeTab, triggerFetch, page, filterCategory, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    setTriggerFetch(prev => prev + 1);
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm("Xác nhận phê duyệt khóa học này? Khóa học sẽ được PUBLISH.")) return;
    try {
      await approveCourse(id);
      handleSearch();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await rejectCourse(id, rejectReason);
      setRejectReason('');
      setActiveCourseId(null);
      handleSearch();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSuspend = async (id: number) => {
    if (!suspendReason.trim()) {
      alert('Vui lòng nhập lý do đình chỉ');
      return;
    }
    try {
      await suspendCourse(id, suspendReason);
      setSuspendReason('');
      setSuspendingCourseId(null);
      handleSearch();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-black mb-1">Quản lý Khóa học</p>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight leading-none">Admin Hub</h1>
        </div>
        <Button onClick={handleSearch} variant="outline" size="sm">
          Làm mới ↻
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {[
          { id: 'PENDING_REVIEW', label: 'CHỜ DUYỆT' },
          { id: 'PUBLISHED', label: 'ĐANG HOẠT ĐỘNG' },
          { id: 'REJECTED', label: 'TỪ CHỐI / ĐÌNH CHỈ' },
          { id: 'ALL', label: 'TẤT CẢ' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'ALL')}
            className={`px-6 py-3 font-black uppercase text-sm border-2 border-black whitespace-nowrap transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-px hover:translate-x-px hover:shadow-none ${
              activeTab === tab.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-black text-black uppercase mb-1">Tìm kiếm khóa học</label>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Nhập tên khóa học..."
            className="w-full bg-white border-2 border-black px-4 py-2 font-black text-black outline-none focus:bg-yellow-100 placeholder:text-black/50"
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-black text-black uppercase mb-1">Danh mục</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : '')}
            className="w-full bg-white border-2 border-black px-4 py-2 font-black text-black outline-none focus:bg-yellow-100 disabled:opacity-50"
            disabled={categoriesLoading}
          >
            <option value="">-- TẤT CẢ --</option>
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
        <Button 
          onClick={handleSearch}
          className="bg-emerald-400 py-3 px-8 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto"
        >
          LỌC
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-16 text-center text-black">
          <p className="text-xl font-black uppercase tracking-widest leading-none opacity-40">
            {activeTab === 'PENDING_REVIEW' ? 'Không có khóa học nào đang chờ duyệt.' : 'Không tìm thấy kết quả phù hợp.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="relative z-0">
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col md:flex-row gap-8 relative z-10">
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-2xl font-black text-black uppercase leading-tight">
                      {course.title}
                    </h3>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] whitespace-nowrap text-black ${
                      course.status === 'PENDING_REVIEW' ? 'bg-amber-300' :
                      course.status === 'PUBLISHED' ? 'bg-emerald-300' :
                      course.status === 'REJECTED' ? 'bg-red-300' :
                      course.status === 'ARCHIVED' ? 'bg-gray-300' : 'bg-gray-100'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <p className="text-xs font-black text-black mb-6 uppercase tracking-widest opacity-80">
                    GV: {course.instructor?.fullName || 'N/A'} • Giá: {course.price}đ • Danh mục: {course.category?.name || 'N/A'}
                  </p>
                  
                  {course.rejectionReason && (
                    <div className="mb-6 bg-red-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
                      <span className="text-[10px] font-black uppercase text-red-600 mb-1 block">Lý do từ chối/đình chỉ:</span>
                      <p className="text-sm font-black text-black">{course.rejectionReason}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-6 text-sm mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-yellow-50 p-6">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Chương</span>
                      <strong className="text-base font-black text-black underline decoration-2">{course.sectionCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Bài học</span>
                      <strong className="text-base font-black text-black">{course.lessonCount}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/80 block mb-1">Tổng thời lượng</span>
                      <strong className="text-base font-black text-black italic">{Math.floor((course.totalDuration || 0) / 60)} phút</strong>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setExpandedId(expandedId === course.id ? null : course.id)} 
                      variant={expandedId === course.id ? 'primary' : 'outline'}
                      size="sm"
                      className="text-[10px]"
                    >
                      {expandedId === course.id ? 'Đóng chi tiết ∧' : 'Xem nội dung khóa học ∨'}
                    </Button>
                    <a 
                      href={`/courses/${course.slug}/learn`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-yellow-400 border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all text-black"
                    >
                      Học Thử Khóa Học ↗
                    </a>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-48 border-t-4 border-black md:border-t-0 md:border-l-4 md:pl-8 pt-6 md:pt-0">
                  {course.status === 'PENDING_REVIEW' && (
                    <>
                      <Button onClick={() => handleApprove(course.id)} className="bg-emerald-400 py-4 hover:bg-emerald-500 text-black">
                        Phê Duyệt
                      </Button>
                      <Button onClick={() => setActiveCourseId(course.id)} className="bg-red-400 py-4 hover:bg-red-500 text-black">
                        Từ chối
                      </Button>
                    </>
                  )}
                  {course.status === 'PUBLISHED' && (
                    <Button onClick={() => setSuspendingCourseId(course.id)} className="bg-red-400 py-4 hover:bg-red-500 text-black">
                      Tạm Đình Chỉ
                    </Button>
                  )}
                  {course.status === 'REJECTED' && (
                    <Button onClick={() => handleApprove(course.id)} className="bg-amber-400 py-4 hover:bg-amber-500 text-black">
                      Duyệt Lại
                    </Button>
                  )}
                </div>
              </div>

              {/* Chi tiết khóa học */}
              {expandedId === course.id && (
                <div className="bg-white border-x-2 border-b-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 pt-12 mt-[-10px] space-y-8 relative z-0 animate-in slide-in-from-top-4 fade-in duration-300">
                  <div className="space-y-4">
                    <h4 className="font-black text-xs uppercase tracking-[0.3em] border-b-4 border-black pb-2 inline-block text-black">Nội dung chi tiết</h4>
                    
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {course.sections?.map((section: any, index: number) => (
                      <div key={section.id} className="border-2 border-black p-4 mb-4 bg-gray-50">
                        <h5 className="font-black text-sm uppercase text-black mb-3">Chương {index + 1}: {section.title}</h5>
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {section.lessons?.map((lesson: any, lIndex: number) => (
                            <div key={lesson.id} className="bg-white border-2 border-black p-3 text-xs flex justify-between items-center relative overflow-hidden">
                              <span className="font-black relative z-10 text-black">Bài {lIndex + 1}: {lesson.title}</span>
                              <div className="flex gap-2">
                                {lesson.isPreview && <span className="bg-blue-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase text-black">Preview</span>}
                                {lesson.youtubeVideoId ? (
                                  <span className="bg-emerald-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase text-black">Có Video</span>
                                ) : (
                                  <span className="bg-amber-200 border-2 border-black text-[9px] px-2 py-0.5 font-black uppercase text-black">Chưa có video</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {(!section.lessons || section.lessons.length === 0) && (
                            <p className="text-[10px] uppercase font-black text-black/50 italic p-2 border-2 border-dashed border-gray-300">Chương này chưa có bài học.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!course.sections || course.sections.length === 0) && (
                      <div className="bg-yellow-50 border-2 border-black p-4 text-center">
                        <p className="text-xs font-black uppercase italic text-black/60">Khóa học này đang trống, không có nội dung.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeCourseId === course.id && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                  <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
                    <h2 className="text-3xl font-black uppercase mb-6 tracking-tighter leading-none text-black">Từ chối Khóa học</h2>
                    <p className="text-xs font-black text-black uppercase tracking-[0.2em] mb-6">Khóa học: {course.title}</p>
                    
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do chi tiết..."
                      className="w-full border-4 border-black p-6 font-black text-lg bg-gray-50 focus:bg-yellow-50 text-black outline-none placeholder:text-black/50 min-h-[160px] mb-8 shadow-inner transition-colors"
                    />

                    <div className="flex gap-6">
                      <Button onClick={() => handleReject(course.id)} className="flex-1 bg-red-400 text-black py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500">
                        Xác nhận từ chối
                      </Button>
                      <Button onClick={() => { setActiveCourseId(null); setRejectReason(''); }} variant="outline" className="px-10 py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Tạm Đình Chỉ */}
              {suspendingCourseId === course.id && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                  <div className="bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-xl w-full">
                    <h2 className="text-3xl font-black uppercase mb-6 tracking-tighter leading-none text-black">Tạm Đình Chỉ</h2>
                    <p className="text-xs font-black text-black uppercase tracking-[0.2em] mb-6">Khóa học: {course.title}</p>
                    
                    <textarea
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Nhập lý do đình chỉ (VD: Vi phạm bản quyền)..."
                      className="w-full border-4 border-black p-6 font-black text-lg bg-gray-50 focus:bg-yellow-50 text-black outline-none placeholder:text-black/50 min-h-[160px] mb-8 shadow-inner transition-colors"
                    />

                    <div className="flex gap-6">
                      <Button onClick={() => handleSuspend(course.id)} className="flex-1 bg-red-400 text-black py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500">
                        Đình Chỉ Ngay
                      </Button>
                      <Button onClick={() => { setSuspendingCourseId(null); setSuspendReason(''); }} variant="outline" className="px-10 py-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100">
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <Pagination
          currentPage={page}
          totalPages={meta.totalPages}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}
