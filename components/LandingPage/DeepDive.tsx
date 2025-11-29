import React from 'react';
import { CheckCircle2, Activity, Wallet, ScanLine, Maximize, Bot, ArrowRight } from 'lucide-react';

const CheckItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
        <span className="text-gray-300">{text}</span>
    </div>
);

const DeepDive: React.FC = () => {
  return (
    <section className="py-24 relative z-10">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/10 to-transparent hidden md:block" />

        <div className="max-w-7xl mx-auto px-6 space-y-32">
            
            {/* 1. Deep Data (Cyan) */}
            <div className="flex flex-col md:flex-row items-center gap-12 relative">
                <div className="flex-1 space-y-6 md:text-right md:pr-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase md:ml-auto">
                        Deep Data
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">Institutional-Grade Analysis</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Go deeper than just price. Our agents aggregate sentiment scores, Long/Short ratios, and on-chain metrics to generate comprehensive reports for any coin.
                    </p>
                    <ul className="space-y-3 pt-4 flex flex-col md:items-end">
                        <CheckItem text="Fear & Greed Index Integration" />
                        <CheckItem text="Exchange Long/Short Ratios" />
                        <CheckItem text="Project Scoring Radar" />
                    </ul>
                </div>

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050505] border-2 border-cyan-500 z-20 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />

                <div className="flex-1 w-full relative group md:pl-12">
                    <div className="absolute inset-0 bg-cyan-600/20 blur-[80px] rounded-full group-hover:bg-cyan-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-4 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto md:ml-0">
                        <div className="grid grid-cols-2 gap-4 text-left">
                             <div className="col-span-1 bg-[#0a0a0a] rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center gap-2">
                                <span className="text-[10px] text-gray-500 uppercase">Sentiment</span>
                                <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-cyan-400 border-r-cyan-400 rotate-45 flex items-center justify-center">
                                    <span className="text-lg font-bold text-white -rotate-45">72</span>
                                </div>
                                <span className="text-xs text-cyan-400">Greed</span>
                             </div>
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

            {/* 2. Portfolio Guard (Green) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 relative">
                <div className="flex-1 space-y-6 md:pl-12">
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

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050505] border-2 border-green-500 z-20 shadow-[0_0_20px_rgba(34,197,94,0.5)]" />

                <div className="flex-1 w-full relative group md:text-right md:pr-12">
                    <div className="absolute inset-0 bg-green-600/20 blur-[80px] rounded-full group-hover:bg-green-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-6 shadow-2xl -rotate-2 hover:rotate-0 transition-transform duration-500 max-w-sm mx-auto md:mr-0">
                        <div className="space-y-6 text-left">
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
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Bitcoin</span>
                                        <span className="text-white font-medium">$28,000</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[65%] bg-green-500 rounded-full"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-300">Ethereum</span>
                                        <span className="text-white font-medium">$12,400</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full w-[30%] bg-blue-500 rounded-full"></div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Multimodal AI (Purple) */}
            <div className="flex flex-col md:flex-row items-center gap-12 relative">
                <div className="flex-1 space-y-6 md:text-right md:pr-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase md:ml-auto">
                        Multimodal AI
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold">See the Market like a Pro</h2>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Don't just look at numbers. Upload screenshots of charts, and our Vision Agent will identify support/resistance lines, candlestick patterns, and potential breakout zones automatically.
                    </p>
                    <ul className="space-y-3 pt-4 flex flex-col md:items-end">
                        <CheckItem text="Pattern Recognition (Head & Shoulders, Flags)" />
                        <CheckItem text="Auto-Support/Resistance Levels" />
                        <CheckItem text="Actionable Trading Setups" />
                    </ul>
                </div>
                
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050505] border-2 border-purple-500 z-20 shadow-[0_0_20px_rgba(168,85,247,0.5)]" />

                <div className="flex-1 w-full relative group md:pl-12">
                    <div className="absolute inset-0 bg-purple-600/20 blur-[80px] rounded-full group-hover:bg-purple-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                        <div className="aspect-[4/3] bg-[#0d0e10] rounded-lg overflow-hidden relative flex flex-col border border-white/5">
                            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#0d0e10]/80 backdrop-blur-sm z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <div className="flex flex-col">
                                         <span className="text-xs font-bold text-gray-200">BTC/USDT</span>
                                         <span className="text-[9px] text-gray-500 font-mono">BINANCE</span>
                                    </div>
                                    <div className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-400">1H</div>
                                </div>
                                <div className="flex gap-3">
                                    <ScanLine className="w-3.5 h-3.5 text-purple-400" />
                                    <Maximize className="w-3.5 h-3.5 text-gray-500" />
                                </div>
                            </div>

                            <div className="flex-1 relative w-full h-full overflow-hidden px-4 pt-4 pb-12">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50" preserveAspectRatio="none">
                                    <path d="M0 250 C 50 240, 100 220, 150 200 C 200 180, 250 160, 300 170 C 350 180, 400 200, 450 150 C 500 100, 550 50, 600 40" stroke="#3b82f6" strokeWidth="2" fill="none" />
                                    <path d="M0 220 C 60 200, 120 180, 180 150 C 240 120, 300 140, 360 120 C 420 100, 480 80, 600 20" stroke="#eab308" strokeWidth="2" fill="none" />
                                </svg>

                                <div className="flex items-end justify-between h-full w-full relative z-10 px-2">
                                    <div className="flex flex-col items-center w-3 h-[40%] mb-12 relative">
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[60%] bg-green-500 absolute bottom-[20%] rounded-[1px]"></div>
                                    </div>
                                    
                                    <div className="flex flex-col items-center w-3 h-[35%] mb-16 relative">
                                        <div className="w-[1px] h-full bg-red-500/50"></div>
                                        <div className="w-full h-[40%] bg-red-500 absolute bottom-[30%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[50%] mb-10 relative">
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[70%] bg-green-500 absolute bottom-[15%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[60%] mb-14 relative">
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[80%] bg-green-500 absolute bottom-[10%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[30%] mb-24 relative">
                                        <div className="w-[1px] h-full bg-red-500/50"></div>
                                        <div className="w-full h-[50%] bg-red-500 absolute bottom-[25%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[45%] mb-20 relative">
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[60%] bg-green-500 absolute bottom-[20%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[75%] mb-8 relative group">
                                         <div className="absolute -top-4 text-[9px] text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">Vol</div>
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[85%] bg-green-500 absolute bottom-[5%] rounded-[1px] shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[20%] mb-[160px] relative">
                                        <div className="w-[1px] h-full bg-red-500/50"></div>
                                        <div className="w-full h-[60%] bg-red-500 absolute bottom-[20%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[18%] mb-[155px] relative">
                                        <div className="w-[1px] h-full bg-red-500/50"></div>
                                        <div className="w-full h-[50%] bg-red-500 absolute bottom-[25%] rounded-[1px]"></div>
                                    </div>

                                    <div className="flex flex-col items-center w-3 h-[50%] mb-[140px] relative">
                                        <div className="w-[1px] h-full bg-green-500/50"></div>
                                        <div className="w-full h-[80%] bg-green-500 absolute bottom-[10%] rounded-[1px] shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
                                            TP: $69k
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-[25%] right-[10%] w-[25%] h-[1px] bg-purple-500 border-t border-dashed border-purple-400 rotate-[5deg] origin-left shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                                    <span className="absolute top-[21%] right-[12%] text-[9px] text-purple-300 font-mono bg-[#0d0e10] px-1">Resistance</span>

                                    <div className="absolute top-[35%] right-[10%] w-[25%] h-[1px] bg-purple-500 border-t border-dashed border-purple-400 rotate-[5deg] origin-left shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                                    <span className="absolute top-[40%] right-[25%] text-[9px] text-purple-300 font-mono bg-[#0d0e10] px-1">Support</span>
                                </div>
                            </div>
                            
                             <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-purple-500/10 to-transparent h-[10%] w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none border-b border-purple-500/30"></div>

                            <div className="absolute bottom-4 left-4 right-4 bg-[#131314]/95 backdrop-blur-md border border-purple-500/30 p-2.5 rounded-lg flex items-center gap-3 shadow-2xl z-20">
                                <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-xs font-bold text-white truncate">Bull Flag Breakout</span>
                                        <span className="text-[10px] text-green-400 font-mono bg-green-900/30 px-1 rounded ml-2">85%</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 truncate">Entry: $67,200 • Stop: $66,800</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Web3 Native (Orange) */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 relative">
                <div className="flex-1 space-y-6 md:pl-12">
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

                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050505] border-2 border-orange-500 z-20 shadow-[0_0_20px_rgba(249,115,22,0.5)]" />

                <div className="flex-1 w-full relative group md:text-right md:pr-12">
                     <div className="absolute inset-0 bg-orange-600/20 blur-[80px] rounded-full group-hover:bg-orange-600/30 transition-all duration-700" />
                    <div className="relative bg-[#131314] rounded-2xl border border-white/10 p-6 shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500 max-w-md mx-auto md:mr-0">
                        <div className="space-y-4 text-left">
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

        </div>
    </section>
  );
};
export default DeepDive;