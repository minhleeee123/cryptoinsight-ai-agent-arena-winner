
import React from 'react';
import { CryptoData } from '../types';
import PriceChart from './charts/PriceChart';
import TokenomicsChart from './charts/TokenomicsChart';
import SentimentChart from './charts/SentimentChart';
import LongShortChart from './charts/LongShortChart';
import ProjectScoreChart from './charts/ProjectScoreChart';
import { Sparkles } from 'lucide-react';

interface Props {
  data: CryptoData;
}

const CryptoDashboard: React.FC<Props> = ({ data }) => {
  // Access theme via a simple check of document class or passed context. 
  // Since we don't have global context, we check the DOM or default to dark.
  // Ideally this should be passed as a prop, but for this specific component structure:
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="w-full mt-4 space-y-6 animate-fade-in">
      
      {/* Header Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{data.coinName} Analysis</h2>
          <span className="ml-auto text-xl font-bold text-gray-900 dark:text-white">${data.currentPrice.toLocaleString()}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* Top Row: Price & Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {/* Replaced AreaChart with TradingView Widget, passing Symbol */}
          {/* PriceChart handles its own theme prop or defaults. We need to force update it when theme changes in App */}
          <PriceChart symbol={data.symbol || "BTC"} theme={isDark ? 'dark' : 'light'} />
        </div>
        <div className="md:col-span-1">
          <SentimentChart score={data.sentimentScore} />
        </div>
      </div>

      {/* Middle Row: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TokenomicsChart data={data.tokenomics} />
        <ProjectScoreChart data={data.projectScores} />
        <LongShortChart data={data.longShortRatio} />
      </div>
    </div>
  );
};

export default CryptoDashboard;
