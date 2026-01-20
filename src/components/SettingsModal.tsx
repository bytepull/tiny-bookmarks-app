import { useState } from "react";
import SettingsSidebar, { type MenuItemType } from "./SettingsSidebar";
import ThemePane from "./ThemePane";
import SettingsPane from "./SettingsPane";
import ImportExportPane from "./ImportExportPane";
import AboutPane from "./AboutPane";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  serverUrl: string;
  username: string;
  password: string;
  onSettingsChange: (
    serverUrl: string,
    username: string,
    password: string,
  ) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  serverUrl,
  username,
  password,
  onSettingsChange,
  onExport,
  onImport,
}: SettingsModalProps) {
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemType>("theme");

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-3/4 h-3/4 pointer-events-auto flex overflow-hidden relative">
          
          {/* Header */}
          <div className="absolute top-0 right-0 z-10 p-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sidebar */}
          <SettingsSidebar
            activeItem={activeMenuItem}
            onMenuItemClick={setActiveMenuItem}
          />

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
            {activeMenuItem === "theme" && (
              <ThemePane theme={theme} onThemeChange={onThemeChange} />
            )}
            {activeMenuItem === "settings" && (
              <SettingsPane
                serverUrl={serverUrl}
                username={username}
                password={password}
                onSettingsChange={onSettingsChange}
              />
            )}
            {activeMenuItem === "import-export" && (
              <ImportExportPane onExport={onExport} onImport={onImport} />
            )}
            {activeMenuItem === "about" && <AboutPane />}
          </div>
        </div>
      </div>
    </>
  );
}
