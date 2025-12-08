const PageHeader = ({ title, description }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 pb-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
