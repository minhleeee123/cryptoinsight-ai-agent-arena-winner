
import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, PieChart, ArrowRightLeft } from 'lucide-react';
import { ChatMessage, CryptoData, ChatSession, PortfolioItem, TransactionData } from './types';
import { analyzeCoin, generateMarketReport, determineIntent, chatWithModel, analyzePortfolio, updatePortfolioRealTime, createTransactionPreview, createBinanceOrderPreview } from './services/geminiService';
import { connectToMetaMask } from './services/web3Service';

// UI Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ProfileView from './components/profile/ProfileView';
import MessageItem from './components/chat/MessageItem';
import InputArea from './components/chat/InputArea';
import LoadingIndicator from './components/ui/LoadingIndicator';

// --- Types & Mock Data for Profile ---

const INITIAL_USER_DATA = {
  name: "Crypto Explorer",
  email: "trader@gemini.ai",
  joinDate: "September 2023",
  walletAddress: null as string | null,
  totalBalance: 0, 
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
  }
];

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
        setUserProfile(prev => {
            const cleanPortfolio = prev.portfolio.filter(p => !p.name.includes("(Wallet)"));
            const existingEth = prev.portfolio.find(p => p.symbol === 'ETH');
            const currentEthPrice = existingEth ? existingEth.currentPrice : 3000;

            const newWalletItem: PortfolioItem = {
                symbol: 'ETH',
                name: 'Ethereum (Wallet)',
                amount: parseFloat(walletData.balance),
                avgPrice: 0,
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
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setMessages(newSession.messages);
    setIsLoading(false);
    setCurrentView('chat');
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
      setIsLoading(false);
      setCurrentView('chat');
      
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    
    const newSessions = sessions.filter(s => s.id !== sessionId);
    if (sessionId === activeSessionId) {
       if (newSessions.length > 0) {
         setActiveSessionId(newSessions[0].id);
         setMessages(newSessions[0].messages);
       } else {
         handleNewChat();
         return; 
       }
    }
    setSessions(newSessions);
  };

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
      const intent = await determineIntent(currentInput);
      
      if (intent.type === 'ANALYZE' && intent.coinName) {
        setLoadingStatus('fetching-data');
        const coinName = intent.coinName; 
        const data: CryptoData = await analyzeCoin(coinName);

        const chartMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          data: data
        };
        setMessages(prev => [...prev, chartMsg]);

        setLoadingStatus('analyzing');
        const reportMsgId = (Date.now() + 2).toString();
        const reportText = await generateMarketReport(data);
        setLoadingStatus('');
        setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: reportText }]);

      } else if (intent.type === 'PORTFOLIO_ANALYSIS') {
        setLoadingStatus('analyzing-portfolio');
        const reportText = await analyzePortfolio(userProfile.portfolio);
        setLoadingStatus('');
        const reportMsgId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: reportMsgId, role: 'model', text: reportText }]);

      } else if (intent.type === 'TRANSACTION') {
        setLoadingStatus('creating-transaction');
        const txData: TransactionData = await createTransactionPreview(currentInput);
        const txMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            transactionData: txData,
            text: `I've prepared the transaction for you. Please review the details below.`
        };
        setMessages(prev => [...prev, txMsg]);

      } else if (intent.type === 'BINANCE_ORDER') {
        setLoadingStatus('creating-transaction');
        const orderData = await createBinanceOrderPreview(currentInput);
        const orderMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            binanceOrder: orderData,
            text: `I've prepared the Binance order for you. Please review the details below.`
        };
        setMessages(prev => [...prev, orderMsg]);

      } else {
        setLoadingStatus('thinking');
        const contextData = getLastCryptoData(messages);
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

  return (
    <div className="flex h-screen w-full bg-[#131314] text-[#e3e3e3] overflow-hidden font-sans selection:bg-blue-500/30 relative">
      
      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        currentView={currentView}
        onNewChat={handleNewChat}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
      />

      <div className="flex-1 flex flex-col relative h-full max-w-5xl mx-auto w-full min-w-0">
        
        <Header 
           toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
           currentView={currentView}
           setCurrentView={setCurrentView}
           userProfile={userProfile}
        />

        {/* CONTENT SWITCHER */}
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
                <MessageItem key={msg.id} msg={msg} />
              ))}

              {isLoading && <LoadingIndicator status={loadingStatus} />}
              
              {/* Spacer div */}
              <div className="w-full h-48 shrink-0" />
            </div>

            <InputArea 
               input={input}
               setInput={setInput}
               handleSend={handleSend}
               isLoading={isLoading}
               showSuggestions={messages.length === 1}
               suggestedPrompts={SUGGESTED_PROMPTS}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default App;
