
import React from 'react';
import { Send, Mic, Search, ArrowUpRight } from 'lucide-react';

interface Suggestion {
    title: string;
    subtitle: string;
    prompt: string;
    icon: any;
    color: string;
}

interface InputAreaProps {
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  showSuggestions: boolean;
  suggestedPrompts: Suggestion[];
}

const InputArea: React.FC<InputAreaProps> = ({ 
  input, 
  setInput, 
  handleSend, 
  isLoading, 
  showSuggestions,
  suggestedPrompts
}) => {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 pt-10 pb-6 px-4 md:px-8 flex flex-col items-center justify-end pointer-events-none bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#131314] dark:via-[#131314] dark:to-transparent transition-colors duration-300">
      <div className="w-full max-w-3xl pointer-events-auto flex flex-col gap-3">
         
         {/* Suggested Prompts as Vertical List */}
         {showSuggestions && !isLoading && (
            <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {suggestedPrompts.map((item, idx) => (
                   <button
                      key={idx}
                      onClick={() => setInput(item.prompt)}
                      className="w-full text-left flex items-center justify-between p-3.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 group"
                   >
                      <div className="flex items-center gap-3">
                         <Search className="w-4 h-4 text-gray-400" />
                         <span className="text-gray-700 dark:text-gray-200 text-sm">{item.prompt}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                   </button>
                ))}
            </div>
         )}

         {/* Input Box */}
         <div className="w-full bg-white dark:bg-[#1e1f20] rounded-full flex items-center p-2 pl-6 shadow-xl border border-gray-200 dark:border-white/5 ring-1 ring-gray-200 dark:ring-white/5 focus-within:ring-blue-500/50 transition-all">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a coin (e.g., Bitcoin) or 'Swap 1 ETH to USDT'..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 h-10"
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-1 px-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                  <Mic className="w-5 h-5" />
                </button>
                {input.trim() && (
                  <button 
                    onClick={handleSend}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-all shadow-lg shadow-blue-900/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
            </div>
         </div>
      </div>
      
      <div className="mt-2 text-[10px] text-gray-400 dark:text-gray-600 font-medium text-center w-full pointer-events-none">
        Gemini can make mistakes, including about people, so double-check it.
      </div>
    </div>
  );
};

export default InputArea;
