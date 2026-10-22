import React from 'react';
import { CheckCircle2, ArrowRight, ShieldCheck, Trophy } from 'lucide-react';

interface SignUpSuccessCardProps {
  username: string;
  onProceedToSignIn: () => void;
}

export const SignUpSuccessCard: React.FC<SignUpSuccessCardProps> = ({
  username,
  onProceedToSignIn,
}) => {
  return (
    <div className="w-full flex flex-col justify-between h-full">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-1 sm:px-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 size={38} />
        </div>

        <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-emerald-400">
          ACCOUNT CREATED
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase mt-7 sm:mt-8">
          WELCOME, <span className="text-indigo-400">@{username}</span>!
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mt-2.5 font-medium max-w-sm leading-relaxed">
          Your account is ready. Welcome to Chess Platform!
        </p>

        {/* ELO Summary */}
        <div className="w-full mt-8 sm:mt-10 p-4 sm:p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5 text-slate-200">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">Starting Rating</span>
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-400">
            1200 ELO
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onProceedToSignIn}
          className="w-full py-4 mt-8 sm:mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2.5"
        >
          <span>PROCEED TO SIGN IN</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer Signature */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-4 w-full">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span>CHESS PLATFORM</span>
        </div>
        <span>BATUHAN BAYSAL • 2026</span>
      </div>
    </div>
  );
};

export default SignUpSuccessCard;
