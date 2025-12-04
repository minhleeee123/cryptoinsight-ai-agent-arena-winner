
import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, X, Send, Camera, Bot, Loader2 } from 'lucide-react';
import { analyzeChartImage } from '../../services/backendClient';
import { FormattedMessage } from '../ui/MarkdownRenderer';
interface PriceChartProps {
  symbol: string; // e.g. "BTC", "SOL"
  coinName: string; // e.g. "Bitcoin", "Solana"
  currentPrice: number; // e.g. 93358.15
  theme?: 'light' | 'dark';
}

interface ChartChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isAnalysis?: boolean;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol, coinName, currentPrice, theme = 'dark' }) => {
  const containerId = useRef(`tv-widget-${Math.random().toString(36).substring(7)}`);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Chat State inside Modal
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChartChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper to get formatted symbol (e.g. BINANCE:BTCUSDT)
  const getTVSymbol = (sym: string) => {
    return `BINANCE:${sym.toUpperCase()}USDT`;
  };

  const loadWidget = (containerId: string, isFull: boolean) => {
    if (document.getElementById(containerId) && window.TradingView) {
      new window.TradingView.widget({
        "autosize": true,
        "symbol": getTVSymbol(symbol),
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": theme, // Dynamic theme
        "style": "1", // Candle
        "locale": "en",
        "enable_publishing": false,
        "backgroundColor": theme === 'dark' ? "rgba(19, 19, 20, 1)" : "rgba(255, 255, 255, 1)",
        "gridColor": theme === 'dark' ? "rgba(50, 50, 50, 0.5)" : "rgba(230, 230, 230, 1)",
        "hide_top_toolbar": !isFull,
        "hide_legend": !isFull,
        "save_image": false,
        "container_id": containerId,
        "toolbar_bg": theme === 'dark' ? "#1e1f20" : "#f3f4f6",
        "withdateranges": isFull,
        "hide_side_toolbar": !isFull,
        "allow_symbol_change": isFull,
      });
    }
  };

  // Re-run widget when symbol or theme changes
  useEffect(() => {
    if (window.TradingView) {
         loadWidget(containerId.current, false);
    } else {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => loadWidget(containerId.current, false);
        document.head.appendChild(script);
    }
  }, [symbol, theme]);

  // Effect for the modal chart
  useEffect(() => {
    if (isModalOpen && window.TradingView) {
        setChatMessages([{
            id: 'init',
            role: 'model',
            text: 'I am here to help. Draw your support/resistance lines on the chart, then click "Analyze Chart" to let me see what you see!'
        }]);
        
        // Wait a tick for the modal DOM to exist
        setTimeout(() => {
            loadWidget("tv-modal-container", true);
        }, 100);
    }
  }, [isModalOpen, symbol, theme]);

  const captureAndAnalyze = async () => {
    try {
        setIsAnalyzing(true);
        
        // 1. Request Screen Share
        // "browser" hint prefers the current tab in some browsers
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { 
                displaySurface: "browser",
            } as any, 
            audio: false
        });

        // 2. Create hidden video to play stream
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        // Wait for video to load and play
        await new Promise<void>((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Vital: Wait a moment for the frame to actually render data
                setTimeout(resolve, 500); 
            };
        });

        // 3. Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error("Canvas context failed");
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/png');

        // 4. Clean up: Stop all tracks immediately to "Close" the sharing indicator
        stream.getTracks().forEach(track => track.stop());

        // 5. Send to Gemini
        const userMsgId = Date.now().toString();
        setChatMessages(prev => [...prev, { id: userMsgId, role: 'user', text: "Analyze the chart lines I just drew." }]);
        
        const modelMsgId = (Date.now() + 1).toString();
        // Call non-streaming service with coin context
        const analysisText = await analyzeChartImage(
          base64Image, 
          `Analyze this ${coinName} chart at current price $${currentPrice.toLocaleString()}. Focus on the drawn lines and patterns, support/resistance levels, and provide a trading setup recommendation.`
        );

        // Update with full response
        setChatMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: analysisText, isAnalysis: true }]);

    } catch (error: any) {
        console.error("Capture failed:", error);
        // If user cancelled, don't spam chat
        if (error.name !== 'NotAllowedError') {
             setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I couldn't capture the screen. Please make sure to select the 'Current Tab' or 'Entire Screen' when prompted." }]);
        }
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
     if (!chatInput.trim()) return;
     const userText = chatInput;
     setChatInput('');
     setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
     
     // Simple chat fallback if not analyzing image
     setTimeout(() => {
         setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "That's an interesting observation. If you want me to look at specific levels, draw them and click 'Analyze Chart View' button." }]);
     }, 1000);
  };

  return (
    <>
        {/* Main Dashboard Widget */}
        <div className="w-full h-[250px] bg-white dark:bg-[#1e1f20] rounded-xl p-1 border border-gray-200 dark:border-white/10 relative group overflow-hidden shadow-sm">
            <div id={containerId.current} className="w-full h-full rounded-lg" />
            
            {/* Overlay to intercept clicks */}
            <div 
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 bg-black/0 hover:bg-black/5 dark:hover:bg-black/10 transition-colors cursor-pointer z-10 flex items-center justify-center group"
                title="Click to open advanced chart"
            >
                <div className="bg-white/80 dark:bg-black/50 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100 backdrop-blur-sm shadow-lg">
                    <Maximize2 className="w-5 h-5 text-gray-800 dark:text-white" />
                </div>
            </div>
            
            <h3 className="absolute top-2 left-3 text-xs font-bold text-gray-400 dark:text-gray-500 pointer-events-none z-20 opacity-50">
                TradingView
            </h3>
        </div>

        {/* Full Screen Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                <div className="bg-gray-50 dark:bg-[#131314] w-full max-w-[95vw] h-[90vh] rounded-2xl border border-gray-200 dark:border-white/10 relative flex flex-col shadow-2xl overflow-hidden">
                    
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1f20] shrink-0">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                             </div>
                             <div>
                                <h2 className="text-gray-900 dark:text-white font-bold text-lg">{symbol} Technical Analysis</h2>
                                <span className="text-gray-500 text-xs">Draw on the chart & ask AI</span>
                             </div>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Modal Body - Split Layout */}
                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* LEFT: TradingView Chart (75%) */}
                        <div className="w-3/4 h-full border-r border-gray-200 dark:border-white/10 bg-white dark:bg-black relative">
                            <div id="tv-modal-container" className="w-full h-full" />
                            
                            {/* Analyze Button Overlay */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                                <button 
                                    onClick={captureAndAnalyze}
                                    disabled={isAnalyzing}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-medium"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Screen...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="w-5 h-5" /> Analyze Screen
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Chat Interface (25%) */}
                        <div className="w-1/4 h-full bg-gray-50 dark:bg-[#1e1f20] flex flex-col">
                             {/* Chat List */}
                             <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {chatMessages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-blue-600 text-white rounded-br-none whitespace-pre-wrap' 
                                                : 'bg-white dark:bg-[#2d2e2f] text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-white/5 shadow-sm'
                                        }`}>
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <FormattedMessage text={msg.text} />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500 mt-1">
                                            {msg.role === 'user' ? 'You' : 'Analyst Agent'}
                                        </span>
                                    </div>
                                ))}
                                {isAnalyzing && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-[#2d2e2f] px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2 border border-gray-200 dark:border-white/5 shadow-sm">
                                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Capturing & Analyzing...</span>
                                        </div>
                                    </div>
                                )}
                             </div>

                             {/* Input Area */}
                             <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1e1f20]">
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-black/30 p-2 rounded-xl border border-gray-200 dark:border-white/5 focus-within:border-blue-500/50 transition-colors">
                                    <input 
                                        type="text" 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Ask about levels..."
                                        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 outline-none"
                                    />
                                    <button 
                                        onClick={handleSendMessage}
                                        className="p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                        </div>

                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default PriceChart;
