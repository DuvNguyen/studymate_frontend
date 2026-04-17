import React from 'react';

interface LoadingScreenProps {
  title?: string;
  description?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  title = "ĐANG CHUẨN BỊ KHÔNG GIAN HỌC TẬP...", 
  description = "XIN VUI LÒNG CHỜ GIÂY LÁT, STUDYMATE ĐANG TẢI DỮ LIỆU KHÓA HỌC DÀNH RIÊNG CHO BẠN.",
  fullScreen = true
}) => {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} bg-gray-50 flex flex-col items-center justify-center p-4 text-center`}>
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-none animate-spin mb-6"></div>
      <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-xs font-black uppercase tracking-widest text-gray-500 max-w-md leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default LoadingScreen;
