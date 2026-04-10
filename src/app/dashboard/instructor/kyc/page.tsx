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

  const [selectedFiles, setSelectedFiles] = useState<{ idCard?: File; documents: { [key: number]: File } }>({ documents: {} });
  const [previewUrls, setPreviewUrls] = useState<{ idCard?: string; documents: { [key: number]: string } }>({ documents: {} });

  const isLocked = kycData.kycStatus === 'PENDING' || kycData.kycStatus === 'APPROVED';

  useEffect(() => { fetchKycData(); }, []);

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
          kycStatus: data.kycStatus || 'UNSUBMITTED',
          rejectionReason: data.rejectionReason || '',
          certificates: data.certificates || [],
          documents: data.documents || [],
        });
      }
    } catch { toast.error('Không thể tải dữ liệu KYC'); }
    finally { setIsLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKycData({ ...kycData, [e.target.name]: e.target.value });
  };
  const handleDocumentChange = (index: number, field: string, value: string) => {
    const d = [...kycData.documents];
    d[index] = { ...d[index], [field]: value };
    setKycData({ ...kycData, documents: d });
  };
  const handleCertificateChange = (index: number, value: string) => {
    const c = [...kycData.certificates];
    c[index] = value;
    setKycData({ ...kycData, certificates: c });
  };
  const addCertificate = () => setKycData({ ...kycData, certificates: [...kycData.certificates, ''] });
  const removeCertificate = (i: number) => setKycData({ ...kycData, certificates: kycData.certificates.filter((_, idx) => idx !== i) });
  const addDocument = () => setKycData({ ...kycData, documents: [...kycData.documents, { documentType: 'CERTIFICATE', title: '', fileUrl: '' }] });
  const removeDocument = (i: number) => {
    setKycData({ ...kycData, documents: kycData.documents.filter((_, idx) => idx !== i) });
    removeDocumentFile(i);
  };

  const handleIdCardSelect = (file: File) => {
    setSelectedFiles(prev => ({ ...prev, idCard: file }));
    setPreviewUrls(prev => {
      if (prev.idCard) URL.revokeObjectURL(prev.idCard);
      return { ...prev, idCard: URL.createObjectURL(file) };
    });
  };

  const removeIdCardFile = () => {
    setSelectedFiles(prev => { const next = { ...prev }; delete next.idCard; return next; });
    setPreviewUrls(prev => {
      if (prev.idCard) URL.revokeObjectURL(prev.idCard);
      const next = { ...prev }; delete next.idCard; return next;
    });
  };

  const handleDocumentFileSelect = (index: number, file: File) => {
    setSelectedFiles(prev => ({ ...prev, documents: { ...prev.documents, [index]: file } }));
    setPreviewUrls(prev => {
      if (prev.documents[index]) URL.revokeObjectURL(prev.documents[index]);
      return { ...prev, documents: { ...prev.documents, [index]: URL.createObjectURL(file) } };
    });
  };

  const removeDocumentFile = (index: number) => {
    setSelectedFiles(prev => { const nextDocs = { ...prev.documents }; delete nextDocs[index]; return { ...prev, documents: nextDocs }; });
    setPreviewUrls(prev => {
      if (prev.documents[index]) URL.revokeObjectURL(prev.documents[index]);
      const nextDocs = { ...prev.documents }; delete nextDocs[index]; return { ...prev, documents: nextDocs };
    });
  };

  const uploadFileToServer = async (file: File) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('http://localhost:3001/api/v1/uploads/image', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Có lỗi xảy ra khi tải ảnh lên.');
    const { data } = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalIdCardUrl = kycData.idCardUrl;
      const finalDocuments = [...kycData.documents];

      if (selectedFiles.idCard) {
        finalIdCardUrl = await uploadFileToServer(selectedFiles.idCard);
      }

      for (const [indexStr, file] of Object.entries(selectedFiles.documents)) {
        const idx = Number(indexStr);
        const url = await uploadFileToServer(file);
        finalDocuments[idx].fileUrl = url;
      }

      const { kycStatus, rejectionReason, ...basePayload } = kycData;
      const payload = {
        ...basePayload,
        idCardUrl: finalIdCardUrl,
        documents: finalDocuments,
      };

      const token = await getToken();
      const res = await fetch('http://localhost:3001/api/v1/users/me/kyc', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Nộp hồ sơ thành công! Đang chờ duyệt.');
        fetchKycData();
      } else {
        const err = await res.json().catch(() => null);
        const msg = err?.message ? (Array.isArray(err.message) ? err.message.join(', ') : err.message) : 'Nộp hồ sơ thất bại.';
        toast.error(msg);
      }
    } catch (e: any) {
      toast.error(e.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin rounded-none" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Đang tải...</p>
      </div>
    </div>
  );

  return (
    <MainLayout role="INSTRUCTOR" kycStatus={kycData.kycStatus || "UNSUBMITTED"}>
      <div className="max-w-4xl mx-auto space-y-6 py-4">

        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Giảng viên</p>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            Hồ sơ cấp phép giảng dạy
            <span className="inline-block ml-2 text-[10px] bg-black text-white px-2 py-0.5 align-middle">KYC</span>
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1 max-w-2xl">
            Cung cấp thông tin định danh và tài khoản ngân hàng để được xét duyệt quyền kinh doanh khóa học.
          </p>
        </div>

        {/* Status Banners */}
        <div className="space-y-3">
          {kycData.kycStatus === 'PENDING' && (
            <div className="flex items-center gap-4 p-4 bg-amber-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-amber-900">
              <span className="text-xl">⏳</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Hồ sơ đang chờ phê duyệt</p>
                <p className="text-xs font-medium mt-0.5 opacity-80">Mọi chỉnh sửa đã bị khóa. Quản trị viên đang xem xét hồ sơ.</p>
              </div>
            </div>
          )}
          {kycData.kycStatus === 'APPROVED' && (
            <div className="flex items-center gap-4 p-4 bg-emerald-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-emerald-900">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Xác minh thành công</p>
                <p className="text-xs font-medium mt-0.5 opacity-80">Bạn đã có quyền tạo chương trình học và nhận thanh toán.</p>
              </div>
            </div>
          )}
          {kycData.kycStatus === 'REJECTED' && (
            <div className="flex items-center gap-4 p-4 bg-red-50 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-red-900">
              <span className="text-xl">❌</span>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Hồ sơ bị từ chối</p>
                <p className="text-xs font-bold mt-0.5 underline">Lý do: {kycData.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. Định danh */}
          <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-black">
              <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-black text-sm">1</div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Định danh cá nhân</h2>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700">
                Ảnh CMND / CCCD
              </label>
              <div className="flex flex-col gap-3">
                {!isLocked && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file" accept="image/*" id="idCardFile" className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleIdCardSelect(e.target.files[0]);
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="idCardFile"
                      className="cursor-pointer px-4 py-2 bg-black text-white border-2 border-black font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 active:translate-y-[1px] transition-all disabled:opacity-50"
                    >
                      {previewUrls.idCard || kycData.idCardUrl ? 'CHỌN ẢNH KHÁC' : 'TẢI ẢNH LÊN'}
                    </label>
                  </div>
                )}
                {isLocked && !kycData.idCardUrl && (
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chưa tải ảnh</div>
                )}
                {previewUrls.idCard ? (
                  <div className="relative mt-2 inline-block self-start">
                    <img src={previewUrls.idCard} alt="Preview" className="w-48 h-auto border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                    <button type="button" onClick={removeIdCardFile} className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center border-2 border-black font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-0 transition-transform">X</button>
                  </div>
                ) : (
                  kycData.idCardUrl && (
                    <img src={kycData.idCardUrl} alt="ID Card Preview" className="w-48 h-auto border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* 2. Thông tin thanh toán */}
          <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b-2 border-black">
              <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center font-black text-sm">2</div>
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Thông tin nhận thanh toán</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700">Tên Chủ Tài Khoản</label>
                <input required disabled={isLocked} type="text" name="bankAccountName"
                  placeholder="VÍ DỤ: NGUYỄN VĂN A"
                  value={kycData.bankAccountName} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-black outline-none focus:bg-white font-black uppercase text-gray-900 placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700">Số Tài Khoản</label>
                <input required disabled={isLocked} type="text" name="bankAccountNumber"
                  placeholder="NHẬP SỐ TÀI KHOẢN..."
                  value={kycData.bankAccountNumber} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-black outline-none focus:bg-white font-mono font-black text-xl text-gray-900 placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700">Ngân hàng &amp; Chi nhánh</label>
                <input required disabled={isLocked} type="text" name="bankName"
                  placeholder="VÍ DỤ: VIETCOMBANK - CHI NHÁNH SÀI GÒN"
                  value={kycData.bankName} onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-black outline-none focus:bg-white font-bold text-gray-900 placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* 3. Văn bằng & Chứng chỉ */}
          <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-emerald-600 text-white flex items-center justify-center font-black text-sm">3</div>
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Văn bằng &amp; Chứng chỉ</h2>
              </div>
              {!isLocked && (
                <button type="button" onClick={addDocument}
                  className="px-3 py-1.5 bg-black text-white font-black text-[10px] uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                >
                  + Thêm tài liệu
                </button>
              )}
            </div>
            <div className="space-y-3">
              {kycData.documents.length === 0 && (
                <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-300 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Chưa có bằng cấp nào được đính kèm.
                </div>
              )}
              {kycData.documents.map((doc, index) => (
                <div key={index} className="flex flex-col lg:flex-row gap-3 p-4 bg-gray-50 border-2 border-black items-center">
                  <select disabled={isLocked} value={doc.documentType}
                    onChange={(e) => handleDocumentChange(index, 'documentType', e.target.value)}
                    className="w-full lg:w-36 px-3 py-2.5 bg-white border-2 border-black outline-none font-black text-xs text-gray-900 cursor-pointer"
                  >
                    <option value="DEGREE">BẰNG CẤP</option>
                    <option value="CERTIFICATE">CHỨNG CHỈ</option>
                    <option value="AWARD">GIẢI THƯỞNG</option>
                  </select>
                  <input required disabled={isLocked} type="text" placeholder="Tên bằng cấp..."
                    value={doc.title} onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border-2 border-black outline-none font-bold text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <div className="flex-1 flex flex-col justify-center items-start gap-2">
                    {!isLocked && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file" accept="image/*" id={`docFile-${index}`} className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleDocumentFileSelect(index, e.target.files[0]);
                            e.target.value = '';
                          }}
                        />
                        <label
                          htmlFor={`docFile-${index}`}
                          className="cursor-pointer px-3 py-1.5 bg-black text-white border-2 border-black font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 active:translate-y-[1px] transition-all"
                        >
                          {previewUrls.documents[index] || doc.fileUrl ? 'CHỌN FILE KHÁC' : 'TẢI FILE LÊN'}
                        </label>
                      </div>
                    )}
                    {previewUrls.documents[index] ? (
                      <div className="relative inline-block self-start mt-1">
                        <img src={previewUrls.documents[index]} alt="Preview" className="h-16 w-auto border-2 border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                        <button type="button" onClick={() => removeDocumentFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center border-2 border-black font-black text-[10px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[1px] active:translate-y-0 transition-transform">X</button>
                      </div>
                    ) : (
                      doc.fileUrl ? (
                         <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 underline truncate max-w-full">
                          Xem tài liệu đã đính kèm
                        </a>
                      ) : (
                        isLocked && <span className="text-xs font-bold text-gray-400">Không có tài liệu</span>
                      )
                    )}
                  </div>
                  {!isLocked && (
                    <button type="button" onClick={() => removeDocument(index)}
                      className="p-2 text-red-700 hover:bg-red-50 border-2 border-black transition-colors flex-shrink-0"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Danh hiệu công khai */}
          <div className="bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
            <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-black">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 text-white flex items-center justify-center font-black text-sm">4</div>
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Danh hiệu nổi bật (Công khai)</h2>
              </div>
              {!isLocked && (
                <button type="button" onClick={addCertificate}
                  className="px-3 py-1.5 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] active:translate-y-0 transition-all"
                >
                  + Thêm danh hiệu
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3">
              Hiển thị trên hồ sơ công khai để học viên xem.
            </p>
            <div className="space-y-3">
              {kycData.certificates.length === 0 && (
                <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Chưa có danh hiệu nào.
                </div>
              )}
              {kycData.certificates.map((cert, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input required disabled={isLocked} type="text"
                    placeholder="Ví dụ: IELTS 8.0, 5 năm kinh nghiệm ReactJS..."
                    value={cert} onChange={(e) => handleCertificateChange(index, e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-white border-2 border-black outline-none font-bold text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  {!isLocked && (
                    <button type="button" onClick={() => removeCertificate(index)}
                      className="p-2 text-red-700 hover:bg-red-50 border-2 border-black transition-colors flex-shrink-0"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          {!isLocked && (
            <div className="flex justify-center pt-2">
              <button type="submit" disabled={isSubmitting}
                className="w-full md:w-auto px-16 py-4 bg-black text-white font-black text-sm uppercase tracking-widest border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-[1px] hover:-translate-x-[1px] active:translate-y-0 active:translate-x-0 active:shadow-none disabled:opacity-40 transition-all"
              >
                {isSubmitting ? 'ĐANG XỬ LÝ HỒ SƠ...' : 'NỘP HỒ SƠ KIỂM DUYỆT NGAY'}
              </button>
            </div>
          )}
        </form>
      </div>
    </MainLayout>
  );
}