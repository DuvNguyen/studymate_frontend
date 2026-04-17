'use client';

import React from 'react';
import Link from 'next/link';

const FOOTER_LINKS = [
  {
    title: 'Nghề nghiệp phổ biến',
    links: [
      'Nhà khoa học dữ liệu',
      'Lập trình viên Full-stack',
      'Kỹ sư điện toán đám mây',
      'Quản lý dự án',
      'Lập trình viên Game',
    ]
  },
  {
    title: 'Chứng chỉ theo kỹ năng',
    links: [
      'Chứng chỉ an ninh mạng',
      'Chứng chỉ quản lý dự án',
      'Chứng chỉ đám mây',
      'Chứng chỉ phân tích dữ liệu',
      'Chứng chỉ nhân sự',
    ]
  },
  {
    title: 'Phát triển Web',
    links: [
      'JavaScript',
      'React JS',
      'Angular',
      'Java',
      'Node.js',
    ]
  },
  {
    title: 'Về chúng tôi',
    links: [
      'Giới thiệu',
      'Nghề nghiệp',
      'Liên hệ',
      'Blog',
      'Nhà đầu tư',
    ]
  },
  {
    title: 'Điều khoản & Pháp lý',
    links: [
      'Tuyên bố về khả năng tiếp cận',
      'Chính sách bảo mật',
      'Sơ đồ trang web',
      'Điều khoản sử dụng',
    ]
  }
];

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white border-t-4 border-black p-10 md:p-16 space-y-16">
      {/* Top Section: Partners / Social Proof Mockup */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b-4 border-white/10 pb-10">
        <div className="text-xl font-black uppercase tracking-tighter">
          Các công ty hàng đầu chọn <span className="text-yellow-400 italic">StudyMate</span> để phát triển kỹ năng.
        </div>
        <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale contrast-125">
          <span className="font-black text-2xl uppercase tracking-widest">NASDAQ</span>
          <span className="font-black text-2xl uppercase tracking-widest">VW</span>
          <span className="font-black text-2xl uppercase tracking-widest">NETAPP</span>
          <span className="font-black text-2xl uppercase tracking-widest">EVENTBRITE</span>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
        {FOOTER_LINKS.map((section) => (
          <div key={section.title} className="space-y-4">
            <h4 className="font-black uppercase text-xs tracking-[0.2em] text-white/50 mb-6 border-b-2 border-white/20 pb-2 inline-block">
              {section.title}
            </h4>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <Link 
                    href="#" 
                    className="text-sm font-bold text-white/80 hover:text-yellow-400 hover:underline decoration-2 underline-offset-4 transition-all"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t-4 border-white/10">
        <div className="flex items-center gap-2">
           <div className="bg-white text-black font-black px-3 py-1 border-2 border-black -rotate-2">
             SM
           </div>
           <span className="text-lg font-black tracking-tight uppercase">StudyMate</span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
          © 2024 StudyMate, Inc. • Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
