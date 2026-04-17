import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title = "KHÔNG TÌM THẤY DỮ LIỆU",
  description = "CHÚNG TÔI ĐÃ LỤC TÌM KHẮP NƠI NHƯNG KHÔNG THẤY GÌ CẢ. HÃY THỬ LẠI VỚI TỪ KHÓA KHÁC HOẶC TẠO MỚI NHÉ!",
  action,
  compact = false
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center bg-white border-4 border-black border-dashed ${compact ? 'p-8' : 'p-16'} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
      <div className={`${compact ? 'p-4 mb-4' : 'p-6 mb-8'} bg-yellow-400 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
        <Icon className={`${compact ? 'w-8 h-8' : 'w-16 h-16'} text-black`} />
      </div>
      
      <h3 className={`${compact ? 'text-xl' : 'text-3xl'} font-black uppercase tracking-tight text-black mb-4 italic`}>
        {title}
      </h3>
      
      <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-black uppercase tracking-widest text-black max-w-md leading-relaxed mb-8`}>
        {description}
      </p>

      {action && (
        <Button 
          onClick={action.onClick}
          size={compact ? 'sm' : 'lg'}
          className="bg-black text-white hover:bg-yellow-400 hover:text-black font-black"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
