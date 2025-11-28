
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

// Map Human-Readable names to EVM Chain IDs (Hex)
const CHAIN_IDS: Record<string, string> = {
  "Ethereum Mainnet": "0x1",
  "Sepolia Testnet": "0xaa36a7",
  "Binance Smart Chain": "0x38",
  "Polygon": "0x89",
  // Solana is not EVM compatible and cannot be switched via wallet_switchEthereumChain
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
        // 1. Switch Network if needed
        if (networkName && CHAIN_IDS[networkName]) {
            const targetChainId = CHAIN_IDS[networkName];
            try {
                const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
                if (currentChainId !== targetChainId) {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: targetChainId }],
                    });
                }
            } catch (switchError: any) {
                // Error 4902 indicates the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                     throw new Error(`Network ${networkName} is not added to your wallet. Please add it manually.`);
                }
                // User rejected the switch
                if (switchError.code === 4001) {
                    throw new Error("User rejected network switch.");
                }
                console.error("Failed to switch network:", switchError);
                throw new Error(`Failed to switch to ${networkName}.`);
            }
        } else if (networkName === "Solana") {
            throw new Error("Solana transactions are not supported by MetaMask. Please use an EVM network.");
        }

        // 2. Initialize Provider (After potential network switch)
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Ensure connected
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        
        // 3. Normalize Address
        let formattedTo = toAddress;
        try {
            formattedTo = ethers.getAddress(toAddress);
        } catch (e) {
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
