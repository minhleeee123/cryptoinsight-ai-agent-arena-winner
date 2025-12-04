
import React from 'react';
import { Menu, User, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  currentView: 'chat' | 'profile';
  setCurrentView: (view: 'chat' | 'profile') => void;
  userProfile: {
    walletAddress: string | null;
  };
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, currentView, setCurrentView, userProfile, theme, toggleTheme }) => {
  return (
    <div className="flex items-center justify-between p-4 md:p-6 sticky top-0 z-10 bg-white/80 dark:bg-[#131314]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 md:border-none transition-colors duration-300">
      <div className="flex items-center gap-3">
         {/* Mobile Toggle Button */}
         <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-600 dark:text-gray-400 transition-colors md:hidden"
            title="Open Menu"
         >
           <Menu className="w-5 h-5" />
         </button>
         <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">Crypto Insight AI</span>
         </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Button */}
        <div 
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${currentView === 'profile' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setCurrentView('profile')}
            title="View Profile"
        >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center relative">
                <User className="w-5 h-5 text-white" />
                {userProfile.walletAddress && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#131314]"></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
