import React, { useState } from "react";
import type { StockAnalysisResponse } from "../types/api";

interface AnalysisResultProps {
  data: StockAnalysisResponse;
}

interface MetricBadgeProps {
  label: string;
  value: string;
  type: "bullish" | "bearish" | "neutral";
}

const MetricBadge: React.FC<MetricBadgeProps> = ({ label, value, type }) => {
  const colors = {
    bullish: "bg-green-100 text-green-800 border-green-200",
    bearish: "bg-red-100 text-red-800 border-red-200",
    neutral: "bg-gray-100 text-gray-800 border-gray-200"
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[type]}`}>
      <span className="font-semibold">{label}:</span>
      <span className="ml-1">{value}</span>
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
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left bg-gray-700 hover:bg-gray-600 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-medium text-white">{title}</span>
        <svg
          className={`w-5 h-5 transform transition-transform text-gray-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
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
  // Extract chart URL from content
  const extractChartUrl = (content: string): string | null => {
    const urlMatch = content.match(/https?:\/\/[^\s]+\.png/);
    return urlMatch ? urlMatch[0] : null;
  };

  // Parse sections from content
  const parseSections = (content: string) => {
    const chartUrl = extractChartUrl(content);
    const contentWithoutChart = content.replace(/https?:\/\/[^\s]+\.png\s*/, '').trim();
    
    const sections = [
      {
        key: 'executive',
        title: '📌 Executive Summary',
        icon: '📌',
        content: ''
      },
      {
        key: 'financial',
        title: '📊 Financial Snapshot', 
        icon: '📊',
        content: ''
      },
      {
        key: 'technical',
        title: '📈 Technical Analysis',
        icon: '📈',
        content: ''
      },
      {
        key: 'market',
        title: '📰 Market Context & Sentiment',
        icon: '📰',
        content: ''
      },
      {
        key: 'thesis',
        title: '💡 Integrated Investment Thesis',
        icon: '💡',
        content: ''
      }
    ];

    // Parse numbered sections
    const numberedSections = contentWithoutChart.split(/\d+\)\s+/).filter(section => section.trim());
    
    numberedSections.forEach((section, index) => {
      if (index < sections.length) {
        sections[index].content = section.trim();
      }
    });

    return { sections, chartUrl };
  };

  // Extract key metrics and determine sentiment
  const extractMetrics = (content: string) => {
    const metrics = [];
    
    // RSI
    const rsiMatch = content.match(/RSI:\s*([\d.]+)/);
    if (rsiMatch) {
      const rsi = parseFloat(rsiMatch[1]);
      const type = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral';
      metrics.push({ label: 'RSI', value: rsiMatch[1], type });
    }

    // MACD
    const macdMatch = content.match(/MACD:\s*([\d.-]+)/);
    if (macdMatch) {
      const macd = parseFloat(macdMatch[1]);
      const type = macd > 0 ? 'bullish' : 'bearish';
      metrics.push({ label: 'MACD', value: macdMatch[1], type });
    }

    // Support/Resistance
    const supportMatch = content.match(/Support:\s*\$?([\d.-]+)/);
    if (supportMatch) {
      metrics.push({ label: 'Support', value: `$${supportMatch[1]}`, type: 'neutral' });
    }

    const resistanceMatch = content.match(/Resistance:\s*\$?([\d.-]+)/);
    if (resistanceMatch) {
      metrics.push({ label: 'Resistance', value: `$${resistanceMatch[1]}`, type: 'neutral' });
    }

    return metrics;
  };

  // Determine overall sentiment
  const getSentiment = (content: string): { label: string; color: string } => {
    const bullishWords = ['bullish', 'positive', 'upside', 'buy', 'outperform'];
    const bearishWords = ['bearish', 'negative', 'downside', 'sell', 'underperform'];
    
    const lowerContent = content.toLowerCase();
    const bullishCount = bullishWords.reduce((count, word) => count + (lowerContent.match(new RegExp(word, 'g')) || []).length, 0);
    const bearishCount = bearishWords.reduce((count, word) => count + (lowerContent.match(new RegExp(word, 'g')) || []).length, 0);
    
    if (bullishCount > bearishCount) {
      return { label: 'Bullish', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (bearishCount > bullishCount) {
      return { label: 'Bearish', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    return { label: 'Neutral', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  // Format content with better structure
   const formatContent = (content: string) => {
     return content
       .split('\n')
       .map((line, index) => {
         const trimmed = line.trim();
         if (!trimmed) return null;
         
         // Handle bullet points
         if (trimmed.startsWith('-')) {
           return (
             <li key={index} className="ml-4 text-gray-300 leading-relaxed">
               {trimmed.substring(1).trim()}
             </li>
           );
         }
         
         // Handle sub-headers
         if (trimmed.includes(':') && !trimmed.includes('http')) {
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

  const { sections, chartUrl } = parseSections(data.content || '');
  const metrics = extractMetrics(data.content || '');
  const sentiment = getSentiment(data.content || '');

  return (
     <div className="min-h-screen bg-gray-900">
       {/* Top Banner */}
       <div className="bg-gray-800 border-b border-gray-700 shadow-sm">
         <div className="max-w-6xl mx-auto px-6 py-6">
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-4">
               <h1 className="text-3xl font-bold text-white">{data.ticker || 'STOCK'}</h1>
               <div className="text-lg text-gray-300">Apple Inc.</div>
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
                   type={metric.type as "bullish" | "bearish" | "neutral"}
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
           {sections.map((section, index) => (
             section.content && (
               <div key={section.key} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                 <div className="flex items-center mb-4">
                   <span className="text-2xl mr-3">{section.icon}</span>
                   <h3 className="text-xl font-semibold text-white">
                     {section.title.replace(section.icon, '').trim()}
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
           ))}
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