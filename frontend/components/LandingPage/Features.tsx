
import React from 'react';
import { BarChart3, Shield, Bot, Zap } from 'lucide-react';

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="p-6 rounded-2xl bg-[#131314] border border-white/5 hover:border-blue-500/30 hover:bg-[#1a1b1e] transition-all group">
        <div className="w-12 h-12 rounded-lg bg-[#1e1f20] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
            {desc}
        </p>
    </div>
);

const Features: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-cyan-400" />}
                title="Market Intelligence"
                desc="Real-time price action, tokenomics, and sentiment analysis powered by live data sources."
            />
             <FeatureCard 
                icon={<Shield className="w-6 h-6 text-green-400" />}
                title="Portfolio Health"
                desc="Connect your wallet for instant risk assessment and rebalancing suggestions."
            />
            <FeatureCard 
                icon={<Bot className="w-6 h-6 text-purple-400" />}
                title="Vision Agent"
                desc="Capture your marked-up charts. The AI interprets your lines and indicators to validate your strategy."
            />
             <FeatureCard 
                icon={<Zap className="w-6 h-6 text-orange-400" />}
                title="Web3 Actions"
                desc="Draft transactions via chat. Send tokens and swap assets on EVM chains seamlessly."
            />
        </div>
      </section>
  );
};
export default Features;
