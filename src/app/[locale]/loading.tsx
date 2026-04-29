export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing Logo / Brand Mark */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-violet-600 animate-pulse flex items-center justify-center">
            <span className="text-2xl text-white font-bold">T</span>
          </div>
          {/* Outer ring animation */}
          <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-violet-400 animate-ping opacity-20" />
        </div>

        {/* Loading text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
