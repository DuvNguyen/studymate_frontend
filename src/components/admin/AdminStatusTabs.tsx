'use client';

interface AdminStatusTabItem {
  value: string;
  label: string;
  count?: number;
}

interface AdminStatusTabsProps {
  items: AdminStatusTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

export default function AdminStatusTabs({
  items,
  value,
  onChange,
  className = '',
  compact = false,
}: AdminStatusTabsProps) {
  return (
    <div
      className={`flex overflow-x-auto bg-white border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full ${className}`}
    >
      {items.map((tab) => {
        const active = value === tab.value;

        return (
          <button
            key={tab.value || 'ALL'}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`px-3 sm:px-4 py-2 font-black uppercase whitespace-nowrap transition-all text-[10px] sm:text-[11px] ${
              compact ? 'tracking-wide' : 'tracking-widest'
            } ${active ? 'bg-black text-white' : 'text-black hover:bg-zinc-100'}`}
          >
            {tab.label}
            {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
          </button>
        );
      })}
    </div>
  );
}

