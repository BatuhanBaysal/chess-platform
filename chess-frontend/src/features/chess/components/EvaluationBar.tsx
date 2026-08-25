import React, { useMemo } from 'react';

interface EvaluationBarProps {
  score: number;
  evaluationType?: 'CP' | 'MATE';
}

export const EvaluationBar: React.FC<EvaluationBarProps> = React.memo(({ score = 0, evaluationType = 'CP' }) => {
  const whitePercentage = useMemo(() => {
    if (evaluationType === 'MATE') {
      return score > 0 ? 100 : 0;
    }

    const normalized = Math.tanh(score / 400); 
    const percentage = 50 + normalized * 50;
    return Math.max(2, Math.min(98, percentage));
  }, [score, evaluationType]);

  const getBarColor = () => {
    if (evaluationType === 'MATE') {
      return score > 0 ? 'bg-emerald-500' : 'bg-rose-500';
    }
    if (score > 100) return 'bg-emerald-500';
    if (score < -100) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[13px] font-mono font-black text-slate-700 dark:text-slate-300 px-0.5">
        <span>Black</span>
        <span className="text-slate-900 dark:text-slate-100 font-black">
          {evaluationType === 'MATE' ? `Mate: ${score}` : `Eval: ${score > 0 ? `+${score}` : score}`}
        </span>
        <span>White</span>
      </div>
      <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-700/50 shadow-inner">
        <div 
          className={`h-full transition-all duration-150 ease-out ${getBarColor()}`} 
          style={{ width: `${whitePercentage}%` }}
        />
        <div 
          className="h-full bg-slate-300 dark:bg-slate-800 flex-1 transition-all duration-150 ease-out"
        />
      </div>
    </div>
  );
});

EvaluationBar.displayName = 'EvaluationBar';
