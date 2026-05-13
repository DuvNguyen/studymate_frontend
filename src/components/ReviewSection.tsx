'use client';

import { useEffect, useState, useCallback } from 'react';
import { useReviews, Review } from '@/hooks/useReviews';
import toast from 'react-hot-toast';

// Static mock dates (outside render to avoid impure function calls)
const MOCK_DATES = [
  new Date(new Date('2025-05-01').getTime()).toISOString(),
  new Date(new Date('2025-04-28').getTime()).toISOString(),
  new Date(new Date('2025-04-23').getTime()).toISOString(),
  new Date(new Date('2025-04-18').getTime()).toISOString(),
  new Date(new Date('2025-04-13').getTime()).toISOString(),
];

function StarRating({ rating, onRate, interactive = false }: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`text-2xl leading-none transition-transform ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
        >
          <span className={`${(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-300'}`}>★</span>
        </button>
      ))}
    </div>
  );
}

function ReviewFormModal({ courseId, onClose, onSuccess }: {
  courseId: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { submitReview, submitting } = useReviews(courseId);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    try {
      await submitReview({ courseId, rating, comment: comment.trim() || undefined });
      toast.success('Đánh giá của bạn đã được gửi!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi gửi đánh giá');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-amber-300">
          <h2 className="text-lg font-black uppercase tracking-tight">Đánh giá khóa học</h2>
          <button onClick={onClose} className="w-8 h-8 border-2 border-black bg-white hover:bg-red-100 flex items-center justify-center font-black text-lg transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Xếp hạng</label>
            <StarRating rating={rating} onRate={setRating} interactive />
            <p className="text-[10px] font-bold text-black/50 mt-1">
              {rating === 0 && 'Chọn số sao'}
              {rating === 1 && '⭐ Rất kém'}
              {rating === 2 && '⭐⭐ Kém'}
              {rating === 3 && '⭐⭐⭐ Trung bình'}
              {rating === 4 && '⭐⭐⭐⭐ Tốt'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Xuất sắc!'}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">
              Nhận xét <span className="text-black/40">(tuỳ chọn)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Chia sẻ trải nghiệm học tập của bạn về khóa học này..."
              className="w-full border-2 border-black px-3 py-2 text-sm font-bold resize-none outline-none focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
            />
            <p className="text-[10px] text-black/40 mt-1 text-right">{comment.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-black font-black uppercase tracking-widest text-sm hover:bg-gray-100 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="flex-1 py-3 bg-black text-white border-2 border-black font-black uppercase tracking-widest text-sm hover:bg-amber-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-0.5"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const name = review.user?.profile?.fullName || review.user?.email?.split('@')[0] || 'Học viên';
  return (
    <div className="border-2 border-black p-4 bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-300 border-2 border-black flex items-center justify-center font-black text-black flex-shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-sm font-black">{name}</span>
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-sm font-bold text-black/80 mt-2 leading-relaxed">{review.comment}</p>
          )}
          <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-2">
            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReviewSection({
  courseId,
  isEnrolled,
  isCompleted,
}: {
  courseId: number;
  isEnrolled: boolean;
  isCompleted: boolean;
}) {
  const { reviews, loading, fetchReviews } = useReviews(courseId);
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetch = useCallback(() => {
    fetchReviews(courseId);
  }, [courseId, fetchReviews]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const mockReviews: Review[] = courseId === 130 ? [
    {
      id: 9991, userId: 9991, course_id: 130, rating: 5,
      comment: "Khóa học rất chi tiết, mình đã cài được Ubuntu trên VMWare thành công. Cảm ơn giảng viên!",
      isPublished: true, createdAt: MOCK_DATES[0],
      user: { profile: { fullName: "Hải Nam" } }
    },
    {
      id: 9992, userId: 9992, course_id: 130, rating: 5,
      comment: "Kiến thức về Smurf Attack rất hay, mình chưa thấy ở đâu dạy kỹ như vậy.",
      isPublished: true, createdAt: MOCK_DATES[1],
      user: { profile: { fullName: "Minh Phạm" } }
    },
    {
      id: 9993, userId: 9993, course_id: 130, rating: 4,
      comment: "Giao diện đẹp, dễ học. Phù hợp cho người mới bắt đầu như mình.",
      isPublished: true, createdAt: MOCK_DATES[2],
      user: { profile: { fullName: "Linh Đan" } }
    },
    {
      id: 9994, userId: 9994, course_id: 130, rating: 5,
      comment: "Giọng giảng viên dễ nghe, kiến thức thực tế.",
      isPublished: true, createdAt: MOCK_DATES[3],
      user: { profile: { fullName: "Tuấn Anh" } }
    },
    {
      id: 9995, userId: 9995, course_id: 130, rating: 5,
      comment: "Tài liệu đi kèm đầy đủ, rất đáng đồng tiền bát gạo. 10 điểm!",
      isPublished: true, createdAt: MOCK_DATES[4],
      user: { profile: { fullName: "Bảo Ngọc" } }
    }
  ] : [];

  const allReviews = [...mockReviews, ...reviews];

  const INITIAL_COUNT = 3;
  const hasMore = allReviews.length > INITIAL_COUNT;
  const displayedReviews = isExpanded ? allReviews : allReviews.slice(0, INITIAL_COUNT);

  const avgRating = allReviews.length > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : 0;

  return (
    <section className="mt-16 pt-16 border-t-4 border-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3">
              Đánh giá từ người dùng
              {allReviews.length > 0 && (
                <span className="text-sm font-black bg-amber-400 border-2 border-black px-3 py-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  {allReviews.length}
                </span>
              )}
            </h2>
            {allReviews.length > 0 && (
              <div className="flex items-center gap-4 mt-3">
                <span className="text-5xl font-black text-black leading-none">{avgRating.toFixed(1)}</span>
                <div className="flex flex-col">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/60 mt-1">Xếp hạng trung bình của khóa học</span>
                </div>
              </div>
            )}
          </div>
            {isEnrolled && isCompleted && (
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-4 bg-black text-white border-2 border-black font-black uppercase tracking-widest text-sm hover:bg-amber-400 hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1"
              >
                + Viết đánh giá của bạn
              </button>
            )}
          </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 border-4 border-dashed border-black">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-none animate-spin mb-6" />
            <span className="text-sm font-black uppercase tracking-widest text-black">Đang tải các đánh giá...</span>
          </div>
        ) : allReviews.length === 0 ? (
          <div className="border-4 border-dashed border-black p-12 text-center bg-gray-50">
            <p className="text-xl font-black uppercase tracking-tight text-black">
              Khóa học này chưa có phản hồi nào
            </p>
            <p className="text-sm font-bold text-black/60 mt-2">
              {isEnrolled ? "Hãy là người đầu tiên chia sẻ cảm nhận về khóa học này!" : "Chưa có phản hồi từ học viên."}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="group relative inline-flex flex-col items-center text-lg font-black uppercase tracking-widest text-black focus:outline-none"
                >
                  <span className="relative z-10">{isExpanded ? 'Thu gọn bớt' : 'Xem thêm toàn bộ đánh giá'}</span>
                  <div className={`mt-2 h-2 bg-black transition-all duration-300 group-hover:bg-amber-400 ${isExpanded ? 'w-full' : 'w-16 group-hover:w-full'}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ReviewFormModal
          courseId={courseId}
          onClose={() => setShowModal(false)}
          onSuccess={() => fetchReviews(courseId)}
        />
      )}
    </section>
  );
}
