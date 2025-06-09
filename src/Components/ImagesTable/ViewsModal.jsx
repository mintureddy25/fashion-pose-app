import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageViewerModal = ({
  viewerOpen,
  currentImage,
  currentViewIndex,
  setCurrentViewIndex,
  closeViewer,
}) => {
  if (!viewerOpen || !currentImage) return null;


   const viewTypes = [
    { key: 'full', label: 'Full View' },
    { key: 'neck', label: 'Neckline' },
    { key: 'sleeve', label: 'Sleeves' },
    { key: 'waist', label: 'Waist' },
    { key: 'length', label: 'Length' },
    { key: 'zoomed', label: 'Zoomed' }
  ];

  const fallbackImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';

    const nextView = () => {
    setCurrentViewIndex((prev) => (prev + 1) % viewTypes.length);
  };

  const prevView = () => {
    setCurrentViewIndex((prev) => (prev - 1 + viewTypes.length) % viewTypes.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Image Views</h3>
            <p className="text-sm text-gray-500">ID: {currentImage._id}</p>
          </div>
          <button
            onClick={closeViewer}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main View */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <img
                src={currentImage.views[viewTypes[currentViewIndex].key]}
                alt={viewTypes[currentViewIndex].label}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
              />

              {/* Arrows */}
              <button
                onClick={prevView}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextView}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-xl font-semibold text-gray-900 mt-4">
              {viewTypes[currentViewIndex].label}
            </h4>
          </div>

          {/* View Thumbnails */}
          <div className="grid grid-cols-6 gap-3">
            {viewTypes.map((viewType, index) => (
              <button
                key={viewType.key}
                onClick={() => setCurrentViewIndex(index)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentViewIndex === index
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 text-gray-600'
                }`}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-md mx-auto mb-2 overflow-hidden">
                    <img
                      src={currentImage.views[viewType.key]}
                      alt={viewType.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{viewType.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
