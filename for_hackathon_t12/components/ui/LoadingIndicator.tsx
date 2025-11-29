
import React from 'react';
import { Sparkles, Activity, PieChart, Wallet } from 'lucide-react';

interface LoadingIndicatorProps {
  status: string; // 'fetching-data' | 'analyzing' | 'thinking' | 'analyzing-portfolio' | 'creating-transaction' | ''
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ status }) => {
  return (
    <div className="flex gap-4 animate-fade-in">
       <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
       </div>
       <div className="flex flex-col gap-2 w-full max-w-md">
         {status === 'fetching-data' && (
           <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl max-w-fit">
                     <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-blue-700 dark:text-blue-200 text-sm font-medium flex items-center gap-2">
                            Market Data Agent
                            <Activity className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        </span>
                        <span className="text-blue-600/70 dark:text-blue-300/70 text-xs">Gathering live price, tokenomics, and sentiment data...</span>
                      </div>
                </div>
           </div>
         )}
         {status === 'analyzing' && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl max-w-fit">
                     <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-blue-700 dark:text-blue-200 text-sm font-medium flex items-center gap-2">
                            Analysis Agent Active
                            <Activity className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                        </span>
                        <span className="text-blue-600/70 dark:text-blue-300/70 text-xs">Reading chart metrics & generating insights...</span>
                      </div>
                </div>
            </div>
         )}
         {status === 'analyzing-portfolio' && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl max-w-fit">
                     <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-purple-700 dark:text-purple-200 text-sm font-medium flex items-center gap-2">
                            Portfolio Analyst Agent
                            <PieChart className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                        </span>
                        <span className="text-purple-600/70 dark:text-purple-300/70 text-xs">Evaluating holdings, diversification, and PNL...</span>
                      </div>
                </div>
            </div>
         )}
         {status === 'creating-transaction' && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-3 px-4 py-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl max-w-fit">
                     <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-orange-700 dark:text-orange-200 text-sm font-medium flex items-center gap-2">
                            Transaction Agent
                            <Wallet className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                        </span>
                        <span className="text-orange-600/70 dark:text-orange-300/70 text-xs">Constructing transaction payload...</span>
                      </div>
                </div>
            </div>
         )}
         {status === 'thinking' && (
            <div className="px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-[#1e1f20] text-gray-600 dark:text-gray-400 text-sm animate-pulse">
                Thinking...
            </div>
         )}
       </div>
    </div>
  );
};

export default LoadingIndicator;
