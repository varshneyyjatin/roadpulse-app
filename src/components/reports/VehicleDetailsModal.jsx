import { useState } from 'react';

const VehicleDetailsModal = ({ isOpen, onClose, vehicleData, getPlateImage, getVehicleImage, canDownload }) => {
  const [downloading, setDownloading] = useState(false);
  
  if (!isOpen || !vehicleData) return null;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateStr, time: timeStr };
  };

  const { date, time } = formatTimestamp(vehicleData.timestamp);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const element = document.getElementById('vehicle-details-content');
      if (!element) return;

      // Wait for images to load
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            // Force reload with crossOrigin
            if (!img.crossOrigin) {
              img.crossOrigin = 'anonymous';
              const src = img.src;
              img.src = '';
              img.src = src;
            }
          });
        })
      );

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true
      });

      // Add padding to canvas
      const paddedCanvas = document.createElement('canvas');
      const padding = 40;
      paddedCanvas.width = canvas.width + (padding * 2);
      paddedCanvas.height = canvas.height + (padding * 2);

      const ctx = paddedCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
      ctx.drawImage(canvas, padding, padding);

      const link = document.createElement('a');
      link.download = `vehicle-${vehicleData.plate_number}-${Date.now()}.png`;
      link.href = paddedCanvas.toDataURL('image/png');
      link.click();
      
      // Success notification
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg z-[100] animate-fadeIn';
      successDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span class="font-semibold">Image downloaded successfully!</span>
        </div>
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Show a better error notification
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg shadow-lg z-[100] animate-shake';
      errorDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="font-semibold">Failed to download image. Please try again.</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col"
        style={{ height: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 min-h-0 overflow-hidden">
          <div id="vehicle-details-content" className="h-full grid grid-cols-12 gap-5 overflow-hidden">

            {/* Left - Vehicle Image */}
            <div className="col-span-9 h-full overflow-hidden">
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl h-full p-4 flex items-center justify-center">
                <img
                  src={getVehicleImage(vehicleData)}
                  alt="Vehicle"
                  onError={(e) => {
                    console.error('Failed to load vehicle image, using placeholder');
                    e.target.src = '/placeholder-vehicle.svg';
                  }}
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Right - Details */}
            <div className="col-span-3 h-full flex flex-col overflow-hidden gap-3">

              {/* Number Plate */}
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 flex-shrink-0" style={{ height: '35%' }}>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Number Plate</p>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-2 flex items-center justify-center overflow-hidden" style={{ height: 'calc(100% - 24px)' }}>
                  <img
                    src={getPlateImage(vehicleData)}
                    alt="Plate"
                    onError={(e) => {
                      console.error('Failed to load plate image, using placeholder');
                      e.target.src = '/placeholder-plate.svg';
                    }}
                    crossOrigin="anonymous"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>

              {/* Details Card */}
              <div className="flex-1 bg-gray-50 dark:bg-slate-900 rounded-xl p-3 overflow-hidden flex items-center justify-center">
                <div className="w-full flex flex-col justify-between">

                  {/* Plate Number */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Plate Number</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{vehicleData.plate_number}</p>
                  </div>

                  {/* Separator */}
                  <div className="my-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                  </div>

                  {/* Location */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Location</p>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{vehicleData.location_name}</p>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="my-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                  </div>

                  {/* Checkpoint */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Checkpoint</p>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{vehicleData.checkpoint_name}</p>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="my-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex-shrink-0 text-center">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Timestamp</p>
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{date}</p>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400">{time}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex-shrink-0 rounded-b-2xl">
          {canDownload && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-6 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold rounded-lg flex items-center gap-2 border border-green-200 dark:border-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-700 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded-lg border border-blue-200 dark:border-blue-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
