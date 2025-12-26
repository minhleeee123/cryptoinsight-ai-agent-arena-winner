
import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface SentimentChartProps {
  score: number;
  theme?: 'light' | 'dark';
}

const SentimentChart: React.FC<SentimentChartProps> = ({ score, theme = 'dark' }) => {
  const isLight = theme === 'light';
  
  // Debug log
  console.log('[SentimentChart] Received score:', score, typeof score);
  
  // Validate score is a number
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 50;
  
  // Determine color based on score
  let color = '#f9ab00'; // Neutral (Yellow)
  let status = 'Neutral';
  
  if (validScore <= 30) {
    color = '#e65b65'; // Fear (Red)
    status = 'Extreme Fear';
  } else if (validScore >= 70) {
    color = '#00bfa5'; // Greed (Green)
    status = 'Extreme Greed';
  }

  const data = [{ name: 'Sentiment', value: validScore, fill: color }];
  const bgFill = isLight ? '#f3f4f6' : '#333';

  return (
    <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] rounded-xl p-4 border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center relative transition-colors">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 absolute top-4 left-4">Market Sentiment</h3>
      
      <div className="w-full h-[180px] relative">
        <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
            cx="50%" 
            cy="70%" 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={20} 
            data={data} 
            startAngle={180} 
            endAngle={0}
            >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
                background={{ fill: bgFill }}
                dataKey="value"
                cornerRadius={10}
            />
            </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-[65%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{validScore}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{status}</div>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
