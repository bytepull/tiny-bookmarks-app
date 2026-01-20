import { useState, useEffect, useRef } from 'react'
import './App.css'
import SettingsModal from './components/SettingsModal'

function App() {
  const [folders, setFolders] = useState([
    { id: 1, name: 'Work' },
    { id: 2, name: 'Personal' },
    { id: 3, name: 'Research' },
    { id: 4, name: 'Learning' },
  ])

  const [selectedFolderId, setSelectedFolderId] = useState(1)
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [folderNameError, setFolderNameError] = useState('')

  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

  const validateFolderName = (name: string): boolean => {
    if (folders.some((folder) => folder.name.toLowerCase() === name.toLowerCase())) {
      setFolderNameError('Folder name already exists')
      return false
    }
    setFolderNameError('')
    return true
  }

  const handleAddFolder = () => {
    if (validateFolderName(newFolderName)) {
      const newFolder = {
        id: Math.max(...folders.map((f) => f.id), 0) + 1,
        name: newFolderName,
      }
      setFolders([...folders, newFolder])
      setNewFolderName('')
      setFolderNameError('')
      setIsAddFolderModalOpen(false)
    }
  }

  const handleCancelModal = () => {
    setNewFolderName('')
    setFolderNameError('')
    setIsAddFolderModalOpen(false)
  }

  const canConfirmFolder = newFolderName.length >= 3 && !folderNameError

  const [hashtags] = useState([
    '#design',
    '#development',
    '#productivity',
    '#inspiration',
    '#resources',
    '#tutorial',
  ])

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false)
  const [bookmarkUrl, setBookmarkUrl] = useState('')
  const [bookmarkUrlError, setBookmarkUrlError] = useState('')
  const [bookmarkHashtagInput, setBookmarkHashtagInput] = useState('')
  const [bookmarkHashtags, setBookmarkHashtags] = useState<string[]>([])
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false)
  const [selectedFolderForBookmark, setSelectedFolderForBookmark] = useState<number>(selectedFolderId)
  const [folderSearchInput, setFolderSearchInput] = useState('')
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [serverUrl, setServerUrl] = useState('http://localhost:3000')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const validateUrl = (url: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([\da-z.]{2,6})(\/[\w .-]*)*\/?$/i
    if (urlRegex.test(url)) {
      setBookmarkUrlError('')
      return true
    } else {
      setBookmarkUrlError('Invalid URL')
      return false
    }
  }

  const filteredHashtags = hashtags.filter((tag) =>
    tag.toLowerCase().includes(bookmarkHashtagInput.toLowerCase()) &&
      !bookmarkHashtags.includes(tag)
  )

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(folderSearchInput.toLowerCase())
  )

  const handleAddHashtag = (tag: string) => {
    setBookmarkHashtags([...bookmarkHashtags, tag])
    setBookmarkHashtagInput('')
    setShowHashtagDropdown(false)
  }

  const handleRemoveHashtag = (tag: string) => {
    setBookmarkHashtags(bookmarkHashtags.filter((t) => t !== tag))
  }

  const handleAddBookmark = () => {
    if (!bookmarkUrl.trim() || !validateUrl(bookmarkUrl)) {
      setBookmarkUrlError('Please enter a valid URL')
      return
    }
    // TODO: Save bookmark to the selected folder with selected hashtags
    setBookmarkUrl('')
    setBookmarkUrlError('')
    setBookmarkHashtags([])
    setBookmarkHashtagInput('')
    setFolderSearchInput('')
    setSelectedFolderForBookmark(selectedFolderId)
    setIsAddBookmarkModalOpen(false)
  }

  const handleCancelBookmarkModal = () => {
    setBookmarkUrl('')
    setBookmarkUrlError('')
    setBookmarkHashtags([])
    setBookmarkHashtagInput('')
    setFolderSearchInput('')
    setSelectedFolderForBookmark(selectedFolderId)
    setShowHashtagDropdown(false)
    setShowFolderDropdown(false)
    setIsAddBookmarkModalOpen(false)
  }

  const canConfirmBookmark = bookmarkUrl.trim() && !bookmarkUrlError && bookmarkUrl.includes('.')

  const settingsButtonRef = useRef<HTMLDivElement>(null);

  const handleSettingsChange = (newServerUrl: string, newUsername: string, newPassword: string) => {
    setServerUrl(newServerUrl);
    setUsername(newUsername);
    setPassword(newPassword);
    // TODO: Save settings to local storage or backend
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export clicked');
  }

  const handleImport = (file: File) => {
    // TODO: Implement import functionality
    console.log('Import file:', file);
  }

  // ESC key to close settings modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSettingsMenuOpen) {
        setIsSettingsMenuOpen(false);
      }
    };
    
    if (isSettingsMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSettingsMenuOpen]);

  return (
    <div
      className={`h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : ""}`}
      // onClick={handleClickOutside}
    >
      {/* Top Menu Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Bookmarks
        </h1>
        
        <button
          onClick={() => setIsAddBookmarkModalOpen(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          + Add Bookmark
        </button>
        
        <div className="relative" ref={settingsButtonRef}>
          <button
            onClick={() => setIsSettingsMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            {/* Gear icon */}
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Folders */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-4">
              Folders
            </h2>
            <button
              onClick={() => setIsAddFolderModalOpen(true)}
              className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Folder
            </button>
            <nav className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium ${
                    selectedFolderId === folder.id
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {folder.name}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-6">
              Welcome to Bookmarks
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Select a folder or create a new bookmark to get started</p>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Hashtags */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Hashtags
            </h2>
            <div className="space-y-2">
              {hashtags.map((tag) => (
                <div
                  key={tag}
                  onClick={() => {
                    setSelectedHashtags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag],
                    );
                  }}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium ${
                    selectedHashtags.includes(tag)
                      ? "bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Add Folder Modal */}
      {isAddFolderModalOpen && (
        <>
          {/* Transparent Background Overlay */}
          <div
            className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
            onClick={handleCancelModal}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancelModal();
              }
            }}
            role="presentation"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-96 pointer-events-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Add New Folder
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => {
                    setNewFolderName(e.target.value);
                    if (e.target.value.length >= 3) {
                      validateFolderName(e.target.value);
                    } else {
                      setFolderNameError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelModal();
                    }
                  }}
                  placeholder="Enter folder name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                  autoFocus
                />
                {folderNameError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {folderNameError}
                  </p>
                )}
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancelModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFolder}
                  disabled={!canConfirmFolder}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    canConfirmFolder
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Bookmark Modal */}
      {isAddBookmarkModalOpen && (
        <>
          {/* Transparent Background Overlay */}
          <div
            className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
            onClick={handleCancelBookmarkModal}
            role="presentation"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-96 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Add New Bookmark
              </h2>

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={bookmarkUrl}
                  onChange={(e) => {
                    setBookmarkUrl(e.target.value);
                    if (e.target.value.trim()) {
                      validateUrl(e.target.value);
                    } else {
                      setBookmarkUrlError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelBookmarkModal();
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-green-500"
                  autoFocus
                />
                {bookmarkUrlError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {bookmarkUrlError}
                  </p>
                )}
              </div>

              {/* Hashtags Input */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={bookmarkHashtagInput}
                  onChange={(e) => {
                    setBookmarkHashtagInput(e.target.value);
                    setShowHashtagDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() =>
                    setShowHashtagDropdown(bookmarkHashtagInput.length > 0)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelBookmarkModal();
                    }
                  }}
                  placeholder="Type to search hashtags"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-green-500"
                />

                {/* Hashtag Dropdown */}
                {showHashtagDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                    {filteredHashtags.length > 0 ? (
                      filteredHashtags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleAddHashtag(tag)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                        >
                          {tag}
                        </button>
                      ))
                    ) : bookmarkHashtagInput.trim() ? (
                      <div className="px-4 py-3">
                        <button
                          onClick={() => {
                            const newTag = bookmarkHashtagInput.startsWith("#")
                              ? bookmarkHashtagInput
                              : `#${bookmarkHashtagInput}`;
                            handleAddHashtag(newTag);
                          }}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          + Add "{bookmarkHashtagInput}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Selected Hashtags */}
                {bookmarkHashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {bookmarkHashtags.map((tag) => (
                      <div
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveHashtag(tag)}
                          className="text-blue-700 hover:text-blue-900 font-bold dark:text-blue-200 dark:hover:text-blue-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Folder Selection */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Folder
                </label>
                <input
                  type="text"
                  value={folderSearchInput}
                  onChange={(e) => {
                    setFolderSearchInput(e.target.value);
                    setShowFolderDropdown(true);
                  }}
                  onFocus={() => setShowFolderDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelBookmarkModal();
                    }
                  }}
                  placeholder="Search or select folder"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-green-500"
                />

                {/* Folder Dropdown */}
                {showFolderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                    {filteredFolders.length > 0 ? (
                      filteredFolders.map((folder) => (
                        <button
                          key={folder.id}
                          onClick={() => {
                            setSelectedFolderForBookmark(folder.id);
                            setFolderSearchInput(folder.name);
                            setShowFolderDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 ${
                            selectedFolderForBookmark === folder.id
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                              : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {folder.name}
                        </button>
                      ))
                    ) : folderSearchInput.trim() ? (
                      <div className="px-4 py-3">
                        <button
                          onClick={() => setIsAddFolderModalOpen(true)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          + Create folder "{folderSearchInput}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Selected Folder Display */}
                {selectedFolderForBookmark && (
                  <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                    Selected:{" "}
                    <span className="font-medium">
                      {
                        folders.find((f) => f.id === selectedFolderForBookmark)
                          ?.name
                      }
                    </span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancelBookmarkModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBookmark}
                  disabled={!canConfirmBookmark}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    canConfirmBookmark
                      ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        serverUrl={serverUrl}
        username={username}
        password={password}
        onSettingsChange={handleSettingsChange}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
}

export default App
