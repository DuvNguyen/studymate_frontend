'use client';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  borderSize?: 2 | 4;
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  borderSize = 2,
}: AdminSearchBarProps) {
  const containerClasses = borderSize === 4
    ? "bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 min-w-0"
    : "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 min-w-0";

  const inputClasses = borderSize === 4
    ? "w-full pl-10 pr-4 py-3 border-4 border-black font-black text-sm focus:outline-none focus:bg-yellow-50 placeholder-black/30 text-black uppercase"
    : "w-full pl-10 pr-4 py-3 border-2 border-black font-bold text-sm focus:outline-none focus:bg-yellow-50 placeholder-black/30 text-black uppercase";

  const buttonClasses = borderSize === 4
    ? "px-6 py-3.5 border-4 border-black bg-white font-black text-xs uppercase hover:bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] text-black"
    : "px-4 py-3 border-2 border-black bg-white font-black text-xs uppercase hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] text-black";

  const iconClasses = borderSize === 4
    ? "absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50"
    : "absolute left-3 top-1/2 -translate-y-1/2 text-black/50";

  const strokeWidth = borderSize === 4 ? 4 : 3;
  const iconSize = borderSize === 4 ? 18 : 20;

  return (
    <div className={containerClasses}>
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={placeholder}
          className={inputClasses}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className={iconClasses}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>
      {value && (
        <button
          onClick={() => onChange('')}
          className={buttonClasses}
        >
          Xóa
        </button>
      )}
    </div>
  );
}
