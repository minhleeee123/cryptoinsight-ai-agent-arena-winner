
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
                a="Absolutely. Security is our top priority. We never ask for, store, or have access to your private keys or recovery phrases. The AI merely constructs the transaction data payload for you. This payload is then passed to your browser wallet (like MetaMask), where you review the full details and explicitly sign the transaction yourself. You remain in full control of your assets at all times." 
            />
            <FAQItem 
                q="Which chains do you support?" 
                a="For direct transaction execution (Send/Swap), we support multiple major EVM networks including Ethereum Mainnet, Binance Smart Chain (BSC), Polygon, and Avalanche C-Chain via MetaMask. Our AI Market Intelligence engine is also chain-agnostic, capable of analyzing price action, sentiment, and fundamental data for over 10,000 cryptocurrencies across Solana, Cosmos, and more using real-time data aggregators." 
            />
            <FAQItem 
                q="Is the AI analysis financial advice?" 
                a="No, the information provided by CryptoInsight AI is for educational and informational purposes only. While our AI aggregates vast amounts of market data, technical indicators, and sentiment metrics to highlight potential opportunities, it cannot predict the future with certainty. Cryptocurrency trading involves significant risk. Always conduct your own research (DYOR) and consult with a qualified financial advisor before making investment decisions." 
            />
         </div>
      </section>
  );
};
export default FAQ;
