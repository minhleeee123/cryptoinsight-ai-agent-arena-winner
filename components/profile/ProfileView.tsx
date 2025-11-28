
import React, { useEffect } from 'react';
import { User, ArrowLeft, RefreshCw, Link2, X, Mail, Shield, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { formatAddress } from '../../services/web3Service';
import { PortfolioItem } from '../../types';

interface ProfileProps {
    user: {
      name: string;
      email: string;
      joinDate: string;
      walletAddress: string | null;
      totalBalance: number;
      portfolio: PortfolioItem[];
    };
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
                onClick={() => { onRefreshPrices(); }}
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
};

export default ProfileView;