import React from 'react';
import { Sparkles } from 'lucide-react';

interface NavbarProps {
  onStart: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onStart }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">CryptoInsight <span className="text-blue-400">AI</span></span>
            </div>
            <button 
                onClick={onStart}
                className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-gray-300 hover:text-white"
            >
                Launch App
            </button>
        </div>
      </nav>
  );
};
export default Navbar;