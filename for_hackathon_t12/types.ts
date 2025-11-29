
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
    type: 'SEND' | 'SWAP';
    token?: string; // Source token
    targetToken?: string; // For SWAP (e.g. USDT)
    amount?: number;
    toAddress?: string; // Recipient (required for SEND)
    network?: string;
    summary?: string; 
}

// New Interface for Portfolio Analysis
export interface PortfolioPositionAnalysis {
    asset: string;
    amount: number;
    avgPrice: number;
    currentPrice: number;
    currentValue: number;
    pnlPercent: number;
    allocation: number;
}

export interface PortfolioAnalysisResult {
    totalValue: number;
    positions: PortfolioPositionAnalysis[];
    riskAnalysis: string;
    rebalancingSuggestions: string[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    data?: CryptoData;
    transactionData?: TransactionData; // Web3 Tx
    portfolioAnalysis?: PortfolioAnalysisResult; // New Field
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