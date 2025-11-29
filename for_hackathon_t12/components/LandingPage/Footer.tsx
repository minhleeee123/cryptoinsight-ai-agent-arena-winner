import React from 'react';
import { Sparkles, Globe, Terminal } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 relative border-t border-white/5 z-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-300">CryptoInsight AI</span>
            </div>
            <div className="text-gray-500 text-sm">
                &copy; 2025 CryptoInsight AI.
            </div>
            <div className="flex gap-6 text-gray-500">
                <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Terminal className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>
      </footer>
  );
};
export default Footer;