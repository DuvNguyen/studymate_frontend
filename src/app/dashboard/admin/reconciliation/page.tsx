'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import MainLayout from '@/components/MainLayout';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Image from 'next/image';

export default function ReconciliationPage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const { reconcilePayouts } = useWallet();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    processed: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // MainLayout handles role guard

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.CSV'))) {
      setFile(droppedFile);
      setResults(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const result = await reconcilePayouts(file);
      setResults(result);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-none h-10 w-10 border-4 border-black border-t-transparent"></div>
      </div>
    );
  }

  return (
    <MainLayout role={currentUser?.role} allowedRoles={['ADMIN', 'STAFF']}>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-20 px-4 sm:px-6">
        {/* Corporate Banking Header — MB Bank Style */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left: Banner */}
            <div className="md:w-1/2 relative h-[180px] sm:h-[220px] md:h-auto">
              <Image
                src="/doi-soat-banner.jpg"
                alt="StudyMate BIZ Banking"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            {/* Right: Title */}
            <div className="md:w-1/2 p-5 sm:p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-blue-900 to-blue-950">
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src="/doi-soat-logo.png"
                  alt="StudyMate BIZ"
                  width={120}
                  height={30}
                  className="object-contain"
                />
                <span className="text-white/60 text-xs font-bold">|</span>
                <span className="text-white font-black text-xs uppercase tracking-widest">StudyMate</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
                Đối soát giao dịch
              </h1>
              <p className="text-sm font-bold text-white/80">
                Upload kết quả chuyển khoản từ ngân hàng để tự động cập nhật trạng thái chi trả cho giảng viên.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Hệ thống sẵn sàng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dropzone */}
        <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
          <h2 className="text-lg sm:text-xl font-black text-black uppercase tracking-tighter mb-6">
            Upload kết quả đối soát
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed p-6 sm:p-10 md:p-16 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-emerald-400 bg-emerald-50 scale-[1.02]'
                : file
                ? 'border-black bg-yellow-50'
                : 'border-black bg-white hover:bg-yellow-50'
            }`}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <input
              type="file"
              id="csv-upload"
              accept=".csv"
              className="hidden"
              onChange={handleFileInput}
            />

            {file ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-emerald-400 border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-3xl font-black">✓</span>
                </div>
                <p className="font-black text-black text-sm sm:text-lg uppercase break-all">{file.name}</p>
                <p className="text-xs font-bold text-black">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                  className="text-xs font-black text-black underline hover:text-red-600 uppercase"
                >
                  Chọn file khác
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-black border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
                  <span className="text-3xl text-white">↑</span>
                </div>
                <p className="font-black text-black text-sm sm:text-lg uppercase">
                  {isDragging ? 'THẢ FILE Ở ĐÂY' : 'KÉO THẢ FILE CSV VÀO ĐÂY'}
                </p>
                <p className="text-xs font-bold text-black">
                  hoặc click để chọn file • Định dạng: CSV
                </p>
              </div>
            )}
          </div>

          {/* Format guide */}
          <div className="mt-6 border-2 border-black p-4 bg-yellow-50">
            <p className="text-[10px] font-black uppercase text-black mb-2">Cấu trúc file CSV:</p>
            <code className="text-xs font-mono text-black block bg-white border border-black p-3">
              payout_id,status,note<br/>
              PO-123,SUCCESS,Chuyển khoản thành công<br/>
              PO-124,FAILED,Sai số tài khoản
            </code>
          </div>

          {/* Upload Button */}
          {file && !results && (
            <button
              onClick={handleUpload}
              disabled={processing}
              className="w-full mt-6 py-4 bg-black text-white font-black uppercase tracking-widest border-4 border-black shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] hover:bg-emerald-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {processing ? 'ĐANG XỬ LÝ ĐỐI SOÁT...' : 'BẮT ĐẦU ĐỐI SOÁT'}
            </button>
          )}
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-tighter">
              Kết quả đối soát
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-100 border-2 border-black p-6 text-center">
                <p className="text-[10px] font-black uppercase text-black mb-1">Thành công</p>
                <p className="text-4xl font-black text-emerald-600">{results.success}</p>
              </div>
              <div className="bg-red-100 border-2 border-black p-6 text-center">
                <p className="text-[10px] font-black uppercase text-black mb-1">Thất bại</p>
                <p className="text-4xl font-black text-red-600">{results.failed}</p>
              </div>
              <div className="bg-yellow-100 border-2 border-black p-6 text-center">
                <p className="text-[10px] font-black uppercase text-black mb-1">Tổng xử lý</p>
                <p className="text-4xl font-black text-black">{results.processed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 border-2 border-black p-4 space-y-1">
                <p className="text-[10px] font-black uppercase text-black mb-2">Lỗi:</p>
                {results.errors.map((err, i) => (
                  <p key={i} className="text-xs font-bold text-red-600">• {err}</p>
                ))}
              </div>
            )}

            <button
              onClick={() => { setFile(null); setResults(null); }}
              className="w-full py-3 bg-black text-white font-black uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400 hover:text-black active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              ĐỐI SOÁT TIẾP
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
