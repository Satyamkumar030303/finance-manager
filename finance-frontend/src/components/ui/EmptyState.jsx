export default function EmptyState({ icon: Icon, title, description, action, compact = false, bare = false }) {
  const wrapperClass = `${bare ? "" : "card "}${compact ? "py-10 px-5" : "py-16 px-6"} text-center flex flex-col items-center`;
  return (
    <div className={wrapperClass}>
      {Icon && (
        <div className={`${compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"} rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center`}>
          <Icon className="text-blue-600 dark:text-blue-400" size={compact ? 22 : 28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
