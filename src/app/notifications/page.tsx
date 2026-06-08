'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNotifications, Notification, NotificationCategory } from '@/hooks/useNotifications';
import { Bell, BookOpen, CheckCheck, CreditCard, MoreHorizontal, ShieldAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const categoryFilters: Array<{ label: string; value: NotificationCategory | 'ALL'; icon: React.ReactNode }> = [
  { label: 'Tất cả', value: 'ALL', icon: <Bell className="w-4 h-4" /> },
  { label: 'Học tập', value: 'LEARNING', icon: <BookOpen className="w-4 h-4" /> },
  { label: 'Tài chính', value: 'TRANSACTIONS', icon: <CreditCard className="w-4 h-4" /> },
  { label: 'Hệ thống', value: 'SYSTEM', icon: <ShieldAlert className="w-4 h-4" /> },
];

function formatRelativeTime(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
}

function getCategoryMeta(category?: NotificationCategory) {
  if (category === 'TRANSACTIONS') return { label: 'Tài chính', icon: '₫', bg: 'bg-emerald-100' };
  if (category === 'SYSTEM') return { label: 'Hệ thống', icon: '!', bg: 'bg-red-100' };
  return { label: 'Học tập', icon: '✓', bg: 'bg-amber-300' };
}

function getAvatarText(notification: Notification) {
  if (notification.type === 'ORDER' || notification.type === 'WALLET') return '₫';
  if (notification.type === 'QUIZ') return 'Q';
  if (notification.type === 'COURSE' || notification.type === 'ENROLLMENT') return 'S';
  return 'N';
}

export default function NotificationsPage() {
  const { fetchNotifications, markAllAsRead, deleteOldNotifications, openNotification } = useNotifications();
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'ALL'>('ALL');
  const [status, setStatus] = useState<'all' | 'unread'>('all');
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const limit = 12;

  const category = activeCategory === 'ALL' ? undefined : activeCategory;
  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const result = await fetchNotifications({
      page,
      limit,
      category,
      status: status === 'unread' ? 'unread' : undefined,
    });
    setItems(result.data);
    setTotalPages(Math.max(1, result.meta?.totalPages || 1));
    setTotal(result.meta?.total || result.data.length);
    setLoading(false);
  }, [category, fetchNotifications, page, status]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, status]);

  const handleMarkAll = async () => {
    setIsMutating(true);
    await markAllAsRead(category);
    await loadNotifications();
    setIsMutating(false);
    toast.success('Đã đánh dấu thông báo là đã đọc');
  };

  const handleDeleteOld = async () => {
    setIsMutating(true);
    const deleted = await deleteOldNotifications();
    await loadNotifications();
    setIsMutating(false);
    toast.success(`Đã xóa ${deleted} thông báo cũ`);
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-120px)] bg-gray-50 px-3 py-6 text-black">
        <section className="mx-auto max-w-[930px] bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <header className="px-5 sm:px-6 pt-5 pb-3 border-b-4 border-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Thông báo</h1>
                <p className="mt-1 text-xs font-black uppercase tracking-widest text-black">
                  {total} hoạt động trong hộp thông báo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAll}
                  disabled={isMutating || unreadCount === 0}
                  className="h-10 w-10 border-2 border-black bg-white hover:bg-amber-300 disabled:bg-gray-200 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors"
                  title="Đánh dấu tất cả là đã đọc"
                >
                  <CheckCheck className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOld}
                  disabled={isMutating}
                  className="h-10 w-10 border-2 border-black bg-white hover:bg-red-100 disabled:bg-gray-200 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors"
                  title="Xóa thông báo cũ"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <span className="h-10 w-10 border-2 border-black bg-gray-100 inline-flex items-center justify-center">
                  <MoreHorizontal className="w-5 h-5" />
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(['all', 'unread'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`px-4 py-2 text-sm font-black rounded-none border-2 border-black transition-colors ${
                    status === value ? 'bg-black text-white' : 'bg-white text-black hover:bg-amber-300'
                  }`}
                >
                  {value === 'all' ? 'Tất cả' : 'Chưa đọc'}
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {categoryFilters.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveCategory(tab.value)}
                  className={`shrink-0 h-10 border-2 border-black px-3 font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 transition-all ${
                    activeCategory === tab.value ? 'bg-amber-300 text-black' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </header>

          <div className="px-3 sm:px-5 py-4 min-h-[520px]">
            <h2 className="px-2 pb-2 text-xl font-black">Trước đó</h2>

            {loading ? (
              <div className="h-[420px] flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : items.length === 0 ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 border-4 border-black bg-amber-300 flex items-center justify-center mb-4">
                  <Bell className="w-10 h-10 text-black" />
                </div>
                <p className="text-xl font-black">Không có thông báo</p>
                <p className="mt-2 max-w-md text-sm font-bold text-black">
                  Khi bạn làm quiz, mua khóa học, hoặc có phản hồi mới, thông báo sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {items.map((item) => {
                  const meta = getCategoryMeta(item.category);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openNotification(item)}
                      className={`group w-full px-2 py-3 text-left transition-colors ${
                        item.isRead ? 'bg-white hover:bg-gray-100' : 'bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      <div className="grid grid-cols-[64px_1fr_18px] gap-3 items-center">
                        <div className="relative h-14 w-14 border-2 border-black bg-white flex items-center justify-center font-black text-2xl overflow-visible">
                          {getAvatarText(item)}
                          <span className={`absolute -right-1 -bottom-1 h-7 w-7 border-2 border-black ${meta.bg} text-black flex items-center justify-center text-xs font-black`}>
                            {meta.icon}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[15px] sm:text-base leading-snug text-black">
                            <span className="font-black">{item.title}</span>{' '}
                            <span className="font-semibold">{item.message}</span>
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-black">
                            <span className="text-black">{formatRelativeTime(item.createdAt)}</span>
                            <span className="text-black">·</span>
                            <span className="text-black">{meta.label}</span>
                          </div>
                        </div>

                        {!item.isRead && <span className="h-3.5 w-3.5 bg-amber-300 border-2 border-black" aria-label="Chưa đọc" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <footer className="border-t-4 border-black px-5 py-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className="h-10 border-2 border-black bg-white px-4 font-black text-xs uppercase disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-xs font-black uppercase tracking-widest">Trang {page}/{totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              className="h-10 border-2 border-black bg-white px-4 font-black text-xs uppercase disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </footer>
        </section>
      </div>
    </MainLayout>
  );
}
