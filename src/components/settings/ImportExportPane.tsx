interface ImportExportPaneProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function ImportExportPane({ onExport, onImport }: ImportExportPaneProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Import / Export
      </h2>

      <div className="max-w-md space-y-6">
        {/* Export Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Export Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download all your bookmarks as a JSON file
          </p>
          <button
            onClick={onExport}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Export
          </button>
        </div>

        {/* Import Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Import Data
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Upload a previously exported JSON file to restore your bookmarks
          </p>
          <label className="w-full">
            <button
              onClick={() => document.getElementById('import-file-input')?.click()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Choose File
            </button>
            <input
              id="import-file-input"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
