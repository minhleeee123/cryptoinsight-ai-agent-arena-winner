
import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import CryptoDashboard from '../CryptoDashboard';
import TransactionCard from '../TransactionCard';
import PortfolioAnalysisCard from '../PortfolioAnalysisCard';
import { FormattedMessage } from '../ui/MarkdownRenderer';

interface MessageItemProps {
  msg: ChatMessage;
  theme?: 'light' | 'dark';
}

const MessageItem: React.FC<MessageItemProps> = ({ msg, theme = 'dark' }) => {
  return (
    <div className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
      
      {/* Avatar */}
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'model' ? 'bg-transparent' : 'bg-transparent'}`}>
         {msg.role === 'model' ? (
           <div className="relative">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
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
              ? 'bg-gray-100 text-gray-900 dark:bg-[#2d2e2f] dark:text-white rounded-tr-none whitespace-pre-wrap' 
              : 'text-gray-800 dark:text-gray-100 w-full'
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
            <CryptoDashboard data={msg.data} theme={theme} />
          </div>
        )}

        {/* Web3 Transaction Card */}
        {msg.transactionData && (
            <div className="w-full mt-2">
                <TransactionCard data={msg.transactionData} />
            </div>
        )}

        {/* Portfolio Analysis Card */}
        {msg.portfolioAnalysis && (
            <div className="w-full mt-2">
                <PortfolioAnalysisCard data={msg.portfolioAnalysis} />
            </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
