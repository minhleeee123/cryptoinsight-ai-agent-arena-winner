// API Client for Backend (IQ ADK)
import { CryptoData, TransactionData, PortfolioItem } from "../types";

// Dynamic API URL based on environment
// Development: http://localhost:3001
// Production: Set VITE_API_URL in Vercel environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

// Helper function for API calls
async function apiCall<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }

  return response.json();
}

export const analyzeCoin = async (coinName: string): Promise<CryptoData> => {
  return apiCall<CryptoData>('/api/analyze-coin', { coinName });
};

export const generateMarketReport = async (data: CryptoData): Promise<string> => {
  const result = await apiCall<{ report: string }>('/api/market-report', { data });
  return result.report;
};

export const determineIntent = async (userMessage: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string }> => {
  return apiCall('/api/determine-intent', { userMessage });
};

export const chatWithModel = async (
  userMessage: string, 
  history: any[], 
  contextData?: CryptoData
): Promise<string> => {
  const result = await apiCall<{ response: string }>('/api/chat', { 
    userMessage, 
    contextData 
  });
  return result.response;
};

export const analyzePortfolio = async (portfolio: PortfolioItem[]): Promise<string> => {
  const result = await apiCall<{ analysis: string }>('/api/analyze-portfolio', { portfolio });
  return result.analysis;
};

export const updatePortfolioRealTime = async (portfolio: PortfolioItem[]): Promise<PortfolioItem[]> => {
  return apiCall<PortfolioItem[]>('/api/update-portfolio', { portfolio });
};

export const createTransactionPreview = async (userText: string): Promise<TransactionData> => {
  return apiCall<TransactionData>('/api/transaction-preview', { userText });
};
