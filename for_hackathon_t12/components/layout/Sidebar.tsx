
import React from 'react';
import { Menu, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  activeSessionId: string;
  currentView: 'chat' | 'profile';
  onNewChat: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  sessions,
  activeSessionId,
  currentView,
  onNewChat,
  onLoadSession,
  onDeleteSession
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col h-full bg-gray-50 dark:bg-[#1e1f20] shrink-0 border-r border-gray-200 dark:border-white/5 
          transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'translate-x-0 w-[280px]' 
            : '-translate-x-full md:translate-x-0 md:w-[72px]'
          }
        `}
      >
        {/* Menu Toggle */}
        <div 
          className={`flex items-center ${isOpen ? 'justify-start px-4 gap-4' : 'justify-center'} h-16 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors group whitespace-nowrap`}
          onClick={toggleSidebar}
          title={isOpen ? "Collapse menu" : "Expand menu"}
        >
          <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors shrink-0" />
          <span className={`font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Menu
          </span>
        </div>
        
        {/* New Chat Button */}
        <div className={`px-3 mb-6 mt-2 ${!isOpen && 'flex justify-center'}`}>
           <button 
             onClick={onNewChat}
             className={`
                flex items-center gap-3 bg-white dark:bg-[#2d2e2f] hover:bg-gray-100 dark:hover:bg-[#37393b] text-gray-700 dark:text-gray-200 rounded-full transition-all shadow-md hover:shadow-lg border border-gray-200 dark:border-white/5 whitespace-nowrap overflow-hidden
                ${isOpen ? 'px-4 py-3 w-fit' : 'w-10 h-10 justify-center p-0'}
             `}
             title="New Chat"
           >
              <Plus className="w-5 h-5 shrink-0" />
              <span className={`text-sm font-medium transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
                 New Chat
              </span>
           </button>
        </div>

        {/* Recent List */}
        <div className={`flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-2 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden pointer-events-none'}`}>
          <div className="px-4 text-xs font-medium text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wider whitespace-nowrap">Recent</div>
          
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => onLoadSession(session.id)}
              className={`group flex items-center justify-between px-3 py-2 mx-2 text-sm rounded-lg cursor-pointer transition-all ${
                activeSessionId === session.id && currentView === 'chat'
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-100' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id && currentView === 'chat' ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className="truncate">{session.title}</span>
              </div>
              
              <button 
                onClick={(e) => onDeleteSession(e, session.id)}
                className={`p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ${
                    activeSessionId === session.id ? 'opacity-100' : ''
                }`}
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Status */}
        <div className={`mt-auto px-4 py-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
