import { useAccessControl } from '../../contexts/AccessControl';

const Drivers = () => {
  const { getTabComponents, user } = useAccessControl();
  const components = getTabComponents('Drivers');

  return (
    <div className="bg-white dark:bg-transparent min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Driver Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage driver information</p>
        </div>

        {components.map((component) => {
          if (!component.permissions.can_view) return null;
          
          return (
            <div key={component.component_id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{component.component_name}</h2>
              <p className="text-gray-600 dark:text-gray-300">{component.component_description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Drivers;
