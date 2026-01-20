import { useState, useEffect, useRef } from 'react'
import './App.css'
import SettingsModal from './components/SettingsModal'
import { fetchHashtags, fetchFolders, fetchBookmarks, updateHashtag, updateFolder } from './utils/remoteDataService'
import type { Hashtag, Folder, Bookmark } from './utils/remoteDataService'

interface FolderData extends Folder {
  id: number;
}

function App() {
  const [folders, setFolders] = useState<FolderData[]>([])
  const [foldersLoading, setFoldersLoading] = useState(true)
  const [foldersError, setFoldersError] = useState<string | null>(null)

  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)
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
      const newFolder: FolderData = {
        id: Math.max(...folders.map((f) => f.id), 0) + 1,
        name: newFolderName,
        bookmarks: [],
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

  const [hashtagsData, setHashtagsData] = useState<Hashtag[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagsLoading, setHashtagsLoading] = useState(true)
  const [hashtagsError, setHashtagsError] = useState<string | null>(null)

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [bookmarksLoading, setBookmarksLoading] = useState(true)
  const [bookmarksError, setBookmarksError] = useState<string | null>(null)

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false)
  const [bookmarkUrl, setBookmarkUrl] = useState('')
  const [bookmarkUrlError, setBookmarkUrlError] = useState('')
  const [bookmarkHashtagInput, setBookmarkHashtagInput] = useState('')
  const [bookmarkHashtags, setBookmarkHashtags] = useState<string[]>([])
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false)
  const [selectedFolderForBookmark, setSelectedFolderForBookmark] = useState<number | null>(null)
  const [folderSearchInput, setFolderSearchInput] = useState('')
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)

  const [isEditBookmarkModalOpen, setIsEditBookmarkModalOpen] = useState(false)
  const [selectedBookmarkForEdit, setSelectedBookmarkForEdit] = useState<Bookmark | null>(null)
  const [editBookmarkUrl, setEditBookmarkUrl] = useState('')
  const [editBookmarkTitle, setEditBookmarkTitle] = useState('')
  const [editBookmarkDescription, setEditBookmarkDescription] = useState('')
  const [editBookmarkUrlError, setEditBookmarkUrlError] = useState('')
  const [editBookmarkHashtagInput, setEditBookmarkHashtagInput] = useState('')
  const [editBookmarkHashtags, setEditBookmarkHashtags] = useState<string[]>([])
  const [showEditHashtagDropdown, setShowEditHashtagDropdown] = useState(false)
  const [selectedFolderForEditBookmark, setSelectedFolderForEditBookmark] = useState<number | null>(null)
  const [editFolderSearchInput, setEditFolderSearchInput] = useState('')
  const [showEditFolderDropdown, setShowEditFolderDropdown] = useState(false)

  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  const [isEditHashtagModalOpen, setIsEditHashtagModalOpen] = useState(false)
  const [selectedHashtagForEdit, setSelectedHashtagForEdit] = useState<string | null>(null)
  const [editHashtagName, setEditHashtagName] = useState('')
  const [editHashtagError, setEditHashtagError] = useState('')

  const [isEditFolderModalOpen, setIsEditFolderModalOpen] = useState(false)
  const [selectedFolderForEdit, setSelectedFolderForEdit] = useState<FolderData | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [editFolderError, setEditFolderError] = useState('')
  
  // Initialize settings from cookies
  const getCookieValue = (name: string): string => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(nameEQ)) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return '';
  };

  const [serverUrl, setServerUrl] = useState(() => getCookieValue('bookmarks_serverUrl') || 'http://localhost:3000')
  const [username, setUsername] = useState(() => getCookieValue('bookmarks_username') || '')
  const [password, setPassword] = useState(() => getCookieValue('bookmarks_password') || '')

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

  const handleEditBookmarkOpen = (bookmark: Bookmark) => {
    setSelectedBookmarkForEdit(bookmark)
    setEditBookmarkUrl(bookmark.url || '')
    setEditBookmarkTitle(bookmark.title || '')
    setEditBookmarkDescription(bookmark.description || '')
    setEditBookmarkHashtags([])
    setEditBookmarkHashtagInput('')
    setEditBookmarkUrlError('')
    setSelectedFolderForEditBookmark(selectedFolderId)
    setEditFolderSearchInput('')
    setShowEditHashtagDropdown(false)
    setShowEditFolderDropdown(false)
    setIsEditBookmarkModalOpen(true)
  }

  const handleCancelEditBookmarkModal = () => {
    setSelectedBookmarkForEdit(null)
    setEditBookmarkUrl('')
    setEditBookmarkTitle('')
    setEditBookmarkDescription('')
    setEditBookmarkUrlError('')
    setEditBookmarkHashtags([])
    setEditBookmarkHashtagInput('')
    setEditFolderSearchInput('')
    setSelectedFolderForEditBookmark(null)
    setShowEditHashtagDropdown(false)
    setShowEditFolderDropdown(false)
    setIsEditBookmarkModalOpen(false)
  }

  const handleEditAddHashtag = (tag: string) => {
    setEditBookmarkHashtags([...editBookmarkHashtags, tag])
    setEditBookmarkHashtagInput('')
    setShowEditHashtagDropdown(false)
  }

  const handleEditRemoveHashtag = (tag: string) => {
    setEditBookmarkHashtags(editBookmarkHashtags.filter((t) => t !== tag))
  }

  const handleSaveEditBookmark = () => {
    if (!editBookmarkUrl.trim() || !validateUrl(editBookmarkUrl)) {
      setEditBookmarkUrlError('Please enter a valid URL')
      return
    }
    // TODO: Save bookmark changes to the server
    handleCancelEditBookmarkModal()
  }

  const canConfirmEditBookmark = editBookmarkUrl.trim() && !editBookmarkUrlError && editBookmarkUrl.includes('.')

  const canConfirmBookmark = bookmarkUrl.trim() && !bookmarkUrlError && bookmarkUrl.includes('.')

  const handleCancelEditHashtagModal = () => {
    setSelectedHashtagForEdit(null)
    setEditHashtagName('')
    setEditHashtagError('')
    setIsEditHashtagModalOpen(false)
  }

  const handleSaveEditHashtag = async () => {
    if (!editHashtagName.trim()) {
      setEditHashtagError('Hashtag name cannot be empty')
      return
    }

    if (selectedHashtagForEdit === editHashtagName) {
      handleCancelEditHashtagModal()
      return
    }

    const newName = editHashtagName.startsWith('#') ? editHashtagName : `#${editHashtagName}`
    
    // Check if hashtag name already exists
    if (hashtags.some((tag) => tag.toLowerCase() === newName.toLowerCase() && tag !== selectedHashtagForEdit)) {
      setEditHashtagError('Hashtag already exists')
      return
    }

    try {
      // Find the old name without # to match the original data
      const oldName = selectedHashtagForEdit?.startsWith('#') ? selectedHashtagForEdit.slice(1) : selectedHashtagForEdit || ''
      const cleanNewName = newName.startsWith('#') ? newName.slice(1) : newName

      // Update hashtag via API
      await updateHashtag(oldName, cleanNewName)

      // Update local state
      setHashtags((prev) =>
        prev.map((tag) => (tag === selectedHashtagForEdit ? newName : tag))
      )

      handleCancelEditHashtagModal()
    } catch (error) {
      console.error('Failed to update hashtag:', error)
      setEditHashtagError(
        error instanceof Error ? error.message : 'Failed to update hashtag'
      )
    }
  }

  const handleCancelEditFolderModal = () => {
    setSelectedFolderForEdit(null)
    setEditFolderName('')
    setEditFolderError('')
    setIsEditFolderModalOpen(false)
  }

  const handleSaveEditFolder = async () => {
    if (!editFolderName.trim()) {
      setEditFolderError('Folder name cannot be empty')
      return
    }

    if (selectedFolderForEdit?.name === editFolderName) {
      handleCancelEditFolderModal()
      return
    }

    // Check if folder name already exists
    if (folders.some((folder) => folder.name.toLowerCase() === editFolderName.toLowerCase() && folder.id !== selectedFolderForEdit?.id)) {
      setEditFolderError('Folder name already exists')
      return
    }

    try {
      const oldName = selectedFolderForEdit?.name || ''

      // Update folder via API
      await updateFolder(oldName, editFolderName)

      // Update local state
      setFolders((prev) =>
        prev.map((folder) => 
          folder.id === selectedFolderForEdit?.id 
            ? { ...folder, name: editFolderName }
            : folder
        )
      )

      handleCancelEditFolderModal()
    } catch (error) {
      console.error('Failed to update folder:', error)
      setEditFolderError(
        error instanceof Error ? error.message : 'Failed to update folder'
      )
    }
  }

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

  // Load hashtags from remote server
  useEffect(() => {
    const loadHashtags = async () => {
      try {
        setHashtagsLoading(true);
        setHashtagsError(null);
        const data: Hashtag[] = await fetchHashtags();
        // Store raw data for filtering
        setHashtagsData(data);
        // Convert hashtag names to include # prefix for display
        const hashtagNames = data.map((tag) =>
          tag.name.startsWith('#') ? tag.name : `#${tag.name}`
        );
        setHashtags(hashtagNames);
      } catch (error) {
        console.error('Failed to load hashtags:', error);
        setHashtagsError(
          error instanceof Error ? error.message : 'Failed to load hashtags'
        );
        // Set empty array as fallback
        setHashtags([]);
      } finally {
        setHashtagsLoading(false);
      }
    };

    loadHashtags();
  }, [serverUrl, username, password]);

  // Load folders from remote server
  useEffect(() => {
    const loadFolders = async () => {
      try {
        setFoldersLoading(true);
        setFoldersError(null);
        const data: Folder[] = await fetchFolders();
        // Store folders with generated IDs
        const foldersWithIds: FolderData[] = data.map((folder, index) => ({
          id: index + 1,
          name: folder.name,
          bookmarks: folder.bookmarks,
        }));
        setFolders(foldersWithIds);
        // Set "All" as selected by default (null means all folders)
        setSelectedFolderId(null);
        setSelectedFolderForBookmark(foldersWithIds.length > 0 ? foldersWithIds[0].id : null);
      } catch (error) {
        console.error('Failed to load folders:', error);
        setFoldersError(
          error instanceof Error ? error.message : 'Failed to load folders'
        );
        // Set empty array as fallback
        setFolders([]);
      } finally {
        setFoldersLoading(false);
      }
    };

    loadFolders();
  }, [serverUrl, username, password]);

  // Load bookmarks from remote server
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        setBookmarksLoading(true);
        setBookmarksError(null);
        const data: Bookmark[] = await fetchBookmarks();
        setBookmarks(data);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        setBookmarksError(
          error instanceof Error ? error.message : 'Failed to load bookmarks'
        );
        // Set empty array as fallback
        setBookmarks([]);
      } finally {
        setBookmarksLoading(false);
      }
    };

    loadBookmarks();
  }, [serverUrl, username, password]);

  // Filter bookmarks based on selected folder and hashtags
  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  
  // First, filter by folder
  let filteredBookmarks = selectedFolder
    ? bookmarks.filter(b => selectedFolder.bookmarks.includes(b.id))
    : bookmarks;
  
  // Then, filter by selected hashtags
  if (selectedHashtags.length > 0) {
    // Get bookmark IDs from selected hashtags
    const bookmarkIdsFromHashtags = new Set<number>();
    selectedHashtags.forEach(selectedTag => {
      const tagData = hashtagsData.find(h => {
        const tagName = h.name.startsWith('#') ? h.name : `#${h.name}`;
        return tagName === selectedTag;
      });
      if (tagData) {
        tagData.bookmarks.forEach(id => bookmarkIdsFromHashtags.add(id));
      }
    });
    
    // Further filter to only include bookmarks in selected hashtags
    filteredBookmarks = filteredBookmarks.filter(b => 
      bookmarkIdsFromHashtags.has(b.id)
    );
  }

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
            {foldersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : foldersError ? (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                  {foldersError}
                </p>
                <button
                  onClick={() => {
                    setFoldersLoading(true);
                    fetchFolders()
                      .then((data: Folder[]) => {
                        const foldersWithIds: FolderData[] = data.map((folder, index) => ({
                          id: index + 1,
                          name: folder.name,
                          bookmarks: folder.bookmarks,
                        }));
                        setFolders(foldersWithIds);
                        setSelectedFolderId(null);
                        setSelectedFolderForBookmark(foldersWithIds.length > 0 ? foldersWithIds[0].id : null);
                        setFoldersError(null);
                      })
                      .catch((error) => {
                        setFoldersError(
                          error instanceof Error
                            ? error.message
                            : 'Failed to load folders'
                        );
                      })
                      .finally(() => setFoldersLoading(false));
                  }}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <nav className="space-y-2">
                {/* "All" item - always show */}
                <div
                  onClick={() => setSelectedFolderId(null)}
                  className={`px-4 py-3 rounded-lg cursor-pointer transition-colors font-medium ${
                    selectedFolderId === null
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  All
                </div>
                
                {/* Regular folders */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-between ${
                      selectedFolderId === folder.id
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex-1 cursor-pointer"
                    >
                      {folder.name}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFolderForEdit(folder);
                        setEditFolderName(folder.name);
                        setEditFolderError('');
                        setIsEditFolderModalOpen(true);
                      }}
                      className="ml-2 p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors shrink-0"
                      title="Edit folder"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Message when no folders exist */}
                {folders.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm px-4 py-2">
                    No folder exists yet
                  </p>
                )}
              </nav>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-6">
              Bookmarks
            </h2>
            {bookmarksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : bookmarksError ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">
                  {bookmarksError}
                </p>
                <button
                  onClick={() => {
                    setBookmarksLoading(true);
                    fetchBookmarks()
                      .then((data: Bookmark[]) => {
                        setBookmarks(data);
                        setBookmarksError(null);
                      })
                      .catch((error) => {
                        setBookmarksError(
                          error instanceof Error
                            ? error.message
                            : 'Failed to load bookmarks'
                        );
                      })
                      .finally(() => setBookmarksLoading(false));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No bookmark exists yet</p>
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
                <p>No bookmarks in this folder</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    onClick={() => handleEditBookmarkOpen(bookmark)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {bookmark.title || 'Untitled'}
                    </h3>
                    {bookmark.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                        {bookmark.description}
                      </p>
                    )}
                    {bookmark.url && (
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {bookmark.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Hashtags */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Hashtags
            </h2>
            {hashtagsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : hashtagsError ? (
              <div className="text-center">
                <p className="text-red-600 dark:text-red-400 text-sm mb-2">
                  {hashtagsError}
                </p>
                <button
                  onClick={() => {
                    setHashtagsLoading(true);
                    fetchHashtags()
                      .then((data: Hashtag[]) => {
                        setHashtagsData(data);
                        const hashtagNames = data.map((tag) =>
                          tag.name.startsWith('#') ? tag.name : `#${tag.name}`
                        );
                        setHashtags(hashtagNames);
                        setHashtagsError(null);
                      })
                      .catch((error) => {
                        setHashtagsError(
                          error instanceof Error
                            ? error.message
                            : 'Failed to load hashtags'
                        );
                      })
                      .finally(() => setHashtagsLoading(false));
                  }}
                  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : hashtags.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hashtags available
                </p>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setSelectedHashtags([])}
                  disabled={selectedHashtags.length === 0}
                  className={`w-full mb-4 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    selectedHashtags.length === 0
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                  }`}
                >
                  Clear
                </button>
                <div className="space-y-2">
                  {hashtags.map((tag) => (
                    <div
                      key={tag}
                      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-between ${
                        selectedHashtags.includes(tag)
                          ? "bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setSelectedHashtags((prev) =>
                            prev.includes(tag)
                              ? prev.filter((t) => t !== tag)
                              : [...prev, tag],
                          );
                        }}
                        className="flex-1 cursor-pointer"
                      >
                        {tag}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHashtagForEdit(tag);
                          setEditHashtagName(tag);
                          setEditHashtagError('');
                          setIsEditHashtagModalOpen(true);
                        }}
                        className="ml-2 p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors shrink-0"
                        title="Edit hashtag"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      {/* Edit Bookmark Modal */}
      {isEditBookmarkModalOpen && selectedBookmarkForEdit && (
        <>
          {/* Transparent Background Overlay */}
          <div
            className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
            onClick={handleCancelEditBookmarkModal}
            role="presentation"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-96 pointer-events-auto max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Edit Bookmark
              </h2>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editBookmarkTitle}
                  onChange={(e) => setEditBookmarkTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelEditBookmarkModal();
                    }
                  }}
                  placeholder="Bookmark title"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  value={editBookmarkUrl}
                  onChange={(e) => {
                    setEditBookmarkUrl(e.target.value);
                    if (e.target.value.trim()) {
                      validateUrl(e.target.value);
                    } else {
                      setEditBookmarkUrlError("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelEditBookmarkModal();
                    }
                  }}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                />
                {editBookmarkUrlError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {editBookmarkUrlError}
                  </p>
                )}
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editBookmarkDescription}
                  onChange={(e) => setEditBookmarkDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape" && !e.shiftKey) {
                      handleCancelEditBookmarkModal();
                    }
                  }}
                  placeholder="Add a description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Hashtags Input */}
              <div className="mb-6 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hashtags
                </label>
                <input
                  type="text"
                  value={editBookmarkHashtagInput}
                  onChange={(e) => {
                    setEditBookmarkHashtagInput(e.target.value);
                    setShowEditHashtagDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() =>
                    setShowEditHashtagDropdown(editBookmarkHashtagInput.length > 0)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelEditBookmarkModal();
                    }
                  }}
                  placeholder="Type to search hashtags"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
                />

                {/* Hashtag Dropdown */}
                {showEditHashtagDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                    {hashtags.filter((tag) =>
                      tag.toLowerCase().includes(editBookmarkHashtagInput.toLowerCase()) &&
                        !editBookmarkHashtags.includes(tag)
                    ).length > 0 ? (
                      hashtags
                        .filter((tag) =>
                          tag.toLowerCase().includes(editBookmarkHashtagInput.toLowerCase()) &&
                            !editBookmarkHashtags.includes(tag)
                        )
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleEditAddHashtag(tag)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </button>
                        ))
                    ) : editBookmarkHashtagInput.trim() ? (
                      <div className="px-4 py-3">
                        <button
                          onClick={() => {
                            const newTag = editBookmarkHashtagInput.startsWith("#")
                              ? editBookmarkHashtagInput
                              : `#${editBookmarkHashtagInput}`;
                            handleEditAddHashtag(newTag);
                          }}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          + Add "{editBookmarkHashtagInput}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Selected Hashtags */}
                {editBookmarkHashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {editBookmarkHashtags.map((tag) => (
                      <div
                        key={tag}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          onClick={() => handleEditRemoveHashtag(tag)}
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
                  value={editFolderSearchInput}
                  onChange={(e) => {
                    setEditFolderSearchInput(e.target.value);
                    setShowEditFolderDropdown(true);
                  }}
                  onFocus={() => setShowEditFolderDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleCancelEditBookmarkModal();
                    }
                  }}
                  placeholder="Search or select folder"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500"
                />

                {/* Folder Dropdown */}
                {showEditFolderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                    {folders
                      .filter((folder) =>
                        folder.name.toLowerCase().includes(editFolderSearchInput.toLowerCase())
                      )
                      .length > 0 ? (
                      folders
                        .filter((folder) =>
                          folder.name.toLowerCase().includes(editFolderSearchInput.toLowerCase())
                        )
                        .map((folder) => (
                          <button
                            key={folder.id}
                            onClick={() => {
                              setSelectedFolderForEditBookmark(folder.id);
                              setEditFolderSearchInput(folder.name);
                              setShowEditFolderDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 ${
                              selectedFolderForEditBookmark === folder.id
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                                : "hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {folder.name}
                          </button>
                        ))
                    ) : editFolderSearchInput.trim() ? (
                      <div className="px-4 py-3">
                        <button
                          onClick={() => setIsAddFolderModalOpen(true)}
                          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          + Create folder "{editFolderSearchInput}"
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Selected Folder Display */}
                {selectedFolderForEditBookmark && (
                  <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                    Selected:{" "}
                    <span className="font-medium">
                      {
                        folders.find((f) => f.id === selectedFolderForEditBookmark)
                          ?.name
                      }
                    </span>
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancelEditBookmarkModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditBookmark}
                  disabled={!canConfirmEditBookmark}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                    canConfirmEditBookmark
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Hashtag Modal */}
      {isEditHashtagModalOpen && (
        <>
          {/* Transparent Background Overlay */}
          <div
            className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
            onClick={handleCancelEditHashtagModal}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancelEditHashtagModal();
              }
            }}
            role="presentation"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-96 pointer-events-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Edit Hashtag
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hashtag Name
                </label>
                <input
                  type="text"
                  value={editHashtagName}
                  onChange={(e) => {
                    setEditHashtagName(e.target.value);
                    setEditHashtagError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEditHashtag();
                    } else if (e.key === "Escape") {
                      handleCancelEditHashtagModal();
                    }
                  }}
                  placeholder="Enter hashtag name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                  autoFocus
                />
                {editHashtagError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {editHashtagError}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancelEditHashtagModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditHashtag}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Folder Modal */}
      {isEditFolderModalOpen && (
        <>
          {/* Transparent Background Overlay */}
          <div
            className="fixed inset-0 bg-black dark:bg-black opacity-50 dark:bg-opacity-50 z-40"
            onClick={handleCancelEditFolderModal}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleCancelEditFolderModal();
              }
            }}
            role="presentation"
          />
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-96 pointer-events-auto">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Edit Folder
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={editFolderName}
                  onChange={(e) => {
                    setEditFolderName(e.target.value);
                    setEditFolderError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveEditFolder();
                    } else if (e.key === "Escape") {
                      handleCancelEditFolderModal();
                    }
                  }}
                  placeholder="Enter folder name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
                  autoFocus
                />
                {editFolderError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {editFolderError}
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCancelEditFolderModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditFolder}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Save
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
