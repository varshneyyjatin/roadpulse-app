import { useEffect, useState } from 'react';
import { useAccessControl } from '../../contexts/AccessControl';
import { loadTabOrder } from '../../utils/tabOrderStorage';

const Topbar = ({ activeTab, setActiveTab }) => {
  const { accessControl, user } = useAccessControl();
  const [sortedTabs, setSortedTabs] = useState([]);

  // Initialize tabs with custom order from storage (user-specific) or default order
  useEffect(() => {
    if (accessControl?.tabs && user?.user_id) {
      const savedOrder = loadTabOrder(user.user_id);
      if (savedOrder) {
        const orderedTabs = [...accessControl.tabs].sort((a, b) => {
          const orderA = savedOrder[a.tab_id] ?? a.display_order;
          const orderB = savedOrder[b.tab_id] ?? b.display_order;
          return orderA - orderB;
        });
        setSortedTabs(orderedTabs);
      } else {
        // Use default order
        setSortedTabs([...accessControl.tabs].sort((a, b) => a.display_order - b.display_order));
      }
    }
  }, [accessControl?.tabs, user?.user_id]);

  if (!accessControl?.tabs) return null;

  return (
    <div className="bg-gray-100 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide">
          {sortedTabs.map((tab) => (
            <button
              key={tab.tab_id}
              onClick={() => setActiveTab(tab.tab_name)}
              className={`py-4 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.tab_name
                  ? 'border-gray-900 dark:border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.tab_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
