export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
      {icon && <div className="mb-4 text-neutral-300">{icon}</div>}
      <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
      {description && <p className="mt-1 text-sm text-neutral-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-3 text-neutral-500">
        <svg className="h-5 w-5 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {message}
      </div>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-red-700">Error</h3>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4 text-xs">
          Try again
        </button>
      )}
    </div>
  );
}

export default EmptyState;
