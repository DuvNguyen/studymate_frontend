import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  suffix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon, suffix }) => {
  const isPositive = trend && trend > 0;

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    return val.toLocaleString();
  };
  
  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-black uppercase tracking-widest text-black">{title}</span>
        {icon && <div className="p-2 bg-yellow-400 border-2 border-black">{icon}</div>}
      </div>
      
      <div className="flex items-end gap-2 overflow-hidden">
        <span className="text-4xl font-black text-black truncate">
          {formatValue(value)}
          {suffix && <span className="text-xl ml-1">{suffix}</span>}
        </span>
        
        {trend !== undefined && (
          <div className={`flex items-center text-xs font-black px-2 py-1 border-2 border-black flex-shrink-0 ${
            isPositive ? 'bg-emerald-400' : 'bg-rose-400'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
