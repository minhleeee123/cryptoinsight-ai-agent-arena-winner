
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Sparkles, Menu, Plus, Activity, MessageSquare, Trash2, Wallet, TrendingUp, TrendingDown, ArrowLeft, Shield, Mail, PieChart, RefreshCw, Link2, X, Compass, Lightbulb, ArrowRightLeft, Search, ArrowUpRight } from 'lucide-react';
import { ChatMessage, CryptoData, ChatSession, PortfolioItem, TransactionData } from './types';
import { analyzeCoin, generateMarketReport, determineIntent, chatWithModel, analyzePortfolio, updatePortfolioRealTime, createTransactionPreview } from './services/geminiService';
import { connectToMetaMask, formatAddress } from './services/web3Service';
import CryptoDashboard from './components/CryptoDashboard';
import TransactionCard from './components/TransactionCard';

// --- Types & Mock Data for Profile ---

const INITIAL_USER_DATA = {
  name: "Crypto Explorer",
  email: "trader@gemini.ai",
  joinDate: "September 2023",
  walletAddress: null as string | null,
  totalBalance: 0, // Calculated dynamically
  portfolio: [
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.45, avgPrice: 45000, currentPrice: 64200 },
    { symbol: 'ETH', name: 'Ethereum', amount: 5.2, avgPrice: 2100, currentPrice: 3450 },
    { symbol: 'SOL', name: 'Solana', amount: 150, avgPrice: 45, currentPrice: 148 },
    { symbol: 'DOT', name: 'Polkadot', amount: 500, avgPrice: 8.5, currentPrice: 7.2 },
  ] as PortfolioItem[]
};

// --- Constants for Suggested Prompts ---

const SUGGESTED_PROMPTS = [
  {
    title: "Market Analysis",
    subtitle: "Deep dive into Bitcoin's chart & sentiment",
    prompt: "Analyze Bitcoin price action and current market sentiment.",
    icon: TrendingUp,
    color: "text-blue-400"
  },
  {
    title: "Portfolio Health",
    subtitle: "Review diversification & risks",
    prompt: "Analyze my portfolio risks and suggest rebalancing.",
    icon: PieChart,
    color: "text-purple-400"
  },
  {
    title: "Transaction Agent",
    subtitle: "Draft a swap or transfer",
    prompt: "Swap 1 ETH for USDT",
    icon: ArrowRightLeft,
    color: "text-orange-400"
  },
  {
    title: "Project Discovery",
    subtitle: "Research a specific token",
    prompt: "How is Solana doing fundamentally?",
    icon: Search,
    color: "text-green-400"
  }
];

// --- Markdown Rendering Components ---

const InlineFormat = ({ text }: { text: string }) => {
  // Simple regex to parse **bold** text
  const parts = text.split(/(\*\*.*?\*\*)/);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-blue-200">{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

const FormattedMessage = ({ text }: { text: string }) => {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        
        // Header 3 (### Title)
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-blue-400 mt-5 mb-2">
              <InlineFormat text={line.replace('### ', '')} />
            </h3>
          );
        }
        
        // Header 2 or 1 treated similarly for safety, though prompt asks for structure
        if (line.startsWith('## ')) {
            return (
              <h2 key={i} className="text-xl font-bold text-blue-300 mt-6 mb-3">
                <InlineFormat text={line.replace('## ', '')} />
              </h2>
            );
        }

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-3 ml-1 mb-1">
              <span className="text-blue-400/80 mt-1.5 text-[10px] font-bold">●</span>
              <p className="text-gray-200 leading-relaxed">
                <InlineFormat text={trimmed.replace(/^[-*] /, '')} />
              </p>
            </div>
          );
        }

        // Empty lines for spacing
        if (!trimmed) {
          return <div key={i} className="h-3" />;
        }

        // Standard Paragraph
        return (
          <p key={i} className="text-gray-200 leading-relaxed mb-1">
            <InlineFormat text={line} />
          </p>
        );
      })}
    </div>
  );
};

// --- Profile View Component ---

interface ProfileProps {
    user: typeof INITIAL_USER_DATA;
    onBack: () => void;
    onRefreshPrices: () => Promise<void>;
    onConnectWallet: () => Promise<void>;
    onDisconnectWallet: () => void;
    isRefreshing: boolean;
}

const ProfileView: React.FC<ProfileProps> = ({ user, onBack, onRefreshPrices, onConnectWallet, onDisconnectWallet, isRefreshing }) => {
  
  // Auto refresh when mounting profile view
  useEffect(() => {
    onRefreshPrices();
  }, []);

  // Calculate current total balance based on real-time prices
  const currentTotalBalance = user.portfolio.reduce((sum, item) => sum + (item.amount * item.currentPrice), 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header / Back Button */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
            </div>
            <button 
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                className={`p-2 rounded-full transition-all ${isRefreshing ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10 text-gray-400'}`}
                title="Refresh Prices"
            >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>

        {/* User Info Card */}
        <div className="bg-[#1e1f20] rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg relative">
             <User className="w-10 h-10 text-white" />
             {user.walletAddress && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-[#1e1f20]" title="Wallet Connected">
                    <Link2 className="w-3 h-3 text-white" />
                </div>
             )}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                {user.walletAddress ? (
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20 font-mono flex items-center gap-2 mx-auto md:mx-0">
                        {formatAddress(user.walletAddress)}
                        <button 
                            onClick={onDisconnectWallet}
                            className="hover:text-white hover:bg-green-500/20 rounded-full p-0.5 transition-colors"
                            title="Disconnect Wallet"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ) : (
                    <button 
                        onClick={onConnectWallet}
                        className="px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/20 transition-colors flex items-center gap-1 mx-auto md:mx-0"
                    >
                        <Wallet className="w-3 h-3" /> Connect MetaMask
                    </button>
                )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
               <Mail className="w-4 h-4" />
               <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-sm">
               <Shield className="w-4 h-4" />
               <span>Member since {user.joinDate}</span>
            </div>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 text-center md:text-right min-w-[200px]">
             <span className="text-sm text-blue-300 font-medium block mb-1">Total Estimated Balance</span>
             <span className="text-3xl font-bold text-white">
                {isRefreshing ? 'Updating...' : `$${currentTotalBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
             </span>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-[#1e1f20] rounded-2xl border border-white/10 overflow-hidden">
           <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Current Holdings</h3>
              </div>
              {user.walletAddress && <span className="text-xs text-gray-500">Includes Web3 Wallet</span>}
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                   <th className="p-4 font-medium">Asset</th>
                   <th className="p-4 font-medium text-right">Balance</th>
                   <th className="p-4 font-medium text-right">Current Price</th>
                   <th className="p-4 font-medium text-right">Value</th>
                   <th className="p-4 font-medium text-right">PNL</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {user.portfolio.map((coin, idx) => {
                   const value = coin.amount * coin.currentPrice;
                   const pnlPercent = coin.avgPrice > 0 ? ((coin.currentPrice - coin.avgPrice) / coin.avgPrice) * 100 : 0;
                   const isProfit = pnlPercent >= 0;
                   const isWeb3 = coin.name.includes("(Wallet)");

                   return (
                     <tr key={idx} className={`hover:bg-white/5 transition-colors ${isWeb3 ? 'bg-orange-500/5' : ''}`}>
                       <td className="p-4">
                         <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${isWeb3 ? 'bg-orange-600' : 'bg-gray-700'}`}>
                             {coin.symbol[0]}
                           </div>
                           <div>
                             <div className="font-medium text-white flex items-center gap-1">
                                {coin.name}
                                {isWeb3 && <Link2 className="w-3 h-3 text-orange-400" />}
                             </div>
                             <div className="text-xs text-gray-500">{coin.symbol}</div>
                           </div>
                         </div>
                       </td>
                       <td className="p-4 text-right text-gray-300">
                         {coin.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {coin.symbol}
                       </td>
                       <td className="p-4 text-right text-gray-300">
                         ${coin.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </td>
                       <td className="p-4 text-right font-medium text-white">
                         ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                       </td>
                       <td className="p-4 text-right">
                         {coin.avgPrice > 0 ? (
                             <div className={`flex items-center justify-end gap-1 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                <span className="font-medium">{Math.abs(pnlPercent).toFixed(2)}%</span>
                             </div>
                         ) : (
                             <span className="text-gray-500 text-xs">N/A</span>
                         )}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}

// --- Main App Component ---

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'profile'>('chat');
  
  // User State with Real data capabilities
  const [userProfile, setUserProfile] = useState(INITIAL_USER_DATA);
  const [isRefreshingPortfolio, setIsRefreshingPortfolio] = useState(false);

  // Initialize with one default session
  const initialSessionId = 'init-session';
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: initialSessionId,
      title: 'New Chat',
      date: Date.now(),
      messages: [
        { 
          id: 'welcome', 
          role: 'model', 
          text: 'Hello! I am CryptoInsight AI. I can analyze markets, check your portfolio health, or even help draft web3 transactions. How can I help you today?' 
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  
  // Messages state acts as the view for the active session
  const [messages, setMessages] = useState<ChatMessage[]>(sessions[0].messages);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>(''); // 'fetching-data' | 'analyzing' | 'thinking' | 'analyzing-portfolio' | 'creating-transaction' | ''
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync messages to the active session whenever they change
  useEffect(() => {
    setSessions(prevSessions => {
      return prevSessions.map(session => {
        if (session.id === activeSessionId) {
          // If it's the default "New Chat" title, try to name it after the first user message
          let newTitle = session.title;
          if (session.title === 'New Chat') {
            const firstUserMsg = messages.find(m => m.role === 'user');
            if (firstUserMsg && firstUserMsg.text) {
              newTitle = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
            }
          }
          return { ...session, messages: messages, title: newTitle };
        }
        return session;
      });
    });
  }, [messages, activeSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, loadingStatus]);

  const handleRefreshPortfolio = async () => {
    setIsRefreshingPortfolio(true);
    try {
        const updatedPortfolio = await updatePortfolioRealTime(userProfile.portfolio);
        setUserProfile(prev => ({
            ...prev,
            portfolio: updatedPortfolio
        }));
    } catch (e) {
        console.error("Failed to refresh portfolio", e);
    } finally {
        setIsRefreshingPortfolio(false);
    }
  };

  const handleConnectWallet = async () => {
    const walletData = await connectToMetaMask();
    if (walletData) {
        // 1. Update user profile with address
        // 2. Add/Update the ETH holdings in the portfolio
        
        setUserProfile(prev => {
            // Remove existing wallet ETH entry if exists to avoid dupes
            const cleanPortfolio = prev.portfolio.filter(p => !p.name.includes("(Wallet)"));
            
            // Assuming current ETH price is needed. For now, we use a placeholder or find existing ETH price
            const existingEth = prev.portfolio.find(p => p.symbol === 'ETH');
            const currentEthPrice = existingEth ? existingEth.currentPrice : 3000;

            const newWalletItem: PortfolioItem = {
                symbol: 'ETH',
                name: 'Ethereum (Wallet)',
                amount: parseFloat(walletData.balance),
                avgPrice: 0, // External wallet, unknown buy price
                currentPrice: currentEthPrice
            };

            return {
                ...prev,
                walletAddress: walletData.address,
                portfolio: [newWalletItem, ...cleanPortfolio]
            };
        });
    }
  };

  const handleDisconnectWallet = () => {
    setUserProfile(prev => ({
      ...prev,
      walletAddress: null,
      // Remove the entry that was added by the wallet connection
      portfolio: prev.portfolio.filter(p => !p.name.includes("(Wallet)"))
    }));
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      date: Date.now(),
      messages: [{
        id: 'welcome',
        role: 'model',
        text: 'Ready for a new analysis. Which coin shall we look at?'
      }]
    };
    
    // Add new session to history, make it active, and update view
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setIsLoading(false);
    setCurrentView('chat'); // Ensure we switch to chat view
    
    // On mobile, close sidebar when starting new chat
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setIsLoading(false); // Reset loading state when switching
      setCurrentView('chat'); // Ensure we switch to chat view
      
      // Close sidebar on mobile when a chat is selected
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent triggering loadSession
    
    const newSessions = sessions.filter(s => s.id !== sessionId);
    
    // If we deleted the active session
    if (sessionId === activeSessionId) {
       if (newSessions.length > 0) {
         // Switch to the first available session
         setActiveSessionId(newSessions[0].id);
         setMessages(newSessions[0].messages);
       } else {
         // If all deleted, create a fresh one
         handleNewChat();
         return; 
       }
    }
    
    setSessions(newSessions);
  };

  // Helper to get the most recent valid CryptoData from history
  const getLastCryptoData = (msgs: ChatMessage[]): CryptoData | undefined => {
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].data) return msgs[i].data;
    }
    return undefined;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus('thinking');

    try {
      // Step 1: Determine User Intent
      const intent = await determineIntent(currentInput);
      
      if (intent.type === 'ANALYZE' && intent.coinName) {
        // --- FLOW 1: New Coin Analysis ---
        setLoadingStatus('fetching-data');
        
        const coinName = intent.coinName; 
        const data: CryptoData = await analyzeCoin(coinName);

        const chartMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          data: data
        };
        // Show charts immediately
        setMessages(prev => [...prev, chartMsg]);

        // Trigger Analysis Agent
        setLoadingStatus('analyzing');
        
        // Setup empty message placeholder
        const reportMsgId = (Date.now() + 2).toString();
        // setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: '' }]); // Removed for non-streaming: we just wait now
        
        // Get full text
        const reportText = await generateMarketReport(data);
        
        // Clear specific loading status
        setLoadingStatus('');

        setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: reportText }]);

      } else if (intent.type === 'PORTFOLIO_ANALYSIS') {
        // --- FLOW 2: Portfolio Analysis ---
        setLoadingStatus('analyzing-portfolio');

        // Get full text
        const reportText = await analyzePortfolio(userProfile.portfolio);
        
        // Clear specific loading status
        setLoadingStatus('');

        const reportMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: reportText }]);

      } else if (intent.type === 'TRANSACTION') {
        // --- FLOW 3: Transaction Agent ---
        setLoadingStatus('creating-transaction');

        const txData: TransactionData = await createTransactionPreview(currentInput);
        
        const txMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            transactionData: txData,
            text: `I've prepared the transaction for you. Please review the details below.`
        };
        setMessages(prev => [...prev, txMsg]);

      } else {
        // --- FLOW 4: Contextual Chat ---
        setLoadingStatus('thinking');
        
        // Find context from previous messages
        const contextData = getLastCryptoData(messages);
        
        // Send to chat model with context
        const responseText = await chatWithModel(currentInput, messages, contextData);
        
        const textMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText
        };
        setMessages(prev => [...prev, textMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error processing your request. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full bg-gemini-bg text-gemini-text overflow-hidden font-sans selection:bg-blue-500/30 relative">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col h-full bg-[#1e1f20] shrink-0 border-r border-white/5 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'translate-x-0 w-[280px]' 
            : '-translate-x-full md:translate-x-0 md:w-[72px]'
          }
        `}
      >
        {/* Menu Toggle (The 3 lines) - Always visible in Sidebar */}
        <div 
          className={`flex items-center ${isSidebarOpen ? 'justify-start px-4 gap-4' : 'justify-center'} h-16 cursor-pointer hover:bg-white/5 transition-colors group whitespace-nowrap`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Collapse menu" : "Expand menu"}
        >
          <Menu className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors shrink-0" />
          <span className={`font-medium text-gray-300 group-hover:text-white transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Menu
          </span>
        </div>
        
        {/* New Chat Button - Adapts to width */}
        <div className={`px-3 mb-6 mt-2 ${!isSidebarOpen && 'flex justify-center'}`}>
           <button 
             onClick={handleNewChat}
             className={`
                flex items-center gap-3 bg-[#2d2e2f] hover:bg-[#37393b] text-gray-200 rounded-full transition-all shadow-lg hover:shadow-xl border border-white/5 whitespace-nowrap overflow-hidden
                ${isSidebarOpen ? 'px-4 py-3 w-fit' : 'w-10 h-10 justify-center p-0'}
             `}
             title="New Chat"
           >
              <Plus className="w-5 h-5 shrink-0" />
              <span className={`text-sm font-medium transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                 New Chat
              </span>
           </button>
        </div>

        {/* Recent List - Hidden when collapsed */}
        <div className={`flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden pointer-events-none'}`}>
          <div className="px-4 text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider whitespace-nowrap">Recent</div>
          
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`group flex items-center justify-between px-3 py-2 mx-2 text-sm rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id && currentView === 'chat'
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id && currentView === 'chat' ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className="truncate">{session.title}</span>
              </div>
              
              <button 
                onClick={(e) => deleteSession(e, session.id)}
                className={`p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ${
                    activeSessionId === session.id ? 'opacity-100' : ''
                }`}
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Status - Hidden when collapsed */}
        <div className={`mt-auto px-4 py-4 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-full max-w-5xl mx-auto w-full min-w-0">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-10 bg-gemini-bg/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
             {/* Mobile Toggle Button - ONLY visible on mobile now */}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors md:hidden"
                title="Open Menu"
             >
               <Menu className="w-5 h-5" />
             </button>
             <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-200">Gemini Crypto</span>
                <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-md border border-blue-800/50 hidden sm:inline-block">2.5 Flash</span>
             </div>
          </div>
          
          {/* User Profile Button - Clickable to toggle view */}
          <div 
             className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${currentView === 'profile' ? 'ring-2 ring-blue-500' : ''}`}
             onClick={() => setCurrentView('profile')}
             title="View Profile"
          >
             <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center relative">
                <User className="w-5 h-5 text-white" />
                {userProfile.walletAddress && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#131314]"></div>
                )}
             </div>
          </div>
        </div>

        {/* CONTENT SWITCHER: Chat vs Profile */}
        
        {currentView === 'profile' ? (
           <ProfileView 
              user={userProfile} 
              onBack={() => setCurrentView('chat')} 
              onRefreshPrices={handleRefreshPortfolio}
              onConnectWallet={handleConnectWallet}
              onDisconnectWallet={handleDisconnectWallet}
              isRefreshing={isRefreshingPortfolio}
           />
        ) : (
          /* Chat View */
          <>
            <div 
              className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
              ref={scrollRef}
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'model' ? 'bg-transparent' : 'bg-transparent'}`}>
                     {msg.role === 'model' ? (
                       <div className="relative">
                          <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                          <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full"></div>
                       </div>
                     ) : (
                       <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                       </div>
                     )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.text && (
                      <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-[#2d2e2f] text-white rounded-tr-none whitespace-pre-wrap' 
                          : 'text-gray-100 w-full'
                      }`}>
                        {msg.role === 'user' ? (
                          msg.text
                        ) : (
                          <FormattedMessage text={msg.text} />
                        )}
                      </div>
                    )}
                    
                    {msg.data && (
                      <div className="w-full mt-2">
                        <CryptoDashboard data={msg.data} />
                      </div>
                    )}

                    {/* Transaction Card */}
                    {msg.transactionData && (
                        <div className="w-full mt-2">
                            <TransactionCard data={msg.transactionData} />
                        </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                   <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                   </div>
                   <div className="flex flex-col gap-2 w-full max-w-md">
                     {loadingStatus === 'fetching-data' && (
                       <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl max-w-fit">
                                 <div className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-blue-200 text-sm font-medium flex items-center gap-2">
                                        Market Data Agent
                                        <Activity className="w-3 h-3 text-blue-400" />
                                    </span>
                                    <span className="text-blue-300/70 text-xs">Gathering live price, tokenomics, and sentiment data...</span>
                                  </div>
                            </div>
                       </div>
                     )}
                     {loadingStatus === 'analyzing' && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl max-w-fit">
                                 <div className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-blue-200 text-sm font-medium flex items-center gap-2">
                                        Analysis Agent Active
                                        <Activity className="w-3 h-3 text-blue-400" />
                                    </span>
                                    <span className="text-blue-300/70 text-xs">Reading chart metrics & generating insights...</span>
                                  </div>
                            </div>
                        </div>
                     )}
                     {loadingStatus === 'analyzing-portfolio' && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl max-w-fit">
                                 <div className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-purple-200 text-sm font-medium flex items-center gap-2">
                                        Portfolio Analyst Agent
                                        <PieChart className="w-3 h-3 text-purple-400" />
                                    </span>
                                    <span className="text-purple-300/70 text-xs">Evaluating holdings, diversification, and PNL...</span>
                                  </div>
                            </div>
                        </div>
                     )}
                     {loadingStatus === 'creating-transaction' && (
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl max-w-fit">
                                 <div className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-orange-200 text-sm font-medium flex items-center gap-2">
                                        Transaction Agent
                                        <Wallet className="w-3 h-3 text-orange-400" />
                                    </span>
                                    <span className="text-orange-300/70 text-xs">Constructing transaction payload...</span>
                                  </div>
                            </div>
                        </div>
                     )}
                     {loadingStatus === 'thinking' && (
                        <div className="px-5 py-3.5 rounded-2xl bg-[#1e1f20] text-gray-400 text-sm animate-pulse">
                            Thinking...
                        </div>
                     )}
                   </div>
                </div>
              )}
              
              {/* Spacer div to prevent input bar from covering the last message */}
              <div className="w-full h-48 shrink-0" />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 pt-10 pb-6 px-4 md:px-8 flex flex-col items-center justify-end pointer-events-none bg-gradient-to-t from-gemini-bg via-gemini-bg to-transparent">
              <div className="w-full max-w-3xl pointer-events-auto flex flex-col gap-3">
                 
                 {/* Suggested Prompts as Vertical List (Only if chat is empty) */}
                 {messages.length === 1 && !isLoading && (
                    <div className="bg-[#1e1f20] border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {SUGGESTED_PROMPTS.map((item, idx) => (
                           <button
                              key={idx}
                              onClick={() => setInput(item.prompt)}
                              className="w-full text-left flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group"
                           >
                              <div className="flex items-center gap-3">
                                 <Search className="w-4 h-4 text-gray-400" />
                                 <span className="text-gray-200 text-sm">{item.prompt}</span>
                              </div>
                              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                           </button>
                        ))}
                    </div>
                 )}

                 {/* Input Box */}
                 <div className="w-full bg-[#1e1f20] rounded-full flex items-center p-2 pl-6 shadow-2xl border border-white/5 ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all">
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about a coin (e.g., Bitcoin) or 'Swap 1 ETH to USDT'..."
                      className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 h-10"
                      disabled={isLoading}
                    />
                    
                    <div className="flex items-center gap-1 px-2">
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                          <Mic className="w-5 h-5" />
                        </button>
                        {input.trim() && (
                          <button 
                            onClick={handleSend}
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white transition-all shadow-lg shadow-blue-900/20"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                 </div>
              </div>
              
              <div className="mt-2 text-[10px] text-gray-600 font-medium text-center w-full pointer-events-none">
                Gemini can make mistakes, including about people, so double-check it.
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default App;
