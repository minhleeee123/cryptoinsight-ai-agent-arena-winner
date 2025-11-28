
import React, { useState } from 'react';
import { ArrowRight, Bot, BarChart3, Zap, Shield, Sparkles, PieChart, Layers, CheckCircle2, ChevronDown, ChevronUp, Terminal, Cpu, Globe, Wallet, Activity } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Gradients - Adjusted for seamless look */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-3000" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Navbar */}
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

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Bot className="w-3 h-3" />
            Powered by Gemini 2.5 Flash
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            Intelligent Analytics for the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-300% animate-gradient">
                Decentralized Future
            </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Experience the next generation of crypto trading. Chat with AI to analyze charts, 
            detect market sentiment, check portfolio health, and execute Web3 transactions instantly.
        </p>

        {/* CTA Button */}
        <button 
            onClick={onStart}
            className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex items-center gap-2"
        >
            Start Analyzing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Button Glow */}
            <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all" />
        </button>

      </main>

      {/* Workflow Section - Removed bg color for seamlessness */}
      <section className="py-24 relative">
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

      {/* Deep Dive Features - Split Layouts */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
            
            {/* Feature 1: Vision */}
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase">
                        Multimodal AI
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">See the Market like a Pro</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Don't just look at numbers. Upload screenshots of charts, and our Vision Agent will identify support/resistance lines, candlestick patterns, and potential breakout zones automatically.
                    </p>
                    <ul className="space-y-3 pt-4">
                        <CheckItem text="Pattern Recognition (Head & Shoulders, Flags)" />
                        <CheckItem text="Auto-Support/Resistance Levels" />
                        <CheckItem text="Actionable Trading Setups" />
                    </ul>
                </div>
                <div className="flex-1 w-full relative group">
                    <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="aspect-[4/3] bg-[#0a0a0a] rounded-lg overflow-hidden relative flex flex-col items-center justify-center border border-white/5">
                            {/* Abstract Chart UI */}
                            <div className="w-full h-1/2 flex items-end gap-1 px-8 pb-4 opacity-50">
                                <div className="w-4 h-12 bg-green-500/50 rounded-sm"></div>
                                <div className="w-4 h-20 bg-green-500/50 rounded-sm"></div>
                                <div className="w-4 h-16 bg-red-500/50 rounded-sm"></div>
                                <div className="w-4 h-24 bg-green-500/50 rounded-sm"></div>
                                <div className="w-4 h-10 bg-red-500/50 rounded-sm"></div>
                            </div>
                            <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30 backdrop-blur-md">
                                Bullish Flag Detected
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 2: Web3 Transaction */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold uppercase">
                        Web3 Native
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Chat-to-Chain Execution</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Why leave the interface? Draft transactions using natural language. "Swap 1 ETH to USDT" is all it takes to generate a transaction payload ready for your signature.
                    </p>
                     <ul className="space-y-3 pt-4">
                        <CheckItem text="Natural Language Intent Parsing" />
                        <CheckItem text="Gas Estimation & Simulation" />
                        <CheckItem text="Supports Ethereum, BSC, Polygon" />
                    </ul>
                </div>
                <div className="flex-1 w-full relative group">
                     <div className="absolute inset-0 bg-orange-600/20 blur-[80px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-6 shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto">
                        {/* Abstract Transaction Card */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm text-gray-400">
                                <span>Swap</span>
                                <span className="text-white font-bold">Ethereum Mainnet</span>
                            </div>
                            <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5 flex justify-between items-center">
                                <span className="text-2xl font-bold">1.0</span>
                                <span className="bg-blue-600 px-2 py-1 rounded text-xs font-bold">ETH</span>
                            </div>
                             <div className="flex justify-center">
                                <ArrowRight className="w-5 h-5 text-gray-500 rotate-90" />
                            </div>
                             <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5 flex justify-between items-center">
                                <span className="text-2xl font-bold text-gray-500">3,240.50</span>
                                <span className="bg-green-600 px-2 py-1 rounded text-xs font-bold">USDT</span>
                            </div>
                            <div className="w-full py-3 bg-blue-600 rounded-lg text-center font-bold text-sm">
                                Confirm Transaction
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 3: Portfolio Guard */}
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold uppercase">
                        Portfolio Guard
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Smart Portfolio Tracking</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Connect your wallet for instant analysis. The agent evaluates your diversification, checks for risky assets, and suggests rebalancing strategies to protect your gains.
                    </p>
                    <ul className="space-y-3 pt-4">
                        <CheckItem text="Real-time PNL Tracking" />
                        <CheckItem text="Risk Exposure Assessment" />
                        <CheckItem text="Multi-Chain Wallet Support" />
                    </ul>
                </div>
                <div className="flex-1 w-full relative group">
                    <div className="absolute inset-0 bg-green-600/20 blur-[80px] rounded-full group-hover:bg-green-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto">
                        {/* Abstract Wallet Card */}
                        <div className="space-y-6">
                             <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                                    <Wallet className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Total Balance</div>
                                    <div className="text-xl font-bold text-white">$42,593.00</div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                {/* Asset 1 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Bitcoin</span>
                                        <span className="text-white font-medium">$28,000</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[65%] bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Asset 2 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Ethereum</span>
                                        <span className="text-white font-medium">$12,400</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[30%] bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Asset 3 */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Solana</span>
                                        <span className="text-white font-medium">$2,193</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[15%] bg-purple-500 rounded-full"></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature 4: Deep Analysis */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase">
                        Deep Data
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Institutional-Grade Analysis</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Go deeper than just price. Our agents aggregate sentiment scores, Long/Short ratios, and on-chain metrics to generate comprehensive reports for any coin.
                    </p>
                    <ul className="space-y-3 pt-4">
                        <CheckItem text="Fear & Greed Index Integration" />
                        <CheckItem text="Exchange Long/Short Ratios" />
                        <CheckItem text="Project Scoring Radar" />
                    </ul>
                </div>
                <div className="flex-1 w-full relative group">
                    <div className="absolute inset-0 bg-cyan-600/20 blur-[80px] rounded-full group-hover:bg-cyan-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-4 shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500">
                        {/* Abstract Dashboard */}
                        <div className="grid grid-cols-2 gap-4">
                             {/* Sentiment Widget */}
                             <div className="col-span-1 bg-[#0a0a0a] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase">Sentiment</span>
                                <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-cyan-400 border-r-cyan-400 rotate-45 flex items-center justify-center">
                                    <span className="text-lg font-bold text-white -rotate-45">72</span>
                                </div>
                                <span className="text-xs text-cyan-400">Greed</span>
                             </div>
                             {/* L/S Widget */}
                             <div className="col-span-1 bg-[#0a0a0a] rounded-xl p-3 border border-white/5 flex flex-col justify-between">
                                <span className="text-[10px] text-gray-500 uppercase mb-2">Long/Short</span>
                                <div className="flex items-end gap-1 h-12">
                                    <div className="w-2 bg-green-500 h-[80%] rounded-t-sm"></div>
                                    <div className="w-2 bg-red-500 h-[40%] rounded-t-sm"></div>
                                    <div className="w-2 bg-green-500 h-[60%] rounded-t-sm"></div>
                                    <div className="w-2 bg-red-500 h-[30%] rounded-t-sm"></div>
                                    <div className="w-2 bg-green-500 h-[90%] rounded-t-sm"></div>
                                </div>
                             </div>
                             {/* Wide Widget */}
                             <div className="col-span-2 bg-[#0a0a0a] rounded-xl p-3 border border-white/5 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <Activity className="w-5 h-5 text-cyan-400" />
                                     <div>
                                         <div className="text-xs text-gray-400">Project Score</div>
                                         <div className="text-sm font-bold text-white">A+ (92/100)</div>
                                     </div>
                                 </div>
                                 <div className="h-8 w-24 bg-gradient-to-r from-cyan-900/20 to-cyan-500/20 rounded-md border border-cyan-500/30 flex items-center justify-center">
                                     <span className="text-xs text-cyan-400 font-bold">Strong Buy</span>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* Grid Features - Removed bg color for seamlessness */}
      <section className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
                title="Market Intelligence"
                desc="Real-time price action, tokenomics, and sentiment analysis powered by live data sources."
            />
            <FeatureCard 
                icon={<Bot className="w-6 h-6 text-purple-400" />}
                title="Vision Agent"
                desc="Upload or capture chart screenshots. The AI identifies patterns and support/resistance lines."
            />
             <FeatureCard 
                icon={<Zap className="w-6 h-6 text-orange-400" />}
                title="Web3 Actions"
                desc="Draft transactions via chat. Send tokens and swap assets on EVM chains seamlessly."
            />
             <FeatureCard 
                icon={<Shield className="w-6 h-6 text-green-400" />}
                title="Portfolio Health"
                desc="Connect your wallet for instant risk assessment and rebalancing suggestions."
            />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-24 relative">
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

      {/* Bottom CTA */}
      <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
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

      {/* Footer - Transparent bg to blend with seamless theme */}
      <footer className="py-12 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-gray-300">CryptoInsight AI</span>
            </div>
            <div className="text-gray-500 text-sm">
                &copy; 2024 CryptoInsight AI. Powered by Google Gemini.
            </div>
            <div className="flex gap-6 text-gray-500">
                <Globe className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
                <Terminal className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-Components ---

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

const CheckItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
        <span className="text-gray-300">{text}</span>
    </div>
);

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

export default LandingPage;
