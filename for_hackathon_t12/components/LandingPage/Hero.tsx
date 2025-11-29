
import React from 'react';
import { ArrowRight, Bot } from 'lucide-react';
import TechAvatar from './TechAvatar';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-20 flex flex-col items-center text-center">
        
        {/* 3D Tech Avatar Container */}
        <div className="w-full h-[250px] md:h-[300px] mb-2 relative animate-in fade-in zoom-in duration-1000">
            <TechAvatar />
            {/* Subtle Label under the model */}
            
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            Intelligent Analytics for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-300% animate-gradient">
                Decentralized Future
            </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Experience the next generation of crypto trading. Chat with AI to analyze charts, 
            detect market sentiment, check portfolio health, and execute Web3 transactions instantly.
        </p>

        <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex items-center gap-2"
        >
            Start Analyzing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
        </button>
    </main>
  );
};
export default Hero;
