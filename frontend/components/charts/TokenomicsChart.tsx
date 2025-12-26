
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenDistribution } from '../../types';

interface TokenomicsChartProps {
  data: TokenDistribution[];
  theme?: 'light' | 'dark';
}

const COLORS = ['#4c8df6', '#c888f9', '#f9ab00', '#e65b65', '#00bfa5'];

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ data, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#ffffff' : '#1e1f20';
  const borderColor = isLight ? '#e5e7eb' : '#333';
  const textColor = isLight ? '#1f2937' : '#fff';

  return (
    <div className="w-full h-[300px] bg-white dark:bg-[#1e1f20] rounded-xl p-4 border border-gray-200 dark:border-white/10 flex flex-col transition-colors">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tokenomics</h3>
      
      <div className="flex items-center flex-1 w-full min-h-0">
        {/* Chart Section */}
        <div className="w-[55%] h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data as any}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor, fontSize: '12px' }}
                    itemStyle={{ color: textColor }}
                    formatter={(val: number) => [`${val}%`, 'Allocation']}
                />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Label (Optional - shows total or label) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
               <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase">Dist</span>
            </div>
        </div>

        {/* Custom Legend Section */}
        <div className="w-[45%] flex flex-col justify-center pl-2 space-y-3 overflow-y-auto max-h-full py-2 custom-scrollbar">
            {data.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group">
                    <div 
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <div className="flex flex-col min-w-0">
                         <span className="text-xs text-gray-700 dark:text-gray-300 font-medium leading-tight truncate w-full" title={item.name}>
                            {item.name}
                         </span>
                         <span className="text-[10px] text-gray-500 font-mono mt-0.5">{item.value}%</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TokenomicsChart;
