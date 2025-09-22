import { type FC } from 'react';
import type { StockAnalysisResponse, AnalysisSection } from '../types/api';
import ChartViewer from './ChartViewer';

interface AnalysisResultProps {
  data: StockAnalysisResponse;
}

const AnalysisResult: FC<AnalysisResultProps> = ({ data }) => {
  const renderSection = (section: AnalysisSection | undefined, defaultTitle: string) => {
    if (!section) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
          {section.title || defaultTitle}
        </h3>
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {section.content}
        </div>
      </div>
    );
  };

  const sections = [
    { data: data.executiveSummary, title: 'Executive Summary' },
    { data: data.financialSnapshot, title: 'Financial Snapshot' },
    { data: data.technicalAnalysis, title: 'Technical Analysis' },
    { data: data.marketContext, title: 'Market Context' },
    { data: data.integratedThesis, title: 'Integrated Thesis' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 mb-8">
        <h2 className="text-3xl font-bold text-center">
          Análisis de {data.ticker}
        </h2>
      </div>

      {/* Chart */}
      {data.chartUrl && (
        <div className="mb-8">
          <ChartViewer chartUrl={data.chartUrl} ticker={data.ticker} />
        </div>
      )}

      {/* Analysis Sections */}
      <div className="space-y-6">
        {sections.map((section) => 
          renderSection(section.data, section.title)
        )}
        
        {/* Render any additional sections that might be in the response */}
        {Object.entries(data).map(([key, value]) => {
          // Skip known properties and non-section data
          if (['ticker', 'executiveSummary', 'financialSnapshot', 'technicalAnalysis', 'marketContext', 'integratedThesis', 'chartUrl'].includes(key)) {
            return null;
          }
          
          // Check if it's an analysis section
          if (typeof value === 'object' && value && 'title' in value && 'content' in value) {
            return (
              <div key={key} className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  {(value as AnalysisSection).title}
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {(value as AnalysisSection).content}
                </div>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
};

export default AnalysisResult;