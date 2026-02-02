import { useState } from "react";
import { updateFolder, deleteFolder, type Folder } from "../../utils/remoteDataService";

interface AddFolderProps {
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  editFolder: Folder;
  onClose: () => void;
}

export default function EditFolder({
  folders,
  setFolders,
  editFolder,
  onClose,
}: AddFolderProps) {
  const [folderName, setFolderName] = useState(editFolder.name);
  const [folderError, setFolderError] = useState("");

  const canConfirmFolder = folderName.length >= 3 && !folderError;

  const handleCancelModal = () => {
    setFolderName("");
    setFolderError("");
    onClose();
  };

  const validateFolderName = (name: string): boolean => {
    if (!name.trim()) {
      setFolderError("Folder name cannot be empty");
      return false;
    }

    if (
      folders.some(
        (folder) => folder.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setFolderError("Folder name already exists");
      return false;
    }
    setFolderError("");
    return true;
  };

  const handleConfirm = async () => {
    const name = folderName.trim();

    if (validateFolderName(name)) {
      if (name === editFolder.name) {
        handleCancelModal();
        return;
      }

      try {
        // Update the folder in the backend
        const newFolder: Folder = {
          ...editFolder,
          name,
        };

        // console.log(editFolder);
        // console.log(newFolder);

        await updateFolder(newFolder);

        const updatedFolders = folders.map((folder) => {
          if (folder.id === newFolder.id) {
            return newFolder;
          }
          return folder;
        });

        setFolders(updatedFolders);

        handleCancelModal();
      } catch (error) {
        setFolderError((error as Error).message);
      }
    }
  };

  const handleDelete = async () => {
    const response = window.confirm(
      "Are you sure you want to delete this folder?",
    );

    if (!response) return;

    try {
      await deleteFolder(editFolder);

      const updatedFolders = folders.filter(
        (folder) => folder.id !== editFolder.id,
      );

      setFolders(updatedFolders);

      handleCancelModal();
    } catch (error) {
      setFolderError((error as Error).message);
    }
  };

  return (
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
            Edit Folder
          </h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (e.target.value.length >= 3) {
                  validateFolderName(e.target.value);
                } else {
                  setFolderError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                } else if (e.key === "Escape") {
                  handleCancelModal();
                }
              }}
              placeholder="Enter folder name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              autoFocus
            />
            {folderError && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                {folderError}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleCancelModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                canConfirmFolder
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
