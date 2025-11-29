import React from 'react';
import { Terminal, Cpu, Zap } from 'lucide-react';

const WorkflowStep = ({ step, title, desc, icon }: { step: string, title: string, desc: string, icon: React.ReactNode }) => (
    <div className="relative z-10 flex flex-col items-center text-center group">
        <div className="w-16 h-16 rounded-2xl bg-[#131314] border border-white/10 flex items-center justify-center mb-6 group-hover:border-blue-500/50 group-hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.5)] transition-all duration-300">
            {icon}
        </div>
        <div className="text-xs font-bold text-blue-500 mb-2">STEP {step}</div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">{desc}</p>
    </div>
);

const Workflow: React.FC = () => {
  return (
    <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">Three simple steps to master the market with AI assistance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0" />

                <WorkflowStep 
                    step="01" 
                    title="Connect & Ask" 
                    desc="Link your wallet or simply ask natural language questions about any token."
                    icon={<Terminal className="w-6 h-6 text-blue-400" />} 
                />
                <WorkflowStep 
                    step="02" 
                    title="AI Analysis" 
                    desc="Gemini processes real-time data, news, and chart patterns to generate insights."
                    icon={<Cpu className="w-6 h-6 text-purple-400" />} 
                />
                <WorkflowStep 
                    step="03" 
                    title="Execute" 
                    desc="Review the strategy and execute swaps or trades directly from the chat interface."
                    icon={<Zap className="w-6 h-6 text-orange-400" />} 
                />
            </div>
        </div>
      </section>
  );
};
export default Workflow;