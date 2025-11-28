
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

export const connectToMetaMask = async (): Promise<WalletInfo | null> => {
  if (typeof window.ethereum === 'undefined') {
    alert("MetaMask is not installed! Please install it to use this feature.");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // ADDED: Force permission request to reset the connection context.
    // This makes MetaMask show the "Select an account" popup again, 
    // solving the issue of instant reconnection after disconnect.
    await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);

    // Request account access (now effectively a fresh request due to the line above)
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

// Function to send a transaction (simulates Buy/Sell/Swap by sending ETH to an address)
export const sendTransaction = async (toAddress: string, amountEth: string): Promise<{ hash: string } | null> => {
    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is not installed!");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Ensure connected
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        
        // VALIDATION FIX: Normalize address to prevent "bad address checksum" errors
        // Ethers throws if a mixed-case address has an invalid checksum.
        // We attempt to fix it by converting to lowercase (valid non-checksum format) 
        // and letting Ethers re-checksum it.
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

        // Create transaction object
        const tx: any = {
            to: formattedTo,
            value: ethers.parseEther(amountEth.toString())
        };

        // Try to send transaction normally.
        // Ethers will try to estimate gas first. If funds are insufficient, this throws an error immediately
        // preventing the Wallet UI from opening.
        try {
            const response = await signer.sendTransaction(tx);
            return { hash: response.hash };
        } catch (error: any) {
            // Check if error is related to Insufficient Funds or Gas Estimation failure
            const isInsufficientFunds = error.code === 'INSUFFICIENT_FUNDS';
            const isGasEstimationFailed = error.info?.error?.code === -32000 || error.message?.includes("insufficient funds");

            if (isInsufficientFunds || isGasEstimationFailed) {
                console.warn("Gas estimation failed (likely insufficient funds). Retrying with manual gasLimit to force Wallet UI...");
                
                // Set a manual gasLimit. This tells Ethers to SKIP the estimateGas step 
                // and send the request directly to MetaMask.
                // 300,000 is enough for standard ETH transfers (21k) and most Uniswap swaps (~150-200k).
                tx.gasLimit = 300000; 

                // Send again. Now MetaMask should pop up and show the red "Insufficient funds" warning itself.
                const response = await signer.sendTransaction(tx);
                return { hash: response.hash };
            }

            // If it's another type of error (e.g. user rejected), rethrow it
            throw error;
        }

    } catch (error) {
        console.error("Transaction Failed:", error);
        throw error;
    }
};
