import { useState, type FC } from "react";

interface SearchBarProps {
  onAnalyze: (ticker: string) => void;
  isLoading: boolean;
}

const SearchBar: FC<SearchBarProps> = ({ onAnalyze, isLoading }) => {
  const [ticker, setTicker] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onAnalyze(ticker.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Symbol or company"
            className="w-full pl-12 pr-32 py-4 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">⌘</kbd>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">K</kbd>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !ticker.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-sm">
          Try searching for stocks like AAPL, TSLA, BTC, etc. And please be
          patient, the stock analysis may take a few moments to complete…
        </p>
        <p className="text-gray-400 text-sm-extra-bold"></p>
      </div>
    </div>
  );
};

export default SearchBar;
