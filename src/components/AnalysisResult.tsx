import React, { useState } from 'react';
import type { StockAnalysisResponse } from '../types/api';

interface AnalysisResultProps {
  data: StockAnalysisResponse;
}

interface MetricBadgeProps {
  label: string;
  value: string;
  type: "bullish" | "bearish" | "neutral";
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, type }) => {
  const getColorClass = () => {
    switch (type) {
      case 'bullish':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'bearish':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getColorClass()}`}>
      <span className="font-semibold mr-1">{label}:</span>
      {value}
    </span>
  );
};

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-600 rounded-lg">
      <button
        className="w-full px-4 py-3 text-left bg-gray-700 hover:bg-gray-600 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-white">{title}</span>
          <span className="text-gray-300">
            {isOpen ? '−' : '+'}
          </span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 py-3 bg-gray-800 rounded-b-lg">
          {children}
        </div>
      )}
    </div>
  );
};

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  // Usar las nuevas propiedades estructuradas si están disponibles
  const sections = data.sections || [];
  const metrics = data.metrics || [];
  const sentiment = data.sentiment || { label: 'Neutral', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  const chartUrl = data.chartUrl;

  // Función para formatear contenido
  const formatContent = (content: string) => {
    // Función para obtener emoji basado en el título de sección (solo para títulos principales)
    const getEmojiForSectionTitle = (title: string): string => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) return '📋';
      if (lowerTitle.includes('financial') || lowerTitle.includes('snapshot')) return '💰';
      if (lowerTitle.includes('technical') || lowerTitle.includes('analysis')) return '📊';
      if (lowerTitle.includes('market') || lowerTitle.includes('context')) return '🌊';
      if (lowerTitle.includes('thesis') || lowerTitle.includes('investment')) return '🎯';
      if (lowerTitle.includes('indicator') || lowerTitle.includes('confluence')) return '📈';
      if (lowerTitle.includes('levels') || lowerTitle.includes('critical')) return '🎯';
      if (lowerTitle.includes('outlook') || lowerTitle.includes('forecast')) return '🔮';
      return ''; // sin emoji por defecto para subtítulos
    };

    // Función para procesar texto con formato **bold** (sin emojis)
    const processBoldText = (text: string) => {
      const parts = text.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return (
            <span key={partIndex} className="font-bold text-blue-300">
              {boldText}
            </span>
          );
        }
        return part;
      });
    };

    return content
      .split('\n')
      .map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        
        // Handle ### headers (títulos principales de sección)
        if (trimmed.startsWith('###')) {
          const headerText = trimmed.replace(/^###\s*/, '');
          const emoji = getEmojiForSectionTitle(headerText);
          return (
            <div key={index} className="mt-6 mb-4 pb-2 border-b border-gray-600">
              <h3 className="text-xl font-bold text-white flex items-center">
                {emoji && <span className="mr-2">{emoji}</span>}
                {headerText}
              </h3>
            </div>
          );
        }
        
        // Handle ## headers (subtítulos importantes)
        if (trimmed.startsWith('##')) {
          const headerText = trimmed.replace(/^##\s*/, '');
          return (
            <div key={index} className="mt-5 mb-3">
              <h4 className="text-lg font-bold text-blue-200">
                {headerText}
              </h4>
            </div>
          );
        }
        
        // Handle bullet points
        if (trimmed.startsWith('-')) {
          return (
            <li key={index} className="ml-4 text-gray-300 leading-relaxed list-disc">
              {processBoldText(trimmed.substring(1).trim())}
            </li>
          );
        }
        
        // Handle lines with **bold** text (sin emojis)
        if (trimmed.includes('**')) {
          return (
            <div key={index} className="mt-3 mb-2">
              <div className="text-gray-300 leading-relaxed">
                {processBoldText(trimmed)}
              </div>
            </div>
          );
        }
        
        // Handle sub-headers with colons
        if (trimmed.includes(':') && !trimmed.includes('http') && !trimmed.includes('**')) {
          const [header, ...rest] = trimmed.split(':');
          return (
            <div key={index} className="mt-3 mb-2">
              <span className="font-semibold text-white">{header}:</span>
              <span className="text-gray-300 ml-1">{rest.join(':')}</span>
            </div>
          );
        }
        
        return (
          <p key={index} className="text-gray-300 leading-relaxed mb-2">
            {trimmed}
          </p>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Banner */}
      <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-white">{data.ticker || 'STOCK'}</h1>
              <div className="text-lg text-gray-300">Stock Analysis</div>
            </div>
            <div className={`px-4 py-2 rounded-full border-2 font-semibold ${sentiment.color}`}>
              {sentiment.label}
            </div>
          </div>
          
          {/* Key Metrics */}
          {metrics.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {metrics.map((metric, index) => (
                <MetricBadge
                  key={index}
                  label={metric.label}
                  value={metric.value}
                  type={metric.type}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Chart Section */}
        {chartUrl && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4 text-center">Technical Chart</h2>
              <div className="flex justify-center">
                <img
                  src={chartUrl}
                  alt="Stock Chart"
                  className="max-w-full h-auto rounded-lg shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Analysis Cards */}
        <div className="grid gap-6">
          {sections.length > 0 ? (
            sections.map((section, index) => (
              section.content && (
                <div key={section.key} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">
                      {section.title}
                    </h3>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    {section.content.length > 500 ? (
                      <Accordion title="View Full Analysis" defaultOpen={index === 0}>
                        <div className="space-y-2">
                          {formatContent(section.content)}
                        </div>
                      </Accordion>
                    ) : (
                      <div className="space-y-2">
                        {formatContent(section.content)}
                      </div>
                    )}
                  </div>
                </div>
              )
            ))
          ) : (
            // Fallback para contenido no estructurado
            data.content && (
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Analysis</h3>
                </div>
                <div className="prose prose-gray max-w-none">
                  <div className="space-y-2">
                    {formatContent(data.content)}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-700">
            <p className="text-sm text-gray-300">
              Analysis updated: {new Date().toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Data reflects sources accessed through market close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;