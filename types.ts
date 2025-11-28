
// Types for the data structure returned by the AI

export interface PricePoint {
    time: string;
    price: number;
}

export interface TokenDistribution {
    name: string;
    value: number;
}

export interface LongShortData {
    time: string;
    long: number;
    short: number;
}

export interface ProjectMetric {
    subject: string;
    A: number; // The score
    fullMark: number; // Always 100 usually
}

export interface CryptoData {
    coinName: string;
    symbol: string; // Added symbol for TradingView (e.g. "BTC")
    currentPrice: number;
    summary: string;
    priceHistory: PricePoint[];
    tokenomics: TokenDistribution[];
    sentimentScore: number; // 0 to 100
    longShortRatio: LongShortData[];
    projectScores: ProjectMetric[];
}

// New Interface for Transaction Agent
export interface TransactionData {
    type: 'SEND' | 'SWAP' | 'BUY' | 'SELL';
    token: string;
    amount: number;
    toAddress: string; // Recipient or Router address
    network: string;
    estimatedGas: string;
    summary: string; // Brief description like "Swap 1 ETH for USDT"
}

// Binance Types
export interface BinanceBalance {
    asset: string;
    free: number;
    locked: number;
}

export interface BinanceOrder {
    market: 'SPOT' | 'FUTURES';
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    price?: number;
    leverage?: number;
    summary: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    data?: CryptoData;
    transactionData?: TransactionData; // Web3 Tx
    binanceOrder?: BinanceOrder; // Binance Tx
    isLoading?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: number; // Timestamp
    messages: ChatMessage[];
}

export interface PortfolioItem {
    symbol: string;
    name: string;
    amount: number;
    avgPrice: number;
    currentPrice: number;
}
