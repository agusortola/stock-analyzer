import { useState } from 'react';
import SearchBar from './components/SearchBar';
import AnalysisResult from './components/AnalysisResult';
import type { StockAnalysisResponse } from './types/api';

function App() {
  const [analysisData, setAnalysisData] = useState<StockAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (ticker: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const response = await fetch('https://n8n-latest-45a4.onrender.com/webhook/a0ea8e36-8d95-453d-a776-6dbc9ce49b03', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: ticker }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: StockAnalysisResponse = await response.json();
      setAnalysisData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al conectar con el servidor';
      setError(errorMessage);
      console.error('Error fetching analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Stock Analyzer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Obtén análisis completos de acciones, criptomonedas y otros instrumentos financieros
          </p>
        </header>

        {/* Search Section */}
        <div className="mb-12">
          <SearchBar onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-red-800 font-medium">Error al obtener el análisis</h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <p className="text-red-600 text-sm mt-1">
                Por favor, verifica que el ticker sea válido e intenta nuevamente.
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisData && (
          <div className="mb-8">
            <AnalysisResult data={analysisData} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-16">
          <p>Powered by n8n webhook integration</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
