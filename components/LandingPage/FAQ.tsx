import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const FAQItem = ({ q, a }: { q: string, a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-white/10 rounded-xl bg-[#131314] overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-medium text-white">{q}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-5 pt-0 text-gray-400 text-sm leading-relaxed border-t border-white/5 bg-[#0a0a0a]">
                    {a}
                </div>
            )}
        </div>
    );
};

const FAQ: React.FC = () => {
  return (
    <section className="max-w-3xl mx-auto px-6 py-24 relative z-10">
         <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
         <div className="space-y-4">
            <FAQItem 
                q="Is my private key safe?" 
                a="Absolutely. We never ask for your private key. All transactions are constructed by the AI but must be signed by your own wallet (MetaMask)." 
            />
            <FAQItem 
                q="Which chains do you support?" 
                a="Currently we support Ethereum Mainnet, Binance Smart Chain, Polygon, and Sepolia Testnet for transactions. Analysis covers all coins on CoinGecko." 
            />
            <FAQItem 
                q="Is the AI analysis financial advice?" 
                a="No. CryptoInsight AI provides data-driven insights and technical analysis patterns, but all trading decisions are your own responsibility." 
            />
         </div>
      </section>
  );
};
export default FAQ;