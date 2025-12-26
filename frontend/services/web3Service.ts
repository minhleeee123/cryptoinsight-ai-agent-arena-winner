
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletInfo {
  address: string;
  balance: string; // ETH amount in string format
}

// Full Chain Configuration for Auto-Add Network
interface ChainConfig {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    blockExplorerUrls: string[];
}

const CHAIN_CONFIGS: Record<string, ChainConfig> = {
  "Ethereum Mainnet": {
      chainId: "0x1",
      chainName: "Ethereum Mainnet",
      rpcUrls: ["https://mainnet.infura.io/v3/"],
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      blockExplorerUrls: ["https://etherscan.io"]
  },
  "Sepolia Testnet": {
      chainId: "0xaa36a7",
      chainName: "Sepolia Testnet",
      rpcUrls: ["https://rpc.sepolia.org"],
      nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
      blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  "Binance Smart Chain": {
      chainId: "0x38",
      chainName: "Binance Smart Chain",
      rpcUrls: ["https://bsc-dataseed.binance.org/"],
      nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      blockExplorerUrls: ["https://bscscan.com"]
  },
  "Polygon": {
      chainId: "0x89",
      chainName: "Polygon Mainnet",
      rpcUrls: ["https://polygon-rpc.com/"],
      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
      blockExplorerUrls: ["https://polygonscan.com"]
  },
  "Avalanche C-Chain": {
      chainId: "0xa86a",
      chainName: "Avalanche C-Chain",
      rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
      nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
      blockExplorerUrls: ["https://snowtrace.io"]
  }
};

export const connectToMetaMask = async (): Promise<WalletInfo | null> => {
  if (typeof window.ethereum === 'undefined') {
    alert("MetaMask is not installed! Please install it to use this feature.");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // ADDED: Force permission request to reset the connection context.
    await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);

    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (accounts.length === 0) return null;

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balanceWei = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balanceWei);

    return {
      address,
      balance: balanceEth
    };
  } catch (error) {
    console.error("User denied account access or error occurred:", error);
    return null;
  }
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Function to send a transaction with Network Switching support
export const sendTransaction = async (
    toAddress: string, 
    amountEth: string, 
    networkName?: string
): Promise<{ hash: string } | null> => {
    
    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is not installed!");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // 1. Network Switching Logic
        if (networkName && CHAIN_CONFIGS[networkName]) {
            const targetConfig = CHAIN_CONFIGS[networkName];
            
            try {
                // Try to switch to the chain
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetConfig.chainId }],
                });
            } catch (switchError: any) {
                // Error 4902: Chain not found in MetaMask. We need to add it.
                if (switchError.code === 4902) {
                     try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [targetConfig],
                        });
                     } catch (addError) {
                         throw new Error(`Failed to add network ${networkName} to MetaMask.`);
                     }
                } else if (switchError.code === 4001) {
                    throw new Error("User rejected network switch.");
                } else {
                    console.error("Failed to switch network:", switchError);
                    throw new Error(`Failed to switch to ${networkName}.`);
                }
            }
        } else if (networkName === "Solana") {
            throw new Error("Solana transactions are not supported by MetaMask. Please use an EVM network.");
        }

        // 2. Re-Initialize Provider (After network switch, the provider needs to be fresh)
        // Note: ethers v6 usually handles this well, but ensuring connection is safe.
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        // 3. Normalize Address
        let formattedTo = toAddress;
        try {
            formattedTo = ethers.getAddress(toAddress);
        } catch (e) {
            // If it's a swap router address or generic hash, proceed with caution or validation
            try {
                formattedTo = ethers.getAddress(toAddress.toLowerCase());
            } catch (e2) {
                throw new Error(`Invalid recipient address: ${toAddress}`);
            }
        }

        // 4. Create transaction object
        const tx: any = {
            to: formattedTo,
            value: ethers.parseEther(amountEth.toString())
        };

        // 5. Send Transaction
        try {
            const response = await signer.sendTransaction(tx);
            return { hash: response.hash };
        } catch (error: any) {
            const isInsufficientFunds = error.code === 'INSUFFICIENT_FUNDS';
            const isGasEstimationFailed = error.info?.error?.code === -32000 || error.message?.includes("insufficient funds");

            if (isInsufficientFunds || isGasEstimationFailed) {
                console.warn("Gas estimation failed. Retrying with manual gasLimit...");
                tx.gasLimit = 300000; 
                const response = await signer.sendTransaction(tx);
                return { hash: response.hash };
            }
            throw error;
        }

    } catch (error) {
        console.error("Transaction Failed:", error);
        throw error;
    }
};
