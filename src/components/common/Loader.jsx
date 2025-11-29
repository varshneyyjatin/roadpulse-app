import { useEffect, useState, useRef } from 'react';

const Loader = ({ message = 'Vehicle Detected', showDots = true, staticMode = false }) => {
  const [plateNumbers, setPlateNumbers] = useState({
    num1: 'M', num2: 'H', num3: '0', num4: '1', 
    num5: 'A', num6: 'B', num7: '1', num8: '2', 
    num9: '3', num10: '4'
  });
  
  const elementRefs = useRef({});

  useEffect(() => {
    if (staticMode) return; // Skip animation in static mode
    
    const numbers = '0123456789';
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const states = ['MH', 'DL', 'KA', 'TN', 'UP', 'GJ', 'RJ', 'WB', 'MP', 'HR'];

    const getRandomChar = (type) => {
      if (type === 'number') {
        return numbers[Math.floor(Math.random() * numbers.length)];
      } else {
        return letters[Math.floor(Math.random() * letters.length)];
      }
    };

    const getRandomState = () => {
      return states[Math.floor(Math.random() * states.length)];
    };

    const flipAndChange = (key, newValue) => {
      const element = elementRefs.current[key];
      if (element) {
        element.classList.add('number-flip');
        
        setTimeout(() => {
          setPlateNumbers(prev => ({
            ...prev,
            [key]: newValue
          }));
        }, 200);

        setTimeout(() => {
          element.classList.remove('number-flip');
        }, 400);
      }
    };

    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex === 0 || currentIndex === 1) {
        const state = getRandomState();
        flipAndChange('num1', state[0]);
        flipAndChange('num2', state[1]);
        currentIndex = 2;
      } else if (currentIndex === 2) {
        flipAndChange('num3', getRandomChar('number'));
        currentIndex++;
      } else if (currentIndex === 3) {
        flipAndChange('num4', getRandomChar('number'));
        currentIndex++;
      } else if (currentIndex === 4) {
        flipAndChange('num5', getRandomChar('letter'));
        currentIndex++;
      } else if (currentIndex === 5) {
        flipAndChange('num6', getRandomChar('letter'));
        currentIndex++;
      } else if (currentIndex === 6) {
        flipAndChange('num7', getRandomChar('number'));
        currentIndex++;
      } else if (currentIndex === 7) {
        flipAndChange('num8', getRandomChar('number'));
        currentIndex++;
      } else if (currentIndex === 8) {
        flipAndChange('num9', getRandomChar('number'));
        currentIndex++;
      } else if (currentIndex === 9) {
        flipAndChange('num10', getRandomChar('number'));
        currentIndex = 0;
      }
    }, 300);

    return () => clearInterval(interval);
  }, [staticMode]);

  return (
    <div className="relative">
      {/* Number Plate Container */}
      <div className="relative">
        {/* Number Plate - Indian Design */}
        <div 
          className="w-[300px] h-[60px] bg-white dark:bg-slate-800 shadow-sm border-[0.5px] border-gray-300 dark:border-slate-600 flex items-center justify-between px-3 relative"
          style={{ borderRadius: '6px' }}
        >
          {/* Left Section - Blue Strip with IND */}
          <div 
            className="flex flex-col items-center justify-center bg-blue-600 text-white px-2 rounded"
            style={{ height: '32px', width: '32px' }}
          >
            <div className="text-[13px] font-bold">IND</div>
          </div>

          {/* Right Section - Number Plate Number */}
          <div className="flex-1 flex flex-col items-center justify-center ml-2 overflow-hidden">
            {/* Number in single line */}
            <div 
              className="flex items-center justify-center text-[28px] font-semibold text-gray-900 dark:text-white"
              style={{ letterSpacing: '0.5px', gap: '0.5px' }}
            >
              {staticMode ? (
                // Static mode - show dashes
                <>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center"> </span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center"> </span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center">-</span>
                  <span className="min-w-[22px] text-center">-</span>
                </>
              ) : (
                // Animated mode
                Object.keys(plateNumbers).map((key) => (
                  <span
                    key={key}
                    ref={(el) => (elementRefs.current[key] = el)}
                    className="number-animate"
                  >
                    {plateNumbers[key]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Dots */}
      {showDots && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg"></div>
          <div 
            className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div 
            className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full animate-bounce shadow-lg"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      )}
    </div>
  );
};

// Full Page Loader - Fixed position overlay
export const FullPageLoader = ({ message = 'Vehicle Detected' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50">
      <Loader message={message} />
    </div>
  );
};

// Inline Loader (for buttons, cards, etc.)
export const InlineLoader = ({ message = 'Vehicle Detected' }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <Loader message={message} />
    </div>
  );
};

export default Loader;
