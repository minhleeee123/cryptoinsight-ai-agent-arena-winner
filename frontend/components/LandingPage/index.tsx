import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Workflow from './Workflow';
import DeepDive from './DeepDive';
import Features from './Features';
import FAQ from './FAQ';
import Footer from './Footer';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-blue-500/30 relative">
      
      {/* 1. FIXED Background Gradients (Top of viewport) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-3000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* 2. SCROLLING Background Ambience (Bridges the gaps down the page) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[1000px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/5 rounded-full blur-[100px]" />
         {/* Updated colors to match new section order: Cyan (Deep Data) -> Green (Portfolio) -> Purple (Vision) -> Orange (Web3) */}
         <div className="absolute top-[1800px] right-[-20%] w-[800px] h-[800px] bg-cyan-900/5 rounded-full blur-[100px]" />
         <div className="absolute top-[2600px] left-[-20%] w-[800px] h-[800px] bg-green-900/5 rounded-full blur-[100px]" />
         <div className="absolute top-[3500px] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      <Navbar onStart={onStart} />
      <Hero onStart={onStart} />
      <Workflow />
      <DeepDive />
      <Features />
      <FAQ />

      {/* Bottom CTA */}
      <section className="py-32 relative overflow-hidden z-10">
         <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent pointer-events-none" />
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your trading?</h2>
            <p className="text-xl text-gray-400 mb-10">Join thousands of traders using AI to navigate the market.</p>
            <button 
                onClick={onStart}
                className="px-10 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-xl"
            >
                Get Started for Free
            </button>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;