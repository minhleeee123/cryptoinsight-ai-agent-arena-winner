
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ProjectMetric } from '../../types';

interface ProjectScoreChartProps {
  data: ProjectMetric[];
  theme?: 'light' | 'dark';
}

const ProjectScoreChart: React.FC<ProjectScoreChartProps> = ({ data, theme = 'dark' }) => {
  const isLight = theme === 'light';
  const gridColor = isLight ? '#e5e7eb' : '#444';
  const tickColor = isLight ? '#6b7280' : '#aaa';
  const bgColor = isLight ? '#ffffff' : '#1e1f20';
  const borderColor = isLight ? '#e5e7eb' : '#333';
  const textColor = isLight ? '#1f2937' : '#fff';

  return (
    <div className="w-full h-[300px] bg-white dark:bg-[#1e1f20] rounded-xl p-4 border border-gray-200 dark:border-white/10 transition-colors">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Project Score</h3>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="#4c8df6"
            strokeWidth={2}
            fill="#4c8df6"
            fillOpacity={0.4}
          />
           <Tooltip 
             contentStyle={{ backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
             itemStyle={{ color: textColor }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectScoreChart;
