import { useState } from 'react';
import AddToWatchlistModal from './AddToWatchlistModal';

const VehicleDetailsModal = ({ isOpen, onClose, vehicle }) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  if (!isOpen || !vehicle) return null;

  const getStatusClass = (status) => {
    if (status === 'Verified') return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400';
    if (status === 'Pending') return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400';
    if (status === 'Blacklisted') return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 modal-backdrop z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Vehicle Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Info Cards - Stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vehicle Number</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{vehicle.vehicleNumber}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <span className={`inline-block px-2.5 py-1 ${getStatusClass(vehicle.status)} rounded text-xs font-semibold`}>
                {vehicle.status}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{vehicle.location}</p>
            </div>
          </div>

          {/* Images - Stacked on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vehicle Image</p>
              <img 
                src="/placeholder-vehicle.svg" 
                alt="Vehicle" 
                onClick={() => openImageModal('/placeholder-vehicle.svg')}
                className="w-full h-48 sm:h-56 object-cover rounded-lg border-2 border-gray-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity" 
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number Plate</p>
              <img 
                src="/placeholder-plate.svg" 
                alt="Plate" 
                onClick={() => openImageModal('/placeholder-plate.svg')}
                className="w-full h-48 sm:h-56 object-cover rounded-lg border-2 border-gray-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity" 
              />
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-5 bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>10:30 AM, Nov 10, 2025</span>
          </div>

          {/* Buttons - Stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              className="w-full px-5 py-3 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Fix Vehicle Number
            </button>
            <button 
              onClick={() => setShowWatchlistModal(true)}
              className="w-full px-5 py-3 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add to Watchlist
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-2 sm:p-4" 
          onClick={closeImageModal}
        >
          <button 
            onClick={closeImageModal}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Add to Watchlist Modal */}
      <AddToWatchlistModal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        vehicleNumber={vehicle?.vehicleNumber}
        onSuccess={(data) => {
          console.log('Added to watchlist:', data);
          // You can show a success toast here
        }}
      />
    </div>
  );
};

export default VehicleDetailsModal;
