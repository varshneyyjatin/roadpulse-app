const PageHeader = ({ title, description, icon }) => {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
