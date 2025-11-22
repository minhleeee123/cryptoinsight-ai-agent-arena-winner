import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { TokenDistribution } from '../../types';

interface TokenomicsChartProps {
  data: TokenDistribution[];
}

const COLORS = ['#4c8df6', '#c888f9', '#f9ab00', '#e65b65', '#00bfa5'];

const TokenomicsChart: React.FC<TokenomicsChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-gemini-surface rounded-xl p-4 border border-white/10 flex flex-col">
      <h3 className="text-sm font-medium text-gray-400 mb-2">Tokenomics</h3>
      
      <div className="flex items-center flex-1 w-full min-h-0">
        {/* Chart Section */}
        <div className="w-[55%] h-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data}
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
                    contentStyle={{ backgroundColor: '#1e1f20', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(val: number) => [`${val}%`, 'Allocation']}
                />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Label (Optional - shows total or label) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
               <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Dist</span>
            </div>
        </div>

        {/* Custom Legend Section - Prevents overlap issues completely */}
        <div className="w-[45%] flex flex-col justify-center pl-2 space-y-3 overflow-y-auto max-h-full py-2 custom-scrollbar">
            {data.map((item, index) => (
                <div key={index} className="flex items-start gap-2 group">
                    <div 
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0 transition-transform group-hover:scale-110" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                    />
                    <div className="flex flex-col min-w-0">
                         <span className="text-xs text-gray-300 font-medium leading-tight truncate w-full" title={item.name}>
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