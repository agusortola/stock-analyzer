import { useState, type FC } from 'react';

interface SearchBarProps {
  onAnalyze: (ticker: string) => void;
  isLoading: boolean;
}

const SearchBar: FC<SearchBarProps> = ({ onAnalyze, isLoading }) => {
  const [ticker, setTicker] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim() && !isLoading) {
      onAnalyze(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-2">
            Ticker Symbol
          </label>
          <input
            id="ticker"
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Ej: AAPL, TSLA, BTC"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!ticker.trim() || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando...
            </>
          ) : (
            'Analizar'
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;