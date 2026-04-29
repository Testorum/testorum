export default function TestLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress bar skeleton */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
          <div className="h-full w-1/3 bg-violet-400 rounded-full animate-pulse" />
        </div>

        {/* Question card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4">
          {/* Question text skeleton */}
          <div className="space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse" />
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 animate-pulse" />
          </div>

          {/* Answer options skeleton */}
          <div className="space-y-3 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Brand mark */}
        <div className="flex justify-center mt-8">
          <div className="w-10 h-10 rounded-xl bg-violet-600 animate-pulse flex items-center justify-center">
            <span className="text-lg text-white font-bold">T</span>
          </div>
        </div>
      </div>
    </div>
  );
}
