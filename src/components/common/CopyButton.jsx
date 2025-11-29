import { useState } from 'react';

const CopyButton = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err2) {
        console.error('Fallback copy failed:', err2);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`font-mono font-bold text-sm transition-all hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 ${className}`}
      >
        {text}
      </button>
      
      {/* Hover Tooltip - Click to copy */}
      {showTooltip && !copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 animate-fadeIn">
          Click to copy
        </span>
      )}
      
      {/* Success Message - Copied! */}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap z-50 animate-fadeIn">
          Copied!
        </span>
      )}
    </div>
  );
};

export default CopyButton;
