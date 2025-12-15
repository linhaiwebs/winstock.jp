import { useEffect, useState } from 'react';

const AiRobotBadge = () => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="flex justify-center py-6 md:py-8">
      <div className="relative">
        <div className="relative inline-flex flex-col items-center gap-3 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border border-cyan-500/30 rounded-2xl px-6 py-4 shadow-lg shadow-blue-500/20 backdrop-blur-sm animate-float">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
              <div className="relative w-2 h-6 bg-gradient-to-b from-slate-600 to-slate-700 rounded-full">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-glow shadow-lg shadow-cyan-400/60" />
              </div>
            </div>

            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />

              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4">
                <div className={`w-3 h-3 md:w-4 md:h-4 bg-slate-900 rounded-full transition-all duration-200 ${isBlinking ? 'scale-y-[0.2]' : 'scale-y-100'} shadow-inner`}>
                  {!isBlinking && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full ml-0.5 mt-0.5 animate-eye-shine" />
                  )}
                </div>
                <div className={`w-3 h-3 md:w-4 md:h-4 bg-slate-900 rounded-full transition-all duration-200 ${isBlinking ? 'scale-y-[0.2]' : 'scale-y-100'} shadow-inner`}>
                  {!isBlinking && (
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full ml-0.5 mt-0.5 animate-eye-shine" />
                  )}
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-1.5 bg-slate-900/40 rounded-full" />
            </div>

            <div className="absolute -right-8 top-2 w-4 h-4 text-cyan-400 animate-float-delayed opacity-70">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 17l-5-5-3 3-4-4" />
              </svg>
            </div>
            <div className="absolute -left-8 top-4 w-4 h-4 text-blue-400 animate-float-slow opacity-70">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
            </div>
          </div>

          <span className="text-sm md:text-base font-bold text-cyan-300 tracking-wide whitespace-nowrap">
            AI診断アシスタント
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent blur-xl -z-10 animate-pulse-slow" />
      </div>
    </div>
  );
};

export default AiRobotBadge;
