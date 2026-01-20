import { useState } from 'react';

interface SettingsPaneProps {
  serverUrl: string;
  username: string;
  password: string;
  onSettingsChange: (serverUrl: string, username: string, password: string) => void;
}

export default function SettingsPane({ serverUrl: initialServerUrl, username: initialUsername, password: initialPassword, onSettingsChange }: SettingsPaneProps) {
  const [localServerUrl, setLocalServerUrl] = useState(initialServerUrl);
  const [localUsername, setLocalUsername] = useState(initialUsername);
  const [localPassword, setLocalPassword] = useState(initialPassword);
  const [isSaved, setIsSaved] = useState(false);
  const [savedServerUrl, setSavedServerUrl] = useState(initialServerUrl);
  const [savedUsername, setSavedUsername] = useState(initialUsername);
  const [savedPassword, setSavedPassword] = useState(initialPassword);

  // Check if there are unsaved changes
  const hasChanges = 
    localServerUrl !== savedServerUrl ||
    localUsername !== savedUsername ||
    localPassword !== savedPassword;

  // URL validation function
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      return false;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isUrlValid = validateUrl(localServerUrl);

  // Helper function to set cookie
  const setCookie = (name: string, value: string, days: number = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
  };

  const handleSave = () => {
    if (!isUrlValid || !hasChanges) {
      return;
    }

    // Save to cookies
    setCookie('bookmarks_serverUrl', localServerUrl);
    setCookie('bookmarks_username', localUsername);
    setCookie('bookmarks_password', localPassword);

    // Update saved values to match current values
    setSavedServerUrl(localServerUrl);
    setSavedUsername(localUsername);
    setSavedPassword(localPassword);

    onSettingsChange(localServerUrl, localUsername, localPassword);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Settings
      </h2>

      <div className="max-w-md space-y-6">
        {/* Server URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Server URL
          </label>
          <input
            type="text"
            value={localServerUrl}
            onChange={(e) => setLocalServerUrl(e.target.value)}
            placeholder="http://localhost:3000"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              !isUrlValid && localServerUrl.trim()
                ? 'border-red-300 dark:border-red-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-red-600 dark:focus:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-600 dark:focus:ring-blue-500'
            }`}
          />
          {!isUrlValid && localServerUrl.trim() && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">
              Please enter a valid URL (e.g., http://localhost:3000)
            </p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            type="text"
            value={localUsername}
            onChange={(e) => setLocalUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={!isUrlValid || !hasChanges}
            className={`w-full px-4 py-2 rounded-lg transition-colors font-medium ${
              isUrlValid && hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Save Settings
          </button>
          {isSaved && (
            <p className="text-green-600 dark:text-green-400 text-sm mt-2">
              ✓ Settings saved successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
