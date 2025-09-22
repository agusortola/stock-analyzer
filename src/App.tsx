import { useState } from "react";
import SearchBar from "./components/SearchBar";
import AnalysisResult from "./components/AnalysisResult";
import type { StockAnalysisResponse } from "./types/api";

function App() {
  const [analysisData, setAnalysisData] =
    useState<StockAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (ticker: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
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

      const data: StockAnalysisResponse = await response.json();
      console.log("Received data:", data);
      setAnalysisData(data);
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
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold text-blue-400">
            Angu's Stock Analyzer
          </h1>
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
