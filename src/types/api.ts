export interface AnalysisSection {
  title: string;
  content: string;
}

export interface StockAnalysisResponse {
  ticker?: string;
  content?: string; // Para respuestas de texto plano
  chartUrl?: string;
  // Propiedades estructuradas opcionales para compatibilidad
  executiveSummary?: AnalysisSection;
  financialSnapshot?: AnalysisSection;
  technicalAnalysis?: AnalysisSection;
  marketContext?: AnalysisSection;
  integratedThesis?: AnalysisSection;
  [key: string]: AnalysisSection | string | undefined; // Para permitir secciones adicionales
}

export interface ApiRequest {
  query: string;
}

export interface ApiError {
  message: string;
  code?: number;
}
