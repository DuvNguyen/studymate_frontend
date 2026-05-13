'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useSession } from '@clerk/nextjs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import MainLayout from '@/components/MainLayout';
import LoadingScreen from '@/components/LoadingScreen';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, DollarSign, ShoppingBag, Download, Calendar, RefreshCw, AlertTriangle, Zap, X
} from 'lucide-react';
import MetricCard from '@/components/analytics/MetricCard';
import { Button } from '@/components/Button';

const COLORS = ['#FFD600', '#000000', '#10B981', '#3B82F6', '#F43F5E'];

interface DashboardStats {
  totalRevenue: number;
  growth: number;
  orderCount: number;
  thisMonthRevenue: number;
}

interface RevenuePoint {
  ds: string;
  y: number;
}

interface CategoryShare {
  id?: string;
  name: string;
  value: number;
}

interface AnalyticsData {
  anomalies: Array<{
    ds: string;
    y: number;
    y_rolling_mean: number;
  }>;
  forecast: {
    summary: {
      next_period_total: number;
      trend: 'up' | 'down';
    };
  };
  ranking: Array<{
    category_id?: string;
    name: string;
    priority: string;
    growth_score: number;
  }>;
}

const AdminAnalyticsDashboard = () => {
  const { session } = useSession();
  const { user, loading: userLoading } = useCurrentUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<RevenuePoint[]>([]);
  const [categories, setCategories] = useState<CategoryShare[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  // Date range state - Default to current year
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(new Date().getFullYear(), 0, 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const token = await session.getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }
      };

      const [statsRes, chartRes, catRes, analyticsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistics/dashboard`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistics/revenue-chart`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistics/categories`, config),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/statistics/analytics`, config)
      ]);

      setStats(statsRes.data.data);
      setChartData(chartRes.data.data);
      setCategories(catRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (e) {
      console.error('Failed to fetch analytics data', e);
    } finally {
      setLoading(false);
    }
  }, [session, startDate, endDate]);

  const handleExport = async () => {
    if (!session) return;
    setExporting(true);
    try {
      const token = await session.getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/statistics/export/excel?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  if (loading || userLoading) {
    return (
      <MainLayout role={user?.role || 'STUDENT'} allowedRoles={['ADMIN', 'STAFF']} loading={userLoading}>
        <LoadingScreen 
          fullScreen={false} 
          title="ĐANG TỔNG HỢP DỮ LIỆU DOANH THU..." 
          description="HỆ THỐNG ĐANG PHÂN TÍCH VÀ DỰ BÁO CHI TIẾT TÌNH HÌNH KINH DOANH TRONG GIAI ĐOẠN ĐÃ CHỌN."
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout role={user?.role || 'STUDENT'} allowedRoles={['ADMIN', 'STAFF']} loading={userLoading}>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-1">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-black flex items-center gap-3">
              <Zap className="w-10 h-10 fill-yellow-400" />
              Thống Kê Doanh Thu
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">
              TRÌNH QUẢN LÝ TÀI CHÍNH VÀ DỰ BÁO TĂNG TRƯỞNG
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Từ ngày</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block bg-white border-2 border-black px-3 py-2 text-xs font-bold uppercase focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50">Đến ngày</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block bg-white border-2 border-black px-3 py-2 text-xs font-bold uppercase focus:ring-0 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData} 
                className="bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleExport}
                disabled={exporting}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
              >
                <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
                {exporting ? 'Đang xử lý...' : 'Xuất báo cáo'}
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Row - 4 columns on large screens now that values are abbreviated */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="TỔNG HOA HỒNG SÀN" 
            value={stats?.totalRevenue || 0} 
            suffix=" VNĐ"
            trend={stats?.growth}
            icon={<DollarSign size={24} />}
          />
          <MetricCard 
            title="KHÓA HỌC BÁN THÀNH CÔNG" 
            value={stats?.orderCount || 0} 
            icon={<ShoppingBag size={24} />}
          />
          <MetricCard 
            title="HOA HỒNG THÁNG NÀY" 
            value={stats?.thisMonthRevenue || 0} 
            suffix=" VNĐ"
            icon={<Calendar size={24} />}
          />
          <MetricCard 
            title="CẢNH BÁO BẤT THƯỜNG" 
            value={analytics?.anomalies?.length || 0} 
            suffix=" CẢNH BÁO"
            icon={<AlertTriangle className={analytics && analytics.anomalies.length > 0 ? 'text-rose-600' : ''} size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase text-black flex items-center tracking-tighter">
                <TrendingUp className="mr-2 text-yellow-400" /> BIỂU ĐỒ HOA HỒNG (COMMISSION)
              </h3>
            </div>
            <div className="h-[400px] w-full min-h-[400px]">
                <ResponsiveContainer width="99.9%" height={400} minWidth={0}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD600" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FFD600" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis 
                      dataKey="ds" 
                      stroke="#000" 
                      fontWeight="black" 
                      fontSize={14} 
                      tickLine={false} 
                      axisLine={{strokeWidth: 4}} 
                    />
                    <YAxis 
                      stroke="#000" 
                      fontWeight="black" 
                      fontSize={14} 
                      tickLine={false} 
                      axisLine={{strokeWidth: 4}} 
                      width={120}
                      tickFormatter={(value) => `${value.toLocaleString()} VNĐ`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000', 
                        border: '4px solid #FFD600', 
                        color: '#fff', 
                        fontWeight: '900',
                        fontSize: '16px',
                        textTransform: 'uppercase'
                      }}
                      itemStyle={{ color: '#FFD600', fontWeight: '900', fontSize: '18px' }}
                    />
                    <Area type="monotone" dataKey="y" stroke="#000" strokeWidth={6} fillOpacity={1} fill="url(#colorY)" />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Category Share */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <h3 className="text-xl font-black uppercase mb-6 text-black tracking-tighter">TỶ TRỌNG DANH MỤC</h3>
            <div className="h-[250px] w-full min-h-[250px] flex-shrink-0">
              <ResponsiveContainer width="99.9%" height={250} minWidth={0}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#000"
                    strokeWidth={4}
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '4px solid #000', 
                      fontWeight: '900',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 overflow-y-auto flex-1 max-h-[200px] pr-2">
              {categories.map((cat, idx) => (
                <div key={cat.id || idx} className="flex justify-between items-center text-xs font-black text-black p-2 border-2 border-black uppercase" style={{ borderLeftColor: COLORS[idx % COLORS.length], borderLeftWidth: '8px' }}>
                  <span className="truncate mr-2">{cat.name}</span>
                  <span className="flex-shrink-0">{cat.value.toLocaleString()} VNĐ</span>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-[10px] font-black text-black/30 uppercase mt-4 italic">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Forecasting & Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Forecast */}
          <div className="bg-black text-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,214,0,1)] flex flex-col h-[600px]">
             <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-400" size={32} />
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">DỰ BÁO AI (FORECAST)</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dựa trên mô hình Facebook Prophet</p>
                </div>
             </div>
             
             <div className="bg-white/10 p-6 border-2 border-white/20 mb-6">
                <div className="flex justify-between items-center">
                   <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">DỰ KIẾN 30 NGÀY TỚI</span>
                      <span className="text-4xl font-black text-yellow-400">
                        {analytics?.forecast?.summary?.next_period_total?.toLocaleString() || 0} VNĐ
                      </span>
                   </div>
                   <div className={`px-4 py-2 border-2 border-white font-black uppercase text-xs ${
                     analytics?.forecast?.summary?.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'
                   }`}>
                      XU HƯỚNG: {analytics?.forecast?.summary?.trend === 'up' ? 'TĂNG' : 'GIẢM'}
                   </div>
                </div>
             </div>

             <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                <h4 className="font-black uppercase text-[10px] text-yellow-400 border-b border-white/20 pb-2 tracking-widest sticky top-0 bg-black z-10">Xếp hạng danh mục tiềm năng</h4>
                {analytics?.ranking?.map((item, idx) => (
                  <div key={item.category_id || idx} className="flex justify-between items-center bg-white/5 p-3 border-l-4 border-yellow-400">
                     <span className="font-bold text-sm uppercase">{item.name}</span>
                     <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 uppercase">{item.priority}</span>
                        <span className="font-black text-yellow-400">{item.growth_score > 0 ? '+' : ''}{item.growth_score?.toFixed(2) || 0}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Anomalies Table */}
          <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[600px]">
            <h3 className="text-xl font-black uppercase mb-6 flex items-center text-rose-600 tracking-tighter">
              <AlertTriangle className="mr-2" /> PHÁT HIỆN BẤT THƯỜNG
            </h3>
            <div className="overflow-x-auto flex-1 pr-2">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-black text-white text-xs font-black uppercase tracking-widest border-b-4 border-black">
                    <th className="p-3 text-left">Ngày</th>
                    <th className="p-3 text-left">Doanh thu thực</th>
                    <th className="p-3 text-left">Kỳ vọng (Mean)</th>
                    <th className="p-3 text-left">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="font-bold text-black divide-y-4 divide-black">
                  {analytics && analytics.anomalies.length > 0 ? analytics.anomalies.map((anno, idx) => (
                    <tr key={idx} className="hover:bg-rose-50 transition-colors">
                      <td className="p-3 text-sm">{anno.ds}</td>
                      <td className="p-3 text-sm">{anno.y?.toLocaleString() || 0} VNĐ</td>
                      <td className="p-3 text-sm">{anno.y_rolling_mean?.toFixed(2) || 0} VNĐ</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-[10px] font-black border-2 border-black uppercase ${
                          anno.y > anno.y_rolling_mean ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}>
                          {anno.y > anno.y_rolling_mean ? 'TĂNG ĐỘT BIẾN' : 'GIẢM ĐỘT BIẾN'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 italic font-black uppercase tracking-widest text-sm">
                        Hệ thống ổn định - Chưa phát hiện bất thường
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button & Manual */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {analytics && showBanner && (
          <div className={`bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm transition-all duration-300 transform ${analytics ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`} 
               style={{ display: stats ? 'block' : 'none' }}>
            <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
              <h4 className="text-lg font-black uppercase italic">Hướng dẫn Analytics</h4>
              <button onClick={() => setShowBanner(false)} className="hover:scale-110"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-black uppercase text-yellow-500 mb-1">Dự báo AI (Prophet)</h5>
                <p className="text-[11px] font-bold leading-relaxed text-black/70">
                  Sử dụng mô hình <span className="text-black font-black">Facebook Prophet</span>. Phân tích dữ liệu lịch sử để tìm chu kỳ (tuần, tháng, năm) và xu hướng tăng trưởng. Dự báo giúp admin chuẩn bị nguồn lực và kế hoạch marketing cho giai đoạn tới.
                </p>
              </div>

              <div>
                <h5 className="text-xs font-black uppercase text-rose-500 mb-1">Cảnh báo bất thường</h5>
                <p className="text-[11px] font-bold leading-relaxed text-black/70">
                  Dùng kỹ thuật <span className="text-black font-black">Z-Score và Rolling Mean</span>. Nếu doanh thu một ngày lệch quá 2 lần độ lệch chuẩn so với trung bình 7 ngày gần nhất, hệ thống sẽ gắn cờ Cảnh báo (Tăng/Giảm đột biến).
                </p>
              </div>

              <div className="bg-black text-white p-3 text-[10px] font-bold uppercase italic">
                Tips: Chạm vào biểu đồ để xem chi tiết từng mốc thời gian.
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={() => setShowInfo(true)}
          className="w-16 h-16 rounded-full bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          title="Xem hướng dẫn chi tiết"
        >
          <span className="text-4xl font-black italic">!</span>
        </button>
      </div>

      <AnalyticsInfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
    </MainLayout>
  );
};

// UI Component for Info Modal (matching instructor style)
const AnalyticsInfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-4 border-black w-full max-w-md shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b-4 border-black bg-yellow-400 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-black flex items-center gap-2">
            <Zap size={20} className="fill-black" /> Thông tin Analytics
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-all">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h4 className="font-black text-sm uppercase tracking-widest text-black/40 mb-3">1. Dự báo AI (AI Forecast)</h4>
            <p className="text-base font-bold text-black border-l-4 border-yellow-400 pl-4 py-1">
              Hệ thống sử dụng mô hình <span className="underline decoration-2">Facebook Prophet</span> - một công nghệ phân tích chuỗi thời gian mạnh mẽ.
            </p>
            <div className="mt-4 text-sm font-bold text-black/60 italic space-y-2">
              <p>• Tự động nhận diện chu kỳ mua hàng (Seasonality).</p>
              <p>• Phân tích xu hướng dài hạn (Trend estimation).</p>
              <p>• Ước tính doanh thu 30 ngày tới với độ tin cậy cao.</p>
            </div>
          </section>

          <section>
            <h4 className="font-black text-sm uppercase tracking-widest text-black/40 mb-3">2. Cảnh báo bất thường (Anomalies)</h4>
            <p className="text-base font-bold text-black border-l-4 border-rose-500 pl-4 py-1">
              Phát hiện các điểm doanh thu &quot;lạ&quot; so với quỹ đạo thông thường.
            </p>
            <div className="mt-4 text-sm font-bold text-black/60 italic space-y-2">
              <p>• <span className="text-rose-600">Giảm đột biến</span>: Có thể do lỗi thanh toán hoặc hệ thống.</p>
              <p>• <span className="text-emerald-600">Tăng đột biến</span>: Thường do các chiến dịch Marketing thành công.</p>
              <p>• Kỹ thuật: So sánh giá trị thực tế với Rolling Mean (trung bình trượt).</p>
            </div>
          </section>

          <div className="bg-black text-white p-5 border-2 border-black">
            <p className="text-xs font-black uppercase tracking-[0.2em] mb-2">Nhiệm vụ quản trị viên</p>
            <p className="text-sm font-bold italic opacity-80 leading-relaxed">
              Dựa vào các chỉ số này để điều chỉnh nguồn lực giảng viên, ngân sách quảng cáo và kịp thời xử lý các sự cố tài chính nếu có cảnh báo bất thường xuất hiện.
            </p>
          </div>

          <Button onClick={onClose} className="w-full bg-black text-white border-4 border-black h-12 text-lg hover:bg-yellow-400 hover:text-black">
            ĐÃ HIỂU
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
