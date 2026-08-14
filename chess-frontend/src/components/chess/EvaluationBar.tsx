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

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 px-0.5">
        <span>Black</span>
        <span className="text-slate-600 dark:text-slate-300">
          {evaluationType === 'MATE' ? `Mate: ${score}` : `Eval: ${score > 0 ? `+${score}` : score}`}
        </span>
        <span>White</span>
      </div>
      <div className="relative w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700/50 shadow-inner">
        <div 
          className="h-full bg-slate-200 transition-all duration-150 ease-out" 
          style={{ width: `${whitePercentage}%` }}
        />
        <div 
          className="h-full bg-slate-800 flex-1 transition-all duration-150 ease-out"
        />
      </div>
    </div>
  );
});

EvaluationBar.displayName = 'EvaluationBar';
