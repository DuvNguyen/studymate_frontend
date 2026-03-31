'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/MainLayout';

export default function KycPage() {
  const { getToken } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [kycData, setKycData] = useState({
    idCardUrl: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
    kycStatus: '',
    rejectionReason: '',
    certificates: [] as string[],
    documents: [] as { documentType: string; title: string; fileUrl: string }[],
  });

  const isLocked = kycData.kycStatus === 'PENDING' || kycData.kycStatus === 'APPROVED';

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch('http://localhost:3001/api/v1/users/me/kyc', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const { data } = await res.json();
        setKycData({
          idCardUrl: data.idCardUrl || '',
          bankAccountName: data.bankAccountName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankName: data.bankName || '',
          kycStatus: data.kycStatus || 'PENDING',
          rejectionReason: data.rejectionReason || '',
          certificates: data.certificates || [],
          documents: data.documents || [],
        });
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu KYC');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKycData({ ...kycData, [e.target.name]: e.target.value });
  };

  const handleDocumentChange = (index: number, field: string, value: string) => {
    const updatedDocs = [...kycData.documents];
    updatedDocs[index] = { ...updatedDocs[index], [field]: value };
    setKycData({ ...kycData, documents: updatedDocs });
  };

  const handleCertificateChange = (index: number, value: string) => {
    const updatedCertificates = [...kycData.certificates];
    updatedCertificates[index] = value;
    setKycData({ ...kycData, certificates: updatedCertificates });
  };

  const addCertificate = () => {
    setKycData({
      ...kycData,
      certificates: [...kycData.certificates, '']
    });
  };

  const removeCertificate = (index: number) => {
    setKycData({
      ...kycData,
      certificates: kycData.certificates.filter((_, i) => i !== index)
    });
  };

  const addDocument = () => {
    setKycData({
      ...kycData,
      documents: [...kycData.documents, { documentType: 'CERTIFICATE', title: '', fileUrl: '' }]
    });
  };

  const removeDocument = (index: number) => {
    setKycData({
      ...kycData,
      documents: kycData.documents.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/v1/users/me/kyc', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(kycData),
      });

      if (res.ok) {
        toast.success('Nộp hồ sơ thành công! Đang chờ duyệt.');
        fetchKycData();
      } else {
        const errorData = await res.json().catch(() => null);
        console.error('[KYC Submit Error]:', errorData);
        
        let errorMsg = 'Nộp hồ sơ thất bại.';
        if (errorData && errorData.message) {
           errorMsg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
        }
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error('[KYC Submit Exception]:', error);
      toast.error(error.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <MainLayout role="INSTRUCTOR">
      <div className="min-h-screen bg-slate-50/50 py-12 selection:bg-purple-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Section: Đậm và rõ nét */}
          <div className="relative mb-12 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">
              Hồ sơ Cấp phép Giảng dạy <span className="text-purple-600">(KYC)</span>
            </h1>
            <p className="text-lg font-bold text-slate-600 max-w-3xl">
              Vui lòng cung cấp chính xác thông tin định danh và tài khoản ngân hàng để StudyMate xét duyệt quyền kinh doanh khóa học[cite: 90].
            </p>
          </div>

          {/* Status Banners: Độ tương phản cực cao */}
          <div className="space-y-4 mb-10">
            {kycData.kycStatus === 'PENDING' && (
              <div className="flex items-center gap-5 p-6 bg-amber-50 border-2 border-amber-500 rounded-2xl text-amber-900 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-2xl shadow-inner">⏳</div>
                <div>
                  <p className="text-lg font-black uppercase">Hồ sơ đang chờ phê duyệt</p>
                  <p className="font-bold opacity-90">Mọi chỉnh sửa đã bị khóa. Quản trị viên đang xem xét hồ sơ của bạn.</p>
                </div>
              </div>
            )}

            {kycData.kycStatus === 'APPROVED' && (
              <div className="flex items-center gap-5 p-6 bg-green-50 border-2 border-green-500 rounded-2xl text-green-900 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <p className="text-lg font-black uppercase">Xác minh thành công</p>
                  <p className="font-bold opacity-90">Chào mừng Giảng viên! Bạn đã có quyền tạo chương trình học và nhận thanh toán[cite: 24].</p>
                </div>
              </div>
            )}

            {kycData.kycStatus === 'REJECTED' && (
              <div className="flex items-center gap-5 p-6 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center text-2xl">❌</div>
                <div>
                  <p className="text-lg font-black uppercase">Hồ sơ bị từ chối</p>
                  <p className="font-bold text-red-700 underline decoration-2">Lý do: {kycData.rejectionReason}[cite: 90].</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10">
            
            {/* 1. Định danh cá nhân */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-slate-200 shadow-sm transition-all hover:border-purple-300">
              <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl">1</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">Định danh cá nhân</h2>
              </div>
              
              <div className="space-y-3">
                <label className="block text-base font-black text-slate-900 uppercase tracking-wide">
                  Đường dẫn ảnh CMND / CCCD (Cloudinary) [cite: 90]
                </label>
                <input 
                  required disabled={isLocked} type="url" name="idCardUrl"
                  placeholder="HÃY DÁN LINK ẢNH TẠI ĐÂY..."
                  value={kycData.idCardUrl} onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all text-slate-900 font-bold placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 2. Thông tin thanh toán */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-8 border-b-2 border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">2</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">Thông tin nhận thanh toán</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-900 uppercase">Tên Chủ Tài Khoản [cite: 90]</label>
                  <input 
                    required disabled={isLocked} type="text" name="bankAccountName"
                    placeholder="VÍ DỤ: NGUYỄN VĂN A"
                    value={kycData.bankAccountName} onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl outline-none focus:border-indigo-600 font-black uppercase text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-black text-slate-900 uppercase">Số Tài Khoản [cite: 154]</label>
                  <input 
                    required disabled={isLocked} type="text" name="bankAccountNumber"
                    placeholder="NHẬP SỐ TÀI KHOẢN..."
                    value={kycData.bankAccountNumber} onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl outline-none focus:border-indigo-600 font-mono font-black text-xl text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-sm font-black text-slate-900 uppercase">Ngân hàng & Chi nhánh [cite: 90]</label>
                  <input 
                    required disabled={isLocked} type="text" name="bankName"
                    placeholder="VÍ DỤ: VIETCOMBANK - CHI NHÁNH SÀI GÒN"
                    value={kycData.bankName} onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-300 rounded-2xl outline-none focus:border-indigo-600 font-bold text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* 3. Văn bằng & Chứng chỉ */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">3</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">Văn bằng & Chứng chỉ</h2>
                </div>
                {!isLocked && (
                  <button 
                    type="button" onClick={addDocument}
                    className="px-6 py-2.5 bg-purple-600 text-white font-black text-sm rounded-full hover:bg-black transition-all shadow-lg shadow-purple-200 active:scale-95"
                  >
                    + THÊM TÀI LIỆU
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {kycData.documents.length === 0 && (
                  <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 font-bold text-slate-400 uppercase tracking-widest">
                    Chưa có bằng cấp nào được đính kèm[cite: 109].
                  </div>
                )}
                
                {kycData.documents.map((doc, index) => (
                  <div key={index} className="flex flex-col lg:flex-row gap-5 p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl items-center relative group">
                    <select 
                      disabled={isLocked} value={doc.documentType}
                      onChange={(e) => handleDocumentChange(index, 'documentType', e.target.value)}
                      className="w-full lg:w-48 px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl outline-none focus:border-purple-600 font-black text-slate-900 cursor-pointer"
                    >
                      <option value="DEGREE">BẰNG CẤP</option>
                      <option value="CERTIFICATE">CHỨNG CHỈ</option>
                      <option value="AWARD">GIẢI THƯỞNG</option>
                    </select>
                    
                    <input 
                      required disabled={isLocked} type="text" placeholder="Tên bằng cấp..."
                      value={doc.title} onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                      className="flex-1 px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl outline-none focus:border-purple-600 font-bold text-slate-900 placeholder:text-slate-400"
                    />

                    <input 
                      required disabled={isLocked} type="url" placeholder="Link ảnh (Cloudinary)..."
                      value={doc.fileUrl} onChange={(e) => handleDocumentChange(index, 'fileUrl', e.target.value)}
                      className="flex-1 px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl outline-none focus:border-purple-600 font-bold text-slate-900 placeholder:text-slate-400"
                    />

                    {!isLocked && (
                      <button 
                        type="button" onClick={() => removeDocument(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-transparent hover:border-red-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Danh hiệu & Chứng chỉ (Hiển thị công khai) */}
            <div className="bg-white rounded-3xl p-8 md:p-10 border-2 border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">4</div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">Danh hiệu nổi bật (Công khai)</h2>
                </div>
                {!isLocked && (
                  <button 
                    type="button" onClick={addCertificate}
                    className="px-6 py-2.5 bg-blue-600 text-white font-black text-sm rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    + THÊM DANH HIỆU
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-500 mb-4">Các danh hiệu, chứng chỉ này sẽ được hiển thị trên hồ sơ công khai của bạn để học viên có thể xem.</p>
                
                {kycData.certificates.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 font-bold text-slate-400 uppercase tracking-widest">
                    Chưa có danh hiệu nào.
                  </div>
                )}

                {kycData.certificates.map((cert, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input 
                      required disabled={isLocked} type="text" placeholder="Ví dụ: IELTS 8.0, 5 năm kinh nghiệm ReactJS..."
                      value={cert} onChange={(e) => handleCertificateChange(index, e.target.value)}
                      className="flex-1 px-4 py-3.5 bg-white border-2 border-slate-300 rounded-xl outline-none focus:border-blue-600 font-bold text-slate-900 placeholder:text-slate-400"
                    />
                    {!isLocked && (
                      <button 
                        type="button" onClick={() => removeCertificate(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all border-2 border-transparent hover:border-red-200"
                      >
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Nút Submit chính */}
            {!isLocked && (
              <div className="pt-6 flex justify-center">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full md:w-auto px-20 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xl uppercase tracking-tighter rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ HỒ SƠ...' : 'NỘP HỒ SƠ KIỂM DUYỆT NGAY'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </MainLayout>
  );
}