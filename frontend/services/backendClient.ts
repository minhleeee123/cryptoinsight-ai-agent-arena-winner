// Frontend API Client to call backend instead of direct Gemini
import { CryptoData, TransactionData, PortfolioItem, PortfolioAnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:3001';

// ========== MARKET AGENT API ==========

export async function analyzeCoin(coinName: string): Promise<CryptoData> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-coin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coinName })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze coin: ${response.statusText}`);
  }

  return response.json();
}

export async function generateMarketReport(data: CryptoData): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/market-report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });

  if (!response.ok) {
    throw new Error(`Failed to generate report: ${response.statusText}`);
  }

  const result = await response.json();
  return result.report;
}

// ========== CHAT AGENT API ==========

export async function determineIntent(userMessage: string, userId?: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/determine-intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, userId: userId || 'web-user' })
  });

  if (!response.ok) {
    throw new Error(`Failed to determine intent: ${response.statusText}`);
  }

  return response.json();
}

export async function chatWithModel(userMessage: string, userId?: string, contextData?: CryptoData): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, userId: userId || 'web-user', contextData })
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.response;
}

// ========== PORTFOLIO AGENT API ==========

export async function analyzePortfolio(portfolio: PortfolioItem[]): Promise<PortfolioAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze portfolio: ${response.statusText}`);
  }

  const result = await response.json();
  return result.analysis;
}

export async function updatePortfolioRealTime(portfolio: PortfolioItem[]): Promise<PortfolioItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/update-portfolio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio })
  });

  if (!response.ok) {
    throw new Error(`Failed to update portfolio: ${response.statusText}`);
  }

  return response.json();
}

// ========== TRANSACTION AGENT API ==========

export async function createTransactionPreview(userText: string): Promise<TransactionData> {
  const response = await fetch(`${API_BASE_URL}/api/transaction-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userText })
  });

  if (!response.ok) {
    throw new Error(`Failed to create transaction: ${response.statusText}`);
  }

  return response.json();
}

// ========== VISION AGENT API ==========

export async function analyzeChartImage(base64Image: string, promptText: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Image, promptText })
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze chart: ${response.statusText}`);
  }

  const result = await response.json();
  return result.analysis;
}
