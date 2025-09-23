import { useState } from "react";
import SearchBar from "./components/SearchBar";
import AnalysisResult from "./components/AnalysisResult";
import type { StockAnalysisResponse } from "./types/api";

// Función para transformar markdown a JSON estructurado
const transformMarkdownToJSON = (
  rawContent: string,
  ticker: string
): StockAnalysisResponse => {
  // Extraer ticker del contenido si está presente
  const tickerMatch = rawContent.match(/Ticker for searches?:\s*([A-Z]+)/i);
  const extractedTicker = tickerMatch ? tickerMatch[1] : ticker.toUpperCase();

  // Extraer chartUrl
  const chartUrlMatch = rawContent.match(/(https?:\/\/[^\s]+\.png)/);
  const chartUrl = chartUrlMatch ? chartUrlMatch[1] : undefined;

  // Limpiar contenido - eliminar referencias a URLs de gráficos
  let cleanContent = rawContent
    .replace(/Chart URL:\s*`?https?:\/\/[^\s`]+`?\s*/g, "")
    .replace(/!\s*`https?:\/\/[^\s`]+`\s*/g, "")
    .replace(/`https?:\/\/[^\s`]+`\s*/g, "")
    .replace(/^https?:\/\/[^\s]+\s*/gm, "")
    .replace(/^-+\s*$/gm, "")
    .replace(/^\s*\n+/gm, "")
    .trim();

  // Extraer secciones basadas en patrones - Technical Analysis primero
  const sections = [];

  // Patrones para diferentes tipos de secciones - reordenados con Technical Analysis primero
  const sectionPatterns = [
    {
      key: "technical",
      title: "Technical Analysis Deep Dive",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Technical Analysis|Technical Analysis Deep Dive)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
    {
      key: "indicators",
      title: "Indicator Confluence",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Indicator Confluence|\d+\)\s*Indicator Confluence)([\s\S]*?)(?=##?\s*\d+\.|\d+\)|$)/i,
    },
    {
      key: "executive",
      title: "Executive Summary",
      pattern:
        /(?:##?\s*(?:1\.?\s*)?Executive Summary|Executive Summary)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
    {
      key: "snapshot",
      title: "Financial Snapshot",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Financial Snapshot|Financial Snapshot)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
    {
      key: "levels",
      title: "Critical Levels",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Critical Levels|Critical Levels)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
    {
      key: "outlook",
      title: "Technical Outlook",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Technical Outlook|Technical Outlook)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
    {
      key: "market",
      title: "Market Context & Sentiment",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Market Context|Market Context & Sentiment|\d+\)\s*Market Context)([\s\S]*?)(?=##?\s*\d+\.|\d+\)|$)/i,
    },
    {
      key: "thesis",
      title: "Integrated Investment Thesis",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Integrated Investment Thesis|\d+\)\s*Integrated Investment Thesis)([\s\S]*?)(?=##?\s*\d+\.|\d+\)|$)/i,
    },
    {
      key: "summary",
      title: "Summary",
      pattern:
        /(?:##?\s*(?:\d+\.?\s*)?Summary|Summary)([\s\S]*?)(?=##?\s*\d+\.|$)/i,
    },
  ];

  sectionPatterns.forEach(({ key, title, pattern }) => {
    const match = cleanContent.match(pattern);
    if (match && match[1] && match[1].trim().length > 20) {
      sections.push({
        key,
        title,
        content: match[1].trim(),
      });
    }
  });

  // Si no se encontraron secciones específicas, crear una sección general
  if (sections.length === 0) {
    sections.push({
      key: "analysis",
      title: "Analysis",
      content: cleanContent,
    });
  }

  // Extraer métricas
  const metrics = [];

  const rsiMatch = cleanContent.match(/RSI:\s*([\d.]+)/i);
  if (rsiMatch) {
    const rsi = parseFloat(rsiMatch[1]);
    const type: "bearish" | "bullish" | "neutral" =
      rsi > 70 ? "bearish" : rsi < 30 ? "bullish" : "neutral";
    metrics.push({ label: "RSI", value: rsiMatch[1], type });
  }

  const macdMatch = cleanContent.match(/MACD:\s*([-\d.]+)/i);
  if (macdMatch) {
    const macd = parseFloat(macdMatch[1]);
    const type: "bearish" | "bullish" | "neutral" =
      macd > 0 ? "bullish" : "bearish";
    metrics.push({ label: "MACD", value: macdMatch[1], type });
  }

  const supportMatch = cleanContent.match(/Support:\s*\$?([\d.,]+)/i);
  if (supportMatch) {
    metrics.push({
      label: "Support",
      value: `$${supportMatch[1]}`,
      type: "neutral" as const,
    });
  }

  const resistanceMatch = cleanContent.match(/Resistance:\s*\$?([\d.,]+)/i);
  if (resistanceMatch) {
    metrics.push({
      label: "Resistance",
      value: `$${resistanceMatch[1]}`,
      type: "neutral" as const,
    });
  }

  // Determinar sentiment
  const bullishWords = [
    "bullish",
    "positive",
    "upside",
    "buy",
    "outperform",
    "strong",
    "favorable",
  ];
  const bearishWords = [
    "bearish",
    "negative",
    "downside",
    "sell",
    "underperform",
    "weak",
    "unfavorable",
  ];

  const lowerContent = cleanContent.toLowerCase();
  const bullishCount = bullishWords.reduce(
    (count, word) =>
      count + (lowerContent.match(new RegExp(word, "g")) || []).length,
    0
  );
  const bearishCount = bearishWords.reduce(
    (count, word) =>
      count + (lowerContent.match(new RegExp(word, "g")) || []).length,
    0
  );

  let sentiment: { label: "Bullish" | "Bearish" | "Neutral"; color: string };
  if (bullishCount > bearishCount) {
    sentiment = {
      label: "Bullish" as const,
      color: "bg-green-100 text-green-800 border-green-300",
    };
  } else if (bearishCount > bullishCount) {
    sentiment = {
      label: "Bearish" as const,
      color: "bg-red-100 text-red-800 border-red-300",
    };
  } else {
    sentiment = {
      label: "Neutral" as const,
      color: "bg-gray-100 text-gray-800 border-gray-300",
    };
  }

  return {
    ticker: extractedTicker,
    content: cleanContent,
    chartUrl,
    sections,
    metrics,
    sentiment,
  };
};

// Mock data para testing
const MOCK_ANALYSIS_DATA: StockAnalysisResponse = {
  ticker: "AAPL",
  content: `https://r2.chart-img.com/20251006/tradingview/advanced-chart/ae23f8c0-481c-4267-8fa5-27dc46111ccf.png

1) Indicator Confluence (Stock Tool):
- MACD: 7.89 vs Signal 2.90 — positive, widening spread; bullish momentum strengthening
- RSI: 66.23 — bullish, below overbought; no bearish divergence indicated
- Volume: Expanding on the breakout in recent weeks, confirming participation
- Critical Levels:
  - Resistance: $260 (round/52-week high), then price discovery
  - Support: $252–$255 (breakout zone), $240 (recent shelf), $220 (prior base)
- Technical Outlook (4–12 weeks):
  - Bullish. Weekly close above $260 with firm volume would likely extend into $265–$275. A weekly close back below $240 would warn of a deeper retest toward $225–$220.
- Entry/Exit Considerations (illustrative, weekly timeframe):
  - Entries: Pullbacks into $252–$255; momentum add on weekly close >$260 with rising volume
  - Risk control: Reduce on weekly close <$240; trend invalidation on weekly close <$220
  - Profit-taking: Scale around $260–$265 on initial extension; trail if continuation holds and RSI approaches >70

2) Market Context & Sentiment
- News Landscape (Tavily):
  - Momentum and sentiment improved post iPhone 17 launch; AAPL turned positive YTD (CNBC, Sep 22, 2025)
  - Analyst actions: Tigress $305 PT (Sep 17); Bernstein SG initiated Outperform $290 (Sep 16); some cautious moves on Sep 11 (MarketMinute roundup)
  - Near-term catalyst: Q4 FY2025 earnings and Q1 FY2026 guide around late Oct 2025 (Nasdaq earnings page)
- Analyst/Expert Consensus:
  - Consensus PT cluster in mid-$240s per MarketMinute, with upside outliers to $290–$305; tone skewed constructive into earnings
- Sector/Market Performance:
  - AAPL lagged other megacaps earlier in 2025 due to perceived AI capex gap, but is catching up as hardware cycle and services strength underpin sentiment (CNBC)
- Sentiment Drivers:
  - Positive: iPhone 17 Pro mix/ASPs, services margins, massive buybacks, fresh Buy/Outperform initiations
  - Negative: China competition/ASP pressure, regulatory/tariff risks, premium valuation sensitivity to guidance

3) Integrated Investment Thesis
- Convergence Analysis:
  - Technicals: Breakout with bullish MACD/RSI and supportive volume favors upside continuation
  - Fundamentals: Premium multiples (P/E 36.3, EV/EBITDA 25.4) supported by elite profitability (net margin 24.3%, ROE ~150%) and robust FCF
  - Sentiment: Improving into earnings on analyst upgrades; key is sustainability of holiday-quarter demand and China performance
- Conflict Resolution:
  - Bull case: Strong holiday guide and favorable iPhone mix; weekly close >$260 with volume → $265–$275 near term
  - Bear case: Soft guide/China headwinds; weekly close <$240 → risk of $225–$220 retest and multiple compression
- Risk/Reward Assessment (1–3 months; confidence Medium):
  - Upside: Break/hold >$260 to $265–$275: ~45%
  - Base: Consolidate $250–$260 to digest gains: ~35%
  - Downside: Lose $240 on a weekly close → $225–$230 (risk to $220): ~20%
- Time Horizon Considerations:
  - Short-term (1–4 weeks): Expect tests of $260; buy shallow dips if breadth/volume hold
  - Medium-term (1–6 months): Path higher if guide and China trends cooperate; sustained closes >$260 keep the uptrend intact
- Action Items:
  - Monitor: Late-Oct earnings date and Q1 FY26 guide; iPhone 17 sell-through/lead times; China datapoints; services margin commentary
  - Price triggers: Add on weekly close >$260; buy dips near $252–$255 if momentum intact; reduce/hedge on weekly close <$240; reassess if <$220
  - Risk management: Use weekly closes to avoid noise; consider options overlays (e.g., covered calls into earnings; collars if protecting gains)

4) Sources and Data Notes
- Technicals: Stock Tool weekly analysis for NASDAQ:AAPL (last close $256.08; weekly +4.31%; MACD 7.89 vs 2.90; RSI 66.23; volume expanding). Chart embedded above.
- Market intelligence: Tavily Search
  - CNBC (AAPL turned positive YTD after iPhone 17)
  - MarketMinute via markets.financialcontent (analyst initiations/upgrades; PTs; risks; earnings timing)
  - AppleInsider (shares near 52-week high ~$260)
  - Nasdaq earnings page (timing reference)
- Financial metrics: Tavily Search
  - Yahoo Finance Key Statistics; Morningstar; Forbes; FullRatio (market cap, P/E, revenue, margins, ROE/ROA, cash/debt, current ratio)

Timestamp: Data and prices reflect sources accessed through Sep 22, 2025.`,
};

function App() {
  const [analysisData, setAnalysisData] =
    useState<StockAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false); // Toggle para mock data

  const handleAnalyze = async (ticker: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      // Si está activado el modo mock, usar datos de prueba
      if (useMockData) {
        // Simular delay de API
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setAnalysisData({
          ...MOCK_ANALYSIS_DATA,
          ticker: ticker.toUpperCase(),
        });
        return;
      }

      // 👇 Pasamos el ticker como query param
      const response = await fetch(
        `https://n8n-latest-45a4.onrender.com/webhook/a0ea8e36-8d95-453d-a776-6dbc9ce49b03?query=${encodeURIComponent(
          ticker
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        // Intentar obtener más detalles del error
        let errorDetails = `Error ${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorDetails += ` - ${errorText}`;
          }
        } catch (textError) {
          console.error("Could not read error response:", textError);
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      console.log("Received data:", data);
      console.log("Data type:", typeof data);
      console.log(
        "Data keys:",
        typeof data === "object" ? Object.keys(data) : "N/A"
      );
      console.log("Data structure:", JSON.stringify(data, null, 2));

      // Verificar si tiene las propiedades esperadas
      const hasValidStructure =
        typeof data === "object" &&
        data !== null &&
        (data.content || data.ticker || data.executiveSummary || data.output);

      if (!hasValidStructure) {
        console.warn(
          "La respuesta de la API no tiene la estructura esperada:",
          data
        );

        // Manejar el nuevo formato de array con objeto 'output'
        let rawContent: string = "";

        if (Array.isArray(data) && data.length > 0 && data[0].output) {
          rawContent = data[0].output;
        } else if (typeof data === "string") {
          rawContent = data;
        } else if (
          typeof data === "object" &&
          data !== null &&
          "myField" in data
        ) {
          const dataObj = data as Record<string, unknown>;
          rawContent = String(dataObj.myField);
        } else {
          throw new Error(
            `La API devolvió datos en formato inesperado. Estructura recibida: ${JSON.stringify(
              data
            )}`
          );
        }

        // Transformar el contenido markdown a la estructura JSON requerida
        const convertedData = transformMarkdownToJSON(rawContent, ticker);

        setAnalysisData(convertedData);
      } else {
        // La estructura es válida, usar como está
        const dataObj = data as Record<string, unknown>;
        const validData: StockAnalysisResponse = {
          ticker:
            typeof dataObj.ticker === "string"
              ? dataObj.ticker
              : ticker.toUpperCase(),
          content:
            (typeof dataObj.content === "string" ? dataObj.content : "") ||
            (typeof dataObj.output === "string" ? dataObj.output : "") ||
            "", // Asegurar que sea string
          ...dataObj,
        };
        setAnalysisData(validData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al conectar con el servidor";
      setError(errorMessage);
      console.error("Error fetching analysis:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for popular stocks display - REMOVED
  // const popularStocks = [...];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-400">Stock Analyzer</h1>

          {/* Mock Data Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">Modo Demo:</span>
            <button
              onClick={() => setUseMockData(!useMockData)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useMockData ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useMockData ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-400">
              {useMockData ? "Mock" : "API Real"}
            </span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-4">
            <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              BECOME A MILLO TODAY!
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get now <span className="text-gray-400">max profit</span>
            <br />
            <span className="text-gray-400"> on stocks </span>{" "}
            <span className="text-white">without effort</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-12">
            We have worked for Wall Street Banks and know banks have a
            information edge over you. It's time to level the playing field.
          </p>

          {/* Search Section */}
          <div className="mb-16">
            <SearchBar onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        </div>

        {/* Popular Stocks Section - REMOVED */}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <h3 className="text-red-300 font-medium">
                  Error al obtener el análisis
                </h3>
              </div>
              <p className="text-red-200 mt-2">{error}</p>
              <p className="text-red-300 text-sm mt-1">
                Por favor, verifica que el ticker sea válido e intenta
                nuevamente.
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisData && (
          <div className="max-w-6xl mx-auto">
            <AnalysisResult data={analysisData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
