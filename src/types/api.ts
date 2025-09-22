export interface AnalysisSection {
  title: string;
  content: string;
}

export interface StockAnalysisResponse {
  ticker: string;
  executiveSummary?: AnalysisSection;
  financialSnapshot?: AnalysisSection;
  technicalAnalysis?: AnalysisSection;
  marketContext?: AnalysisSection;
  integratedThesis?: AnalysisSection;
  chartUrl?: string;
  [key: string]: AnalysisSection | string | undefined; // Para permitir secciones adicionales
}

export interface ApiRequest {
  query: string;
}

export interface ApiError {
  message: string;
  code?: number;
}