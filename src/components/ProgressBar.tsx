import React from 'react';

interface ProgressBarProps {
  percentage: number;
  height?: string;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  height = 'h-2.5',
  showText = false 
}) => {
  const safePercent = Math.min(Math.max(0, percentage), 100);
  const isOver = percentage > 100;

  // Determine colors based on thresholds
  let barColor = 'bg-emerald-500 dark:bg-emerald-450';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  let bgClass = 'bg-slate-100 dark:bg-slate-800';

  if (isOver) {
    barColor = 'bg-red-600 dark:bg-red-500 animate-pulse';
    textColor = 'text-red-600 dark:text-red-400 font-bold';
    bgClass = 'bg-red-50 dark:bg-red-950/20';
  } else if (percentage > 90) {
    barColor = 'bg-rose-500 dark:bg-rose-450';
    textColor = 'text-rose-600 dark:text-rose-400 font-semibold';
  } else if (percentage >= 70) {
    barColor = 'bg-amber-500 dark:bg-amber-450';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Budget Used</span>
          <span className={`font-semibold ${textColor}`}>
            {percentage.toFixed(1)}% {isOver && '(Overspent)'}
          </span>
        </div>
      )}
      <div className={`w-full ${bgClass} rounded-full overflow-hidden ${height} border border-slate-200/20 dark:border-slate-800/50`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`} 
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
};
