import React, { useMemo } from 'react';

interface EvaluationBarProps {
  score: number;
  evaluationType?: 'CP' | 'MATE';
  orientation?: 'WHITE' | 'BLACK';
}

export const EvaluationBar: React.FC<EvaluationBarProps> = React.memo(({ 
  score = 0, 
  evaluationType = 'CP',
  orientation = 'WHITE'
}) => {
  const isWhite = orientation === 'WHITE';
  const displayScore = score;

  const playerAdvantagePercentage = useMemo(() => {
    if (evaluationType === 'MATE') {
      return displayScore > 0 ? 100 : 0;
    }

    const normalized = Math.tanh(displayScore / 400); 
    const percentage = 50 + normalized * 50;
    return Math.max(2, Math.min(98, percentage));
  }, [displayScore, evaluationType]);

  const getBarColor = () => {
    if (evaluationType === 'MATE') {
      return displayScore > 0 ? 'bg-emerald-500' : 'bg-rose-500';
    }
    if (displayScore > 100) return 'bg-emerald-500';
    if (displayScore < -100) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  const formattedScore = useMemo(() => {
    if (evaluationType === 'MATE') {
      const absScore = Math.abs(score);
      const mateMoves = absScore > 9000 ? Math.max(1, Math.round((10000 - absScore) / 100)) : absScore;
      return displayScore > 0 ? `Mate in +${mateMoves}` : `Mate in -${mateMoves}`;
    }
    const evalInPawns = (displayScore / 100).toFixed(1);
    return `Evaluation: ${displayScore > 0 ? `+${evalInPawns}` : evalInPawns}`;
  }, [displayScore, score, evaluationType]);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[12px] font-mono font-black px-0.5">
        <span className="text-blue-500 font-bold">
          You ({isWhite ? 'White' : 'Black'})
        </span>
        <span className="text-slate-900 dark:text-slate-100 font-black">
          {formattedScore}
        </span>
      </div>
      <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex border border-slate-300 dark:border-slate-700/50 shadow-inner">
        <div 
          className={`h-full transition-all duration-300 ease-out ${getBarColor()}`} 
          style={{ width: `${playerAdvantagePercentage}%` }}
        />
        <div 
          className="h-full bg-slate-300 dark:bg-slate-800 flex-1 transition-all duration-300 ease-out"
        />
      </div>
    </div>
  );
});

EvaluationBar.displayName = 'EvaluationBar';
export default EvaluationBar;
