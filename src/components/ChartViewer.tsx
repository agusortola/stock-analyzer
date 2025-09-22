import { useState, type FC } from 'react';

interface ChartViewerProps {
  chartUrl: string;
  ticker: string;
}

const ChartViewer: FC<ChartViewerProps> = ({ chartUrl, ticker }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        Gráfico de {ticker}
      </h3>
      
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600">Cargando gráfico...</span>
            </div>
          </div>
        )}
        
        {imageError && (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center text-gray-500">
              <svg className="h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Error al cargar el gráfico</span>
              <button 
                onClick={() => {
                  setImageError(false);
                  setImageLoaded(false);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}
        
        <img
          src={chartUrl}
          alt={`Gráfico de ${ticker}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-auto rounded-lg transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
          }`}
        />
      </div>
    </div>
  );
};

export default ChartViewer;