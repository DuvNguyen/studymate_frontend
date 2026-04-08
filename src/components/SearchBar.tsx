'use client';

export default function SearchBar() {
  return (
    <div className="hidden lg:flex items-center bg-white border-2 border-black px-4 py-2 w-80 lg:w-96 focus-within:bg-gray-50 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
      <svg className="w-5 h-5 text-black mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
        <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="TÌM KIẾM KHÓA HỌC..."
        className="bg-transparent text-xs font-black uppercase tracking-wider outline-none w-full text-black placeholder-gray-500"
      />
    </div>
  );
}
