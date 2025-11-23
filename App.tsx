
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, Sparkles, Menu, Plus, Activity, MessageSquare, Trash2 } from 'lucide-react';
import { ChatMessage, CryptoData, ChatSession } from './types';
import { analyzeCoin, generateMarketReport } from './services/geminiService';
import CryptoDashboard from './components/CryptoDashboard';

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

// --- Main App Component ---

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
          text: 'Hello! I am CryptoInsight AI. Ask me about any coin (e.g., "Analyze Solana") and I will generate comprehensive charts and data for you.' 
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialSessionId);
  
  // Messages state acts as the view for the active session
  const [messages, setMessages] = useState<ChatMessage[]>(sessions[0].messages);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>(''); // 'fetching-data' | 'analyzing' | ''
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus('fetching-data');

    try {
      // Step 1: Fetch the Data (Charts)
      const coinName = input; 
      const data: CryptoData = await analyzeCoin(coinName);

      const chartMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        data: data
      };

      // Show charts immediately
      setMessages(prev => [...prev, chartMsg]);
      
      // Step 2: Trigger the Analysis Agent
      setLoadingStatus('analyzing');
      
      // Small delay to smooth the UX transition
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reportText = await generateMarketReport(data);
      
      const textMsg: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        text: reportText
      };

      setMessages(prev => [...prev, textMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, I encountered an error fetching data for that coin. Please try again."
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
                activeSessionId === session.id 
                  ? 'bg-blue-500/20 text-blue-100' 
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-blue-400' : 'text-gray-500'}`} />
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
          <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Chat History */}
        <div 
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth"
          ref={scrollRef}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'model' ? 'bg-transparent' : 'bg-gray-700'}`}>
                 {msg.role === 'model' ? (
                   <div className="relative">
                      <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                      <div className="absolute inset-0 bg-blue-400/20 blur-lg rounded-full"></div>
                   </div>
                 ) : (
                   <User className="w-5 h-5 text-white" />
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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 animate-fade-in">
               <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
               </div>
               <div className="flex flex-col gap-2 w-full max-w-md">
                 {loadingStatus === 'fetching-data' ? (
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
                 ) : (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Analysis Agent UI */}
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
               </div>
            </div>
          )}
          
          {/* Spacer div to prevent input bar from covering the last message */}
          <div className="w-full h-48 shrink-0" />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gemini-bg via-gemini-bg to-transparent pt-10 pb-6 px-4 md:px-8 flex justify-center">
          <div className="w-full max-w-3xl bg-[#1e1f20] rounded-full flex items-center p-2 pl-6 shadow-2xl border border-white/5 ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all">
             <input 
               type="text" 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={handleKeyDown}
               placeholder="Ask about a coin (e.g., Bitcoin, ETH)..."
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
          
          <div className="absolute bottom-2 text-[10px] text-gray-600 font-medium text-center w-full pointer-events-none">
            Gemini can make mistakes, including about people, so double-check it.
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
