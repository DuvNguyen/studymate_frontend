'use client';

import { useParams } from 'next/navigation';
import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { useCourseDetail } from '@/hooks/useCourseDetail';
import PublicLayout from '@/components/PublicLayout';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useClerk } from '@clerk/nextjs';
import { useWishlist } from '@/hooks/useWishlist';
import { useEnrolledCourses } from '@/hooks/useEnrolledCourses';
import Link from 'next/link';
import Image from 'next/image';
import ReviewSection from '@/components/ReviewSection';

function VideoPreviewModal({ 
  isOpen, 
  onClose, 
  youtubeVideoId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  youtubeVideoId: string | null; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-4xl bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-amber-400 font-bold text-xl focus:outline-none"
        >
          Đóng (X)
        </button>
        <div className="relative pt-[56.25%] w-full">
          {youtubeVideoId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
              title="Course Preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-white p-8 text-center bg-zinc-900">
              <svg className="w-16 h-16 mb-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <h3 className="text-xl font-bold mb-2">Video không khả dụng</h3>
              <p className="text-zinc-400">Video xem trước cho bài học này hiện không có sẵn hoặc gặp lỗi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-36 px-4 items-center">
      <div className="w-full max-w-7xl animate-pulse flex flex-col gap-8 md:flex-row">
        <div className="md:w-2/3 flex flex-col gap-4">
          <div className="h-8 md:h-12 bg-gray-300 w-3/4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="h-6 bg-gray-300 w-1/2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
          <div className="h-40 bg-gray-200 border-4 border-black mt-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>
        <div className="md:w-1/3 flex flex-col gap-4 mt-8 md:mt-0">
          <div className="h-64 bg-gray-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
        </div>
      </div>
    </div>
  );
}

function CourseDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { course, loading, error } = useCourseDetail(slug);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  
  // Modal state
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPreview = (youtubeId: string | null) => {
    setPreviewVideoId(youtubeId);
    setIsModalOpen(true);
  };

  const { addToCart, applyCoupon, removeCoupon, discountAmount, appliedCoupon } = useCart();
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const { signOut, session } = useClerk();
  const {
    enrollments,
    loading: enrollLoading,
    refresh: refreshEnrollments,
  } = useEnrolledCourses();

  // Local input state for the coupon code
  const [couponInput, setCouponInput] = useState('');

  const { isEnrolled, isCompleted } = useMemo(() => {
    if (!course || !enrollments) return { isEnrolled: false, isCompleted: false };
    const enrollment = enrollments.find(e => e.course_id === course.id);
    return {
      isEnrolled: !!enrollment,
      isCompleted: enrollment?.progress_percent === 100
    };
  }, [course, enrollments]);

  // Loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const isTogglingRef = useRef(false);
  const [showRoleMismatchModal, setShowRoleMismatchModal] = useState(false);
  
  const { toggleWishlist, checkInWishlist } = useWishlist();
  const toggleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const lastToastTimeRef = useRef(0);

  useEffect(() => {
    if (course && user) {
      checkInWishlist(course.id).then(res => {
        // Only update from server if we are not actively toggling
        if (!isTogglingRef.current) {
          setIsInWishlist(res);
        }
      });
    }
  }, [course, user, checkInWishlist]);

  const handleRoleMismatchConfirm = async () => {
    setShowRoleMismatchModal(false);
    await signOut();
    window.localStorage.setItem('intended_role', 'STUDENT');
    router.push('/sign-up?role=student');
  };

  const handleAddToCart = async () => {
    if (!course) return;

    // Instructor safety check
    if (user?.role === 'INSTRUCTOR') {
      setShowRoleMismatchModal(true);
      return;
    }

    setIsAdding(true);
    try {
      const res = await addToCart(course.id);
      if (!res.success && res.error) {
        if (res.error === 'Khóa học này đã có trong giỏ hàng') {
          toast('Khóa học này đã có trong giỏ hàng', { icon: '🛒' });
        } else if (res.error === 'Bạn đã sở hữu khóa học này') {
          void refreshEnrollments();
          toast.success('Bạn đã sở hữu khóa học này! Hãy vào Dashboard để học ngay.');
        } else {
          toast.error(res.error);
        }
      } else {
        toast.success('Đã thêm vào giỏ hàng!');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = () => {
    if (!course) return;
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    // 0. Spam Detection
    clickCountRef.current += 1;
    const now = Date.now();
    if (clickCountRef.current > 5 && now - lastToastTimeRef.current > 2000) {
      toast('Bạn đang thao tác hơi nhanh, vui lòng thao tác chậm lại đợi phản hồi từ hệ thống!');
      lastToastTimeRef.current = now;
    }

    // Reset snap count after 2s of inactivity
    setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    // 1. Instant UI Feedback
    const nextState = !isInWishlist;
    setIsInWishlist(nextState);
    isTogglingRef.current = true; // Block useEffect updates

    // 2. Debounce API call
    if (toggleTimerRef.current) clearTimeout(toggleTimerRef.current);

    toggleTimerRef.current = setTimeout(async () => {
      const result = await toggleWishlist(course.id, nextState);
      
      if (result !== null) {
        setIsInWishlist(result);
      } else {
        // Revert on error
        setIsInWishlist(!nextState);
      }
      
      // Allow useEffect updates again after a small delay to ensure server sync
      setTimeout(() => {
        isTogglingRef.current = false;
      }, 500);
    }, 300);
  };

  const handleBuyNow = async () => {
    if (!course) return;

    // Instructor safety check
    if (user?.role === 'INSTRUCTOR') {
      setShowRoleMismatchModal(true);
      return;
    }

    setIsBuying(true);
    try {
      const res = await addToCart(course.id);
      // If successful OR if already in cart (error message check)
      if (res.success || (res.error && res.error === 'Khóa học này đã có trong giỏ hàng')) {
        router.push('/cart');
      } else if (res.error === 'Bạn đã sở hữu khóa học này') {
        void refreshEnrollments();
        toast.success('Bạn đã sở hữu khóa học này! Bấm HỌC NGAY để vào khóa học.');
      } else {
        toast.error(res.error || 'Lỗi thêm vào giỏ hàng');
      }
    } finally {
      setIsBuying(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !course) return;
    const result = await applyCoupon(couponInput.trim(), Number(course.price));
    if (result.success) {
      toast.success('Áp dụng mã giảm giá thành công!');
      setCouponInput('');
    } else {
      toast.error(result.error || 'Mã giảm giá không hợp lệ');
    }
  };

  const handleDirectEnroll = async () => {
    if (!course || !user) return;
    
    setIsEnrolling(true);
    try {
      const token = await session?.getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enrollments/direct`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success('Ghi danh trực tiếp thành công! Đang chuyển hướng...');
        setTimeout(() => router.push('/dashboard/student/courses'), 1500);
      } else {
        toast.error(result.message || 'Lỗi ghi danh trực tiếp');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối server');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  // Trạng thái Lỗi hoặc Không tìm thấy
  const isNotFound = error === 'NOT_FOUND' || (!course && !loading);

  if (error || !course || course.status === 'ARCHIVED') {
    const isArchived = course?.status === 'ARCHIVED';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
          <div className={`w-16 h-16 ${isArchived ? 'bg-amber-100' : 'bg-red-100'} border-4 border-black flex items-center justify-center mx-auto mb-6 -rotate-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
            <span className={`text-3xl font-black ${isArchived ? 'text-amber-600' : 'text-red-600'}`}>{isArchived ? '📦' : (isNotFound ? '?' : '!')}</span>
          </div>
          <h2 className="text-2xl font-black uppercase text-black mb-4">
            {isArchived ? 'Khóa học được lưu trữ' : (isNotFound ? 'Oops! Không tìm thấy' : 'Lỗi hệ thống')}
          </h2>
          <p className="text-sm font-bold text-gray-600 mb-8 border-l-4 border-black pl-4 py-2 bg-gray-50 text-left">
            {isArchived 
              ? 'Khóa học này hiện đã được giảng viên lưu trữ và không còn nhận học viên mới. Nếu bạn đã mua khóa học, vui lòng vào Dashboard để xem chi tiết.'
              : (isNotFound 
                  ? 'Khóa học này không tồn tại hoặc đã được gỡ xuống. Vui lòng kiểm tra lại đường dẫn.' 
                  : `Đã có lỗi xảy ra: ${error || 'Lỗi không xác định'}`)}
          </p>
          <button 
            onClick={() => window.location.href = '/courses'}
            className="w-full px-6 py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-black hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-0 active:translate-x-0 active:shadow-none"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const toggleSection = (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const newExpanded: Record<number, boolean> = {};
    course.sections?.forEach((s) => {
      newExpanded[s.id] = true;
    });
    setExpandedSections(newExpanded);
  };

  const formatDuration = (secs: number) => {
    if (!secs) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}hr ${m}min`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <PublicLayout>
      <div className="bg-white font-sans text-black pb-24">

      {/* Hero Section */}
      <div className="-mt-36 pt-36 bg-zinc-900 border-b-4 border-black text-white relative z-0">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16 md:flex justify-between">
          <div className="md:w-2/3 pr-8 relative z-10">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-amber-400 mb-4">
              <span className="hover:underline cursor-pointer">{course.category?.name}</span>
              <span>/</span>
              <span className="hover:underline cursor-pointer">{course.level}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg md:text-xl font-medium text-zinc-300 mb-6 max-w-2xl">
              {course.description || "Một khóa học tuyệt vời giúp bạn làm chủ các kỹ năng mới."}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold mb-6">
              <div className="flex items-center bg-amber-400 text-black px-2 py-1">
                <span className="mr-1">
                  {course.id === 130 ? '4.8' : (course.avgRating > 0 ? course.avgRating.toFixed(1) : 'Chưa có đánh giá')}
                </span>
                <span>★</span>
              </div>
              <span className="text-zinc-300 underline">
                ({(course.id === 130 ? 5 : course.reviewCount).toLocaleString('vi-VN')} ratings)
              </span>
              <span>{course.studentCount.toLocaleString('vi-VN')} students</span>
            </div>

            <div className="text-sm">
              <p className="mb-2">
                Created by <Link href={`/instructors/${course.instructor?.id}`} className="underline text-amber-400 hover:text-amber-300 font-extrabold cursor-pointer decoration-2 underline-offset-4">{course.instructor?.fullName || 'Instructor'}</Link>
              </p>
              <div className="flex gap-4 text-zinc-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Last updated {new Date(course.publishedAt || course.createdAt).toLocaleDateString('en-GB')}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  {course.language.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative pt-8">
        <div className="md:flex gap-8 lg:gap-16">
          {/* Main Content Area */}
          <div className="md:w-2/3">
            
            {/* What you'll learn */}
            <div className="border-4 border-black p-6 md:p-8 mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black uppercase mb-6">What you&apos;ll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold text-gray-800">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Nắm vững các khái niệm cơ bản về lĩnh vực này.</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Ứng dụng kiến thức vào các dự án thực tế.</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Hiểu sâu các nguyên lý và thực hành chuyên sâu.</span>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  <span>Sẵn sàng cho các công việc ở cấp độ trung bình đến cao.</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="mb-10">
              <h2 className="text-2xl font-black uppercase mb-4">Course content</h2>
              
              <div className="flex justify-between items-center mb-4 text-sm font-bold text-gray-600">
                <div>
                  {course.sectionCount} sections • {course.lessonCount} lectures • {formatDuration(course.totalDuration)} total length
                </div>
                <button onClick={expandAll} className="text-blue-700 hover:text-blue-900 font-extrabold focus:outline-none">
                  Expand all sections
                </button>
              </div>

              <div className="border-2 border-black divide-y-2 divide-black">
                {course.sections && course.sections.length > 0 ? (
                  course.sections.map((section) => {
                    const isExpanded = expandedSections[section.id] ?? false;
                    const sectionDuration = section.lessons ? section.lessons.reduce((acc, l) => acc + l.durationSecs, 0) : 0;
                    
                    return (
                      <div key={section.id} className="bg-white">
                        <button 
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">
                              {isExpanded ? '⌃' : '⌄'}
                            </span>
                            <span className="font-extrabold text-left">{section.title}</span>
                          </div>
                          <div className="text-sm font-bold text-gray-500 whitespace-nowrap">
                            {section.lessons?.length || 0} lectures • {formatDuration(sectionDuration)}
                          </div>
                        </button>
                        
                        {isExpanded && section.lessons && section.lessons.length > 0 && (
                          <div className="p-4 border-t-2 border-black bg-white space-y-3">
                            {section.lessons.map(lesson => (
                              <div key={lesson.id} className="flex justify-between items-center group">
                                <div className="flex items-center gap-3 max-w-[70%]">
                                  <svg className="w-5 h-5 flex-shrink-0 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                  <span className={`text-sm ${lesson.isPreview ? 'text-blue-700 hover:text-blue-900 cursor-pointer underline group-hover:text-blue-800' : 'text-gray-800'}`}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  {lesson.isPreview && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPreview(lesson.youtubeVideoId);
                                      }}
                                      className="text-sm font-bold text-blue-700 underline hover:text-blue-900 focus:outline-none"
                                    >
                                      Preview
                                    </button>
                                  )}
                                  <span className="text-sm text-gray-500">
                                    {formatDuration(lesson.durationSecs)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500 font-bold">
                    Khóa học chưa có nội dung.
                  </div>
                )}
              </div>
            </div>

          </div>



          {/* Sidebar Area (Add to Cart) */}
          <div className="md:w-1/3 relative">
            <div className="hidden md:block absolute -top-80 right-0 w-full z-20">
              {/* Sticky Sidebar */}
              <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24 overflow-hidden">
                {/* Course Thumbnail Image or Preview player */}
                <div 
                  className="relative border-b-2 border-black bg-black pt-[56.25%] overflow-hidden group cursor-pointer"
                  onClick={() => openPreview(course.sections?.[0]?.lessons?.[0]?.youtubeVideoId || null)}
                >
                  {course.thumbnailUrl ? (
                    <Image 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      fill
                      className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-bold">
                      No Preview
                    </div>
                  )}
                  {/* Play icon overlay */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="absolute bottom-4 left-0 w-full text-center font-black text-white px-2">
                    Preview this course
                  </div>
                </div>

                <div className="p-6">
                  {/* Pricing and Cart */}
                  <div className="mb-4">
                    {discountAmount > 0 ? (
                      <div className="flex flex-col">
                        <div className="text-sm font-bold text-gray-500 line-through">
                          ₫{course.price.toLocaleString('vi-VN')}
                        </div>
                        <div className="text-3xl font-black text-emerald-600 tabular-nums">
                          ₫{(Number(course.price) - discountAmount).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-black tabular-nums">
                        ₫{course.price.toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-4">
                    {userLoading || enrollLoading ? (
                      <div className="w-full h-14 bg-gray-200 border-4 border-black animate-pulse shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                    ) : isEnrolled ? (
                      <button 
                        onClick={() => router.push(`/courses/${course.slug}/learn`)}
                        className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all flex items-center justify-center gap-2 uppercase italic tracking-tighter"
                      >
                         <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         HỌC NGAY
                      </button>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          {user?.role === 'ADMIN' || user?.role === 'STAFF' ? (
                            <button 
                              onClick={handleDirectEnroll}
                              disabled={isEnrolling}
                              className="flex-1 bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-200 text-black font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                            >
                              {isEnrolling ? 'Đang ghi danh...' : 'Ghi danh trực tiếp'}
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="flex-1 bg-white hover:bg-amber-400 focus:bg-amber-500 disabled:bg-gray-100 text-black font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                              >
                                {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
                              </button>
                                <button 
                                onClick={handleToggleWishlist} 
                                className={`px-6 py-4 border-4 border-black transition-colors group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none ${isInWishlist ? 'bg-amber-400' : 'bg-white hover:bg-amber-300'}`}
                                title={isInWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
                              >
                                <svg className={`w-6 h-6 group-hover:scale-110 transition-transform ${isInWishlist ? 'fill-black' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        
                        {user?.role !== 'ADMIN' && user?.role !== 'STAFF' && (
                          <button 
                            onClick={handleBuyNow}
                            disabled={isBuying}
                            className="w-full bg-white hover:bg-amber-400 disabled:bg-gray-100 text-black font-black py-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                          >
                            {isBuying ? 'Đang xử lý...' : 'Mua ngay'}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-xs text-center text-gray-500 font-bold mb-6">30-Day Money-Back Guarantee<br/>Full Lifetime Access</p>

                  {/* Apply Coupon — Integrated with CartContext */}
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                    <p className="text-xs font-black uppercase tracking-widest mb-2">Mã giảm giá</p>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border-2 border-emerald-500 px-3 py-2">
                        <div>
                          <p className="text-xs font-black text-emerald-700">{appliedCoupon.toUpperCase()} ✓</p>
                          <p className="text-[10px] font-bold text-emerald-600">
                            Đã áp dụng giảm giá
                          </p>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-sm font-black text-red-500 hover:text-red-700"
                        >✕</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Nhập mã giảm giá"
                          className="flex-1 border-2 border-black px-3 py-1.5 text-sm font-bold outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="bg-black text-white font-black text-xs px-3 py-1.5 border-2 border-black hover:bg-amber-400 hover:text-black transition-colors uppercase whitespace-nowrap"
                        >
                          Áp dụng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Buy Area (shows only on mobile, sticky bottom) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 z-50 flex items-center justify-between shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)]">
                   <div className="text-xl font-black">₫{course.price.toLocaleString('vi-VN')}</div>
                   {userLoading || enrollLoading ? (
                     <div className="w-32 h-12 bg-gray-200 border-2 border-black animate-pulse"></div>
                   ) : isEnrolled ? (
                      <button 
                        onClick={() => router.push(`/courses/${course.slug}/learn`)}
                        className="bg-emerald-400 text-black hover:bg-emerald-500 font-black px-8 py-3 uppercase italic tracking-tighter"
                      >
                        HỌC NGAY
                      </button>
                   ) : (
                     user?.role === 'ADMIN' || user?.role === 'STAFF' ? (
                       <button onClick={handleDirectEnroll} disabled={isEnrolling} className="bg-emerald-400 text-black hover:bg-emerald-500 font-black px-8 py-3">
                         {isEnrolling ? '...' : 'Ghi danh'}
                       </button>
                     ) : (
                       <button onClick={handleBuyNow} disabled={isBuying} className="bg-black text-white hover:bg-gray-800 font-black px-8 py-3">
                         {isBuying ? '...' : 'Mua ngay'}
                       </button>
                     )
                   )}
                </div>
          </div>
        </div>
      </div>
      
      {/* Full-width Reviews Section at the bottom */}
      {course.id && (
        <ReviewSection 
          courseId={course.id} 
          isEnrolled={isEnrolled} 
          isCompleted={isCompleted}
        />
      )}
      
      <VideoPreviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        youtubeVideoId={previewVideoId} 
      />

      <ConfirmModal
        isOpen={showRoleMismatchModal}
        onClose={() => setShowRoleMismatchModal(false)}
        onConfirm={handleRoleMismatchConfirm}
        title="Yêu cầu hệ thống"
        message={`Giảng viên và Học viên phải sử dụng 2 tài khoản riêng biệt.\n\nTài khoản hiện tại của bạn đang là ${user?.role}. Bạn có muốn ĐĂNG XUẤT tài khoản này để tạo tài khoản Học viên mới (bằng một Email khác) không?`}
        confirmText="Đồng ý đăng xuất"
        cancelText="Để sau"
        confirmVariant="warning"
      />
      </div>
    </PublicLayout>
  );
}

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin mb-6"></div>
      </div>
    }>
      <CourseDetailContent key={slug} />
    </Suspense>
  );
}
