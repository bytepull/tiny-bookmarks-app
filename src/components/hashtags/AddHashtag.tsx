import { useState } from "react";
import { addHashtag, type Hashtag } from "../../utils/remoteDataService";

interface AddHashtagProps {
  hashtags: Hashtag[];
  setHashtags: React.Dispatch<React.SetStateAction<Hashtag[]>>;
  onClose: () => void;
}

export default function AddHashtag({ hashtags, setHashtags, onClose }: AddHashtagProps) {
  const [newHashtagName, setNewHashtagName] = useState("");
  const [folderError, setHashtagError] = useState("");

  const handleCancelModal = () => {
    setNewHashtagName("");
    setHashtagError("");
    onClose();
  };

  const validateHashtagName = (name: string): boolean => {
    if (
      hashtags.some(
        (hashtag) => hashtag.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setHashtagError("hashtag name already exists");
      return false;
    }
    setHashtagError("");
    return true;
  };

  const handleConfirm = async () => {
    const folderName = newHashtagName.trim();

    if (validateHashtagName(folderName)) {
      try {
        const folderData: Hashtag = await addHashtag(folderName);
        setHashtags([...hashtags, folderData]);
        handleCancelModal();
        console.log("hashtag created successfully!");
      } catch (error) {
        setHashtagError((error as Error).message);
      }
    }
  };

  const canConfirmFolder = newHashtagName.length >= 3 && !folderError;

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
            Add New Hashtag
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hashtag Name
            </label>
            <input
              type="text"
              value={newHashtagName}
              onChange={(e) => {
                setNewHashtagName(e.target.value);
                if (e.target.value.length >= 3) {
                  validateHashtagName(e.target.value);
                } else {
                  setHashtagError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  handleCancelModal();
                }
              }}
              placeholder="Enter hashtag name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              autoFocus
            />
            {folderError && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                {folderError}
              </p>
            )}
          </div>

          {/* Buttons for adding and canceling the modal */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleCancelModal}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
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
  );
}
