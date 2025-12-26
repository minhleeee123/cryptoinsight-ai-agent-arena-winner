// Shared types for backend
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
    A: number;
    fullMark: number;
}

export interface CryptoData {
    coinName: string;
    symbol: string;
    currentPrice: number;
    summary: string;
    priceHistory: PricePoint[];
    tokenomics: TokenDistribution[];
    sentimentScore: number;
    longShortRatio: LongShortData[];
    projectScores: ProjectMetric[];
}

export interface TransactionData {
    type: 'SEND' | 'SWAP';
    token?: string;
    targetToken?: string;
    amount?: number;
    toAddress?: string;
    network?: string;
    summary?: string;
}

export interface PortfolioItem {
    symbol: string;
    name: string;
    amount: number;
    avgPrice: number;
    currentPrice: number;
}

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
    transactionData?: TransactionData;
    isLoading?: boolean;
}
