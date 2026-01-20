export default function AboutPane() {
  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
          About
        </h2>

        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Application
            </h3>
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              Tiny Bookmarks App
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Version
            </h3>
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              1.0.0
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Developer(s)
            </h3>
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              Luca
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Repository
            </h3>
            <a
              href="https://github.com/bytepull/tiny-bookmarks-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              GitHub
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
              License
            </h3>
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              MIT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
