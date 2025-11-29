
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LongShortData } from '../../types';

interface LongShortChartProps {
  data: LongShortData[];
  theme?: 'light' | 'dark';
}

const LongShortChart: React.FC<LongShortChartProps> = ({ data, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const gridColor = isLight ? '#e5e7eb' : '#333';
  const tickColor = isLight ? '#6b7280' : '#888';
  const bgColor = isLight ? '#ffffff' : '#1e1f20';
  const borderColor = isLight ? '#e5e7eb' : '#333';
  const textColor = isLight ? '#1f2937' : '#fff';

  // Safeguard: Ensure data is an array
  const chartData = Array.isArray(data) ? data : [];

  if (chartData.length === 0) {
    return (
      <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No Long/Short data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] rounded-xl p-4 border border-gray-200 dark:border-white/10 transition-colors">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Long/Short Ratio</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis 
            dataKey="time" 
            tick={{ fill: tickColor, fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
             cursor={{fill: 'transparent'}}
             contentStyle={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: tickColor }}/>
          <Bar dataKey="long" stackId="a" fill="#00bfa5" name="Longs" radius={[0, 0, 4, 4]} />
          <Bar dataKey="short" stackId="a" fill="#e65b65" name="Shorts" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LongShortChart;
