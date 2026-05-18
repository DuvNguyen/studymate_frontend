'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [forecastPriorityFilter, setForecastPriorityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [forecastPage, setForecastPage] = useState(1);
  const [anomalyTrendFilter, setAnomalyTrendFilter] = useState<'ALL' | 'UP' | 'DOWN'>('ALL');
  const [anomalyPage, setAnomalyPage] = useState(1);
  const FORECAST_PAGE_SIZE = 6;
  const ANOMALY_PAGE_SIZE = 5;

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

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const filteredRanking = useMemo(() => {
    const ranking = analytics?.ranking || [];
    if (forecastPriorityFilter === 'ALL') return ranking;
    return ranking.filter((item) => (item.priority || '').toUpperCase() === forecastPriorityFilter);
  }, [analytics?.ranking, forecastPriorityFilter]);

  const forecastTotalPages = Math.max(1, Math.ceil(filteredRanking.length / FORECAST_PAGE_SIZE));
  const pagedRanking = useMemo(() => {
    const start = (forecastPage - 1) * FORECAST_PAGE_SIZE;
    return filteredRanking.slice(start, start + FORECAST_PAGE_SIZE);
  }, [filteredRanking, forecastPage, FORECAST_PAGE_SIZE]);

  const filteredAnomalies = useMemo(() => {
    const anomalies = analytics?.anomalies || [];
    if (anomalyTrendFilter === 'ALL') return anomalies;
    return anomalies.filter((anno) =>
      anomalyTrendFilter === 'UP' ? anno.y > anno.y_rolling_mean : anno.y <= anno.y_rolling_mean,
    );
  }, [analytics?.anomalies, anomalyTrendFilter]);

  const anomalyTotalPages = Math.max(1, Math.ceil(filteredAnomalies.length / ANOMALY_PAGE_SIZE));
  const pagedAnomalies = useMemo(() => {
    const start = (anomalyPage - 1) * ANOMALY_PAGE_SIZE;
    return filteredAnomalies.slice(start, start + ANOMALY_PAGE_SIZE);
  }, [filteredAnomalies, anomalyPage, ANOMALY_PAGE_SIZE]);

  useEffect(() => {
    setForecastPage(1);
  }, [forecastPriorityFilter]);

  useEffect(() => {
    setAnomalyPage(1);
  }, [anomalyTrendFilter]);

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
      <div className="w-[calc(100%-12px)] sm:w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-w-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase italic tracking-tighter text-black flex items-center gap-3">
              <Zap className="w-10 h-10 fill-yellow-400" />
              Thống Kê Doanh Thu
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">
              TRÌNH QUẢN LÝ TÀI CHÍNH VÀ DỰ BÁO TĂNG TRƯỞNG
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
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
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData} 
                className="bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleExport}
                disabled={exporting}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 w-full sm:w-auto justify-center"
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
          <div className="lg:col-span-2 bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase text-black flex items-center tracking-tighter">
                <TrendingUp className="mr-2 text-yellow-400" /> BIỂU ĐỒ HOA HỒNG (COMMISSION)
              </h3>
            </div>
            <div className="h-[280px] sm:h-[400px] w-full min-h-[280px] sm:min-h-[400px]">
                <ResponsiveContainer width="99.9%" height={isMobile ? 280 : 400} minWidth={0}>
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
                      fontSize={isMobile ? 10 : 14}
                      tickLine={false} 
                      axisLine={{strokeWidth: 4}} 
                      minTickGap={isMobile ? 28 : 12}
                    />
                    <YAxis 
                      stroke="#000" 
                      fontWeight="black" 
                      fontSize={isMobile ? 10 : 14}
                      tickLine={false} 
                      axisLine={{strokeWidth: 4}} 
                      width={isMobile ? 72 : 120}
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
          <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <h3 className="text-xl font-black uppercase mb-6 text-black tracking-tighter">TỶ TRỌNG DANH MỤC</h3>
            <div className="h-[220px] sm:h-[250px] w-full min-h-[220px] sm:min-h-[250px] flex-shrink-0">
              <ResponsiveContainer width="99.9%" height={isMobile ? 220 : 250} minWidth={0}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 44 : 60}
                    outerRadius={isMobile ? 72 : 100}
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
          <div className="bg-black text-white p-4 sm:p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,214,0,1)] flex flex-col h-auto sm:h-[600px]">
             <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-400" size={32} />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tighter">DỰ BÁO AI (FORECAST)</h3>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wide sm:tracking-widest">Dựa trên mô hình Facebook Prophet</p>
                </div>
             </div>
             
             <div className="bg-white/10 p-4 sm:p-6 border-2 border-white/20 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                   <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">DỰ KIẾN 30 NGÀY TỚI</span>
                      <span className="text-xl sm:text-4xl font-black text-yellow-400 leading-none">
                        {analytics?.forecast?.summary?.next_period_total?.toLocaleString() || 0} VNĐ
                      </span>
                   </div>
                   <div className={`px-3 py-1.5 border-2 border-white font-black uppercase text-[10px] sm:text-xs ${
                     analytics?.forecast?.summary?.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'
                   }`}>
                      XU HƯỚNG: {analytics?.forecast?.summary?.trend === 'up' ? 'TĂNG' : 'GIẢM'}
                   </div>
                </div>
             </div>

             <div className="space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-2 mt-4 sm:mt-0">
                <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-2">
                  <h4 className="font-black uppercase text-[10px] text-yellow-400 tracking-widest">Xếp hạng danh mục tiềm năng</h4>
                  <div className="flex gap-1">
                    {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setForecastPriorityFilter(p)}
                        className={`px-2 py-1 border text-[9px] font-black uppercase ${forecastPriorityFilter === p ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white/30'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {pagedRanking.map((item, idx) => (
                  <div key={item.category_id || idx} className="flex justify-between items-center bg-white/5 p-3 border-l-4 border-yellow-400">
                     <span className="font-bold text-xs sm:text-sm uppercase truncate pr-2">{item.name}</span>
                     <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 uppercase">{item.priority}</span>
                        <span className="font-black text-yellow-400">{item.growth_score > 0 ? '+' : ''}{item.growth_score?.toFixed(2) || 0}</span>
                     </div>
                  </div>
                ))}
                {pagedRanking.length === 0 && (
                  <p className="text-[10px] font-black uppercase text-gray-400">Không có danh mục phù hợp</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setForecastPage((p) => Math.max(1, p - 1))}
                    disabled={forecastPage <= 1}
                    className="px-2 py-1 border border-white/40 text-[10px] font-black uppercase disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="text-[10px] font-black uppercase text-gray-300">{forecastPage}/{forecastTotalPages}</span>
                  <button
                    onClick={() => setForecastPage((p) => Math.min(forecastTotalPages, p + 1))}
                    disabled={forecastPage >= forecastTotalPages}
                    className="px-2 py-1 border border-white/40 text-[10px] font-black uppercase disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
             </div>
          </div>

          {/* Anomalies Table */}
          <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-auto sm:h-[600px]">
            <h3 className="text-xl font-black uppercase mb-6 flex items-center text-rose-600 tracking-tighter">
              <AlertTriangle className="mr-2" /> PHÁT HIỆN BẤT THƯỜNG
            </h3>
            <div className="flex items-center gap-2 mb-3">
              {([
                { key: 'ALL', label: 'Tất cả' },
                { key: 'UP', label: 'Tăng' },
                { key: 'DOWN', label: 'Giảm' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setAnomalyTrendFilter(item.key)}
                  className={`px-2 py-1 border-2 border-black text-[10px] font-black uppercase ${anomalyTrendFilter === item.key ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="hidden sm:block overflow-x-auto flex-1 pr-2">
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
                  {pagedAnomalies.length > 0 ? pagedAnomalies.map((anno, idx) => (
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
            <div className="sm:hidden space-y-3">
              {pagedAnomalies.length > 0 ? pagedAnomalies.map((anno, idx) => (
                <div key={idx} className="border-2 border-black p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-black">{anno.ds}</p>
                    <span className={`px-2 py-1 text-[9px] font-black border-2 border-black uppercase ${
                      anno.y > anno.y_rolling_mean ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}>
                      {anno.y > anno.y_rolling_mean ? 'TĂNG' : 'GIẢM'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-black">Thực: {anno.y?.toLocaleString() || 0} VNĐ</p>
                  <p className="text-[11px] font-bold text-black">Kỳ vọng: {anno.y_rolling_mean?.toFixed(2) || 0} VNĐ</p>
                </div>
              )) : (
                <div className="p-5 border-2 border-black text-center text-[11px] font-black uppercase text-gray-500">
                  Hệ thống ổn định
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                onClick={() => setAnomalyPage((p) => Math.max(1, p - 1))}
                disabled={anomalyPage <= 1}
                className="px-2 py-1 border-2 border-black text-[10px] font-black uppercase disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-[10px] font-black uppercase text-black">{anomalyPage}/{anomalyTotalPages}</span>
              <button
                onClick={() => setAnomalyPage((p) => Math.min(anomalyTotalPages, p + 1))}
                disabled={anomalyPage >= anomalyTotalPages}
                className="px-2 py-1 border-2 border-black text-[10px] font-black uppercase disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button & Manual */}
      <div className="fixed bottom-4 sm:bottom-8 right-3 sm:right-8 z-[100] flex flex-col items-end gap-2 sm:gap-4">
        {analytics && showBanner && (
          <div className={`bg-white border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-[calc(100vw-24px)] sm:w-auto max-w-sm transition-all duration-300 transform ${analytics ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`} 
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
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-yellow-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
          title="Xem hướng dẫn chi tiết"
        >
          <span className="text-2xl sm:text-4xl font-black italic">!</span>
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
