import { useState } from "react";
import {
  updateHashtag,
  deleteHashtag,
  type Hashtag,
} from "../../utils/remoteDataService";

interface EditHashtagProps {
  hashtags: Hashtag[];
  setHashtags: React.Dispatch<React.SetStateAction<Hashtag[]>>;
  editHastag: Hashtag;
  onClose: () => void;
}

export default function EditHashtag({
  hashtags,
  setHashtags,
  editHastag,
  onClose,
}: EditHashtagProps) {
  const [hashtagName, setHashtagName] = useState(editHastag.name);
  const [validationResult, setValidationResult] = useState(false);
  const [error, setError] = useState("");

  const handleCancelModal = onClose;

  const validateHashtagName = (): void => {
    const name = hashtagName.trim();

    if (!name) {
      setValidationResult(false);
      setError("Hashtag name cannot be empty");
    }

    if (
      hashtags.some(
        (hashtag) => hashtag.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setValidationResult(false);
      setError("Hashtag name already exists");
    }

    setValidationResult(true);
    setError("");
    return;
  };

  const handleConfirm = async () => {
    setHashtagName((prev) => prev.trim());

    if (validationResult) {
      try {
        // Update the hashtag in the backend
        const newHashtag: Hashtag = {
          ...editHastag,
          name: hashtagName,
        };

        await updateHashtag(newHashtag);

        const updatedHashtags = hashtags.map((hashtag) => {
          if (hashtag.id === newHashtag.id) {
            return newHashtag;
          }
          return hashtag;
        });

        setHashtags(updatedHashtags);

        handleCancelModal();
      } catch (error) {
        setError((error as Error).message);
      }
    }
  };

  const handleDelete = async () => {
    const response = window.confirm(
      "Are you sure you want to delete this hashtag?",
    );

    if (!response) return;

    try {
      await deleteHashtag(editHastag);

      const updatedHashtags = hashtags.filter(
        (hashtag) => hashtag.id !== editHastag.id,
      );

      setHashtags(updatedHashtags);

      handleCancelModal();
    } catch (error) {
      setError((error as Error).message);
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
            Edit Hashtag
          </h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hashtag Name
            </label>
            <input
              type="text"
              value={hashtagName}
              onChange={(e) => {
                setHashtagName(e.target.value);
                const name = e.target.value.trim();
                if (name.length >= 3) {
                  validateHashtagName();
                } else {
                  setError("");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                } else if (e.key === "Escape") {
                  handleCancelModal();
                }
              }}
              placeholder="Enter hashtag name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500"
              autoFocus
            />
            {!validationResult && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                {error}
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
              disabled={validationResult}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
                !validationResult
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
