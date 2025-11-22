
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
    currentPrice: number;
    summary: string;
    priceHistory: PricePoint[];
    tokenomics: TokenDistribution[];
    sentimentScore: number; // 0 to 100
    longShortRatio: LongShortData[];
    projectScores: ProjectMetric[];
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text?: string;
    data?: CryptoData;
    isLoading?: boolean;
}

export interface ChatSession {
    id: string;
    title: string;
    date: number; // Timestamp
    messages: ChatMessage[];
}
