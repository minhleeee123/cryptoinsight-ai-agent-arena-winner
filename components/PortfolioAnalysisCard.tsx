
import React from 'react';
import { PortfolioAnalysisResult } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle, PieChart } from 'lucide-react';

interface Props {
  data: PortfolioAnalysisResult;
}

const PortfolioAnalysisCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full bg-white dark:bg-[#1e1f20] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-lg animate-fade-in mt-2">
      
      {/* Header Summary */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Total Portfolio Value</h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${data.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-black/20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10">
            <PieChart className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{data.positions.length} Assets</span>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-white/5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-white/5">
              <th className="p-4">Asset</th>
              <th className="p-4 text-right">Allocation</th>
              <th className="p-4 text-right">Price (Avg/Curr)</th>
              <th className="p-4 text-right">Value</th>
              <th className="p-4 text-right">PnL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5 text-sm">
            {data.positions.map((pos, idx) => {
               const isProfit = pos.pnlPercent >= 0;
               return (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">
                    {pos.asset} <span className="text-gray-500 font-normal ml-1">x{pos.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-700 dark:text-gray-300">{pos.allocation.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pos.allocation}%` }} />
                        </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white font-medium">${pos.currentPrice.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">Avg: ${pos.avgPrice.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium text-gray-900 dark:text-white">
                    ${pos.currentValue.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className={`inline-flex items-center gap-1 font-bold ${isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos.pnlPercent > 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-white/10 bg-gray-50 dark:bg-[#1a1b1d]">
          {/* Risk */}
          <div className="p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500" /> Risk Assessment
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {data.riskAnalysis}
              </p>
          </div>
          
          {/* Suggestions */}
          <div className="p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
                  <TrendingUp className="w-4 h-4 text-green-500" /> Rebalancing Suggestions
              </h4>
              <ul className="space-y-2">
                  {data.rebalancingSuggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="text-blue-500 font-bold">•</span>
                          {suggestion}
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysisCard;
