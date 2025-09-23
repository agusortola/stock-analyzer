export interface AnalysisSection {
  key: string;
  title: string;
  content: string;
}

export interface Metric {
  label: string;
  value: string;
  type: 'bullish' | 'bearish' | 'neutral';
}

export interface Sentiment {
  label: 'Bullish' | 'Bearish' | 'Neutral';
  color: string;
}

export interface StockAnalysisResponse {
  ticker?: string;
  content?: string; // Para respuestas de texto plano
  chartUrl?: string;
  sections?: AnalysisSection[];
  metrics?: Metric[];
  sentiment?: Sentiment;
  // Propiedades estructuradas opcionales para compatibilidad
  executiveSummary?: AnalysisSection;
  financialSnapshot?: AnalysisSection;
  technicalAnalysis?: AnalysisSection;
  marketContext?: AnalysisSection;
  integratedThesis?: AnalysisSection;
  [key: string]: AnalysisSection | string | AnalysisSection[] | Metric[] | Sentiment | undefined; // Para permitir secciones adicionales
}

export interface ApiRequest {
  query: string;
}

export interface ApiError {
  message: string;
  code?: number;
}
