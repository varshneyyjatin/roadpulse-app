const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-8 md:mt-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left: Copyright */}
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">ANPR System</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 All rights reserved</p>
          </div>

          {/* Right: Powered by */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Powered by</span>
            <img src="/src/assets/transline-logo.png" alt="Transline" className="h-7 lg:h-8 opacity-80 hover:opacity-100 transition dark:hidden" />
            <img src="/src/assets/transline-white-logo.png" alt="Transline" className="h-7 lg:h-8 opacity-80 hover:opacity-100 transition hidden dark:block" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Top: Copyright */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">ANPR System</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2025 All rights reserved</p>
          </div>

          {/* Bottom: Powered by */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">Powered by</span>
            <img src="/src/assets/transline-logo.png" alt="Transline" className="h-5 opacity-80 dark:hidden" />
            <img src="/src/assets/transline-white-logo.png" alt="Transline" className="h-5 opacity-80 hidden dark:block" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
