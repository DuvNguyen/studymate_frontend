'use client';

export default function SearchBar() {
  return (
    <div className="hidden md:flex items-center bg-gray-100/90 rounded-full px-4 py-2 w-80 lg:w-96 border border-transparent focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white focus-within:border-purple-300 transition-all shadow-inner">
      <svg className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Tìm kiếm khóa học..."
        className="bg-transparent text-sm outline-none w-full text-gray-800 placeholder-gray-500"
      />
    </div>
  );
}
