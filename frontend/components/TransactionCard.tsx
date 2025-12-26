
import React, { useState, useEffect } from 'react';
import { TransactionData } from '../types';
import { sendTransaction } from '../services/web3Service';
import { ArrowRight, Check, AlertCircle, Loader2, Wallet, Settings } from 'lucide-react';

interface Props {
  data: TransactionData;
}

// Updated list to match Web3Service configs
const NETWORKS = [
    "Ethereum Mainnet", 
    "Sepolia Testnet", 
    "Binance Smart Chain", 
    "Polygon", 
    "Avalanche C-Chain"
];

const TransactionCard: React.FC<Props> = ({ data }) => {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form State
  const [type, setType] = useState<'SEND' | 'SWAP'>(data.type);
  const [amount, setAmount] = useState<string>(data.amount ? data.amount.toString() : '');
  const [token, setToken] = useState<string>(data.token || 'ETH');
  const [targetToken, setTargetToken] = useState<string>(data.targetToken || '');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>(data.toAddress || '');
  
  // Initialize network with AI data, or default to ETH Mainnet. 
  // Important: If AI says 'BSC', it should match one of the NETWORKS strings via agent logic.
  const [network, setNetwork] = useState<string>(data.network || 'Ethereum Mainnet');
  
  const [isCalculating, setIsCalculating] = useState(false);

  // Mock Rate Calculation Logic
  useEffect(() => {
    if (type === 'SWAP' && amount && token && targetToken) {
        setIsCalculating(true);
        const timer = setTimeout(() => {
            // Mock Exchange Rates
            let rate = 1;
            const pair = `${token.toUpperCase()}-${targetToken.toUpperCase()}`;
            
            // Basic Mock Logic
            if (pair === 'ETH-USDT') rate = 3200;
            else if (pair === 'USDT-ETH') rate = 1 / 3200;
            else if (pair === 'BTC-USDT') rate = 65000;
            else if (pair === 'USDT-BTC') rate = 1 / 65000;
            else if (pair === 'SOL-USDT') rate = 145;
            else if (pair === 'USDT-SOL') rate = 1 / 145;
            else rate = Math.random() * 2 + 0.5; // Random rate for unknown pairs

            const val = parseFloat(amount) * rate;
            // Format: Less decimals for USDT, more for tokens
            setTargetAmount(val < 1 ? val.toFixed(6) : val.toFixed(2));
            setIsCalculating(false);
        }, 800); // Simulate API delay

        return () => clearTimeout(timer);
    } else {
        setTargetAmount('');
    }
  }, [amount, token, targetToken, type]);

  // Form Validation
  const isValid = () => {
    const isAmountValid = parseFloat(amount) > 0;
    
    if (type === 'SEND') {
        return isAmountValid && !!network && !!toAddress && !!token;
    } else {
        // SWAP: Network IS required for execution context
        return isAmountValid && !!token && !!targetToken && !!network;
    }
  };

  const handleConfirm = async () => {
    setStatus('sending');
    setErrorMessage('');
    
    try {
        let destination = toAddress;
        if (type === 'SWAP') {
             // Mock Router Address for Swap
             destination = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"; 
        }

        if (!destination) throw new Error("Destination address required");

        const result = await sendTransaction(destination, amount, network);
        
        if (result && result.hash) {
            setTxHash(result.hash);
            setStatus('success');
        } else {
            setStatus('error');
            setErrorMessage("Transaction rejected or failed.");
        }
    } catch (error: any) {
        console.error("Tx Error", error);
        setStatus('error');
        setErrorMessage(error.reason || error.message || "User rejected transaction");
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#1e1f20] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl mt-4 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 p-4 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 dark:bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Transaction Details</h3>
                <p className="text-xs text-blue-600 dark:text-blue-300">Review & Edit</p>
            </div>
        </div>
        <div className="px-2 py-1 rounded bg-white/50 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase border border-gray-300 dark:border-white/5">
            {type}
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Network Selection - NOW VISIBLE FOR BOTH SEND AND SWAP */}
        <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Network</label>
            <div className="relative">
                <select 
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-gray-200 text-sm rounded-lg p-2.5 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-black/40 transition-colors"
                >
                    {NETWORKS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <Settings className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
            </div>
        </div>

        {/* Amount & Token Input Row */}
        <div className="flex gap-3">
            <div className="flex-1 space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Pay</label>
                <input 
                    type="number" 
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white text-lg font-bold rounded-lg p-3 border outline-none transition-colors ${!amount ? 'border-yellow-500/50' : 'border-gray-200 dark:border-white/10 focus:border-blue-500/50'}`}
                />
            </div>
            <div className="w-1/3 space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Token</label>
                <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.toUpperCase())}
                    placeholder="ETH"
                    className="w-full bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white text-lg font-bold rounded-lg p-3 border border-gray-200 dark:border-white/10 outline-none focus:border-blue-500/50 uppercase text-center"
                />
            </div>
        </div>

        {/* Destination / Swap Target */}
        {type === 'SEND' ? (
             <div className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Recipient Address</label>
                <input 
                    type="text" 
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    placeholder="0x..."
                    className={`w-full bg-gray-50 dark:bg-black/20 text-sm font-mono text-blue-600 dark:text-blue-300 rounded-lg p-3 border outline-none transition-colors ${!toAddress ? 'border-yellow-500/50' : 'border-gray-200 dark:border-white/10 focus:border-blue-500/50'}`}
                />
             </div>
        ) : (
            <>
                <div className="flex justify-center -my-2">
                    <div className="bg-white dark:bg-[#1e1f20] p-1.5 rounded-full border border-gray-200 dark:border-white/10 z-10">
                        <ArrowRight className="w-4 h-4 text-gray-500 rotate-90" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Receive (Estimated)</label>
                    <div className="flex gap-3">
                         <div className="flex-1 bg-gray-50 dark:bg-black/20 rounded-lg p-3 border border-gray-200 dark:border-white/10 flex items-center justify-between">
                            {isCalculating ? (
                                <span className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Calculating...
                                </span>
                            ) : (
                                <span className="text-lg font-bold text-gray-900 dark:text-gray-300">
                                    {targetAmount || "0.00"}
                                </span>
                            )}
                         </div>
                         <input 
                            type="text" 
                            value={targetToken}
                            onChange={(e) => setTargetToken(e.target.value.toUpperCase())}
                            placeholder="USDT"
                            className={`w-1/3 bg-gray-50 dark:bg-black/20 text-gray-900 dark:text-white text-lg font-bold rounded-lg p-3 border outline-none uppercase text-center ${!targetToken ? 'border-yellow-500/50' : 'border-gray-200 dark:border-white/10 focus:border-blue-500/50'}`}
                         />
                    </div>
                </div>
            </>
        )}

        {/* Status Messages */}
        {status === 'success' && (
            <div className="bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3 flex items-start gap-2 text-green-700 dark:text-green-400 text-xs break-all">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold block">Transaction Sent!</span>
                    Tx Hash: {txHash}
                </div>
            </div>
        )}

        {status === 'error' && (
            <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold block">Failed</span>
                    {errorMessage}
                </div>
            </div>
        )}

        {/* Action Button */}
        <button
            onClick={handleConfirm}
            disabled={!isValid() || status === 'sending' || status === 'success'}
            className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                ${isValid() 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 active:scale-95'
                    : 'bg-gray-200 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
                ${status === 'success' ? 'bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 !cursor-default' : ''}
            `}
        >
            {status === 'sending' ? (
                <>
                   <Loader2 className="w-4 h-4 animate-spin" /> Check Wallet...
                </>
            ) : status === 'success' ? (
                <>
                   <Check className="w-4 h-4" /> Transaction Submitted
                </>
            ) : (
                "Confirm Transaction"
            )}
        </button>
      </div>
    </div>
  );
};

export default TransactionCard;
