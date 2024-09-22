"use client";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext"; // Import AuthContext
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import ReactQuill styles

// Custom toolbar for ReactQuill, enabling image uploads
const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"], // Enable image upload in the toolbar
    ["clean"],
  ],
};

export default function HomePage() {
  const { isLoggedIn, role, userId } = useAuth(); // Get role and userId from AuthContext
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [coverImage, setCoverImage] = useState(null); // For cover image upload
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // State for loading indication
  const [error, setError] = useState(""); // State for capturing any errors

  // Fetch announcements from backend
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };
 // Handle bookmarking/unbookmarking
  const handleBookmarkAnnouncement = async (id) => {
    try {
      await fetch(`/api/announcements/bookmark/${id}`, { method: "POST" });
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann._id === id
            ? {
                ...ann,
                bookmarkedBy: ann.bookmarkedBy.includes(userId)
                  ? ann.bookmarkedBy.filter((uid) => uid !== userId) // Unbookmark
                  : [...ann.bookmarkedBy, userId], // Bookmark
              }
            : ann
        )
      );
    } catch (error) {
      console.error("Error bookmarking announcement:", error);
    }

  // Handle cover image change
  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  // Add or edit announcement (Admin Only)
  const handleSaveAnnouncement = async () => {
    setIsLoading(true); // Indicate loading state
    setError(""); // Clear any previous errors

    try {
      const formData = new FormData(); // Use FormData for file upload
      formData.append("title", newAnnouncement.title);
      formData.append("content", newAnnouncement.content);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const method = editingAnnouncement ? "PUT" : "POST";
      const url = editingAnnouncement
        ? `/api/announcements/edit/${editingAnnouncement._id}`
        : "/api/announcements/create";

      const response = await fetch(url, {
        method,
        body: formData, // Send FormData with the request
      });

      if (!response.ok) {
        throw new Error("Failed to save announcement");
      }

      const updatedAnnouncement = await response.json();

      setAnnouncements((prev) => {
        if (editingAnnouncement) {
          return prev.map((ann) => (ann._id === updatedAnnouncement._id ? updatedAnnouncement : ann));
        } else {
          return [updatedAnnouncement, ...prev];
        }
      });

      // Reset the form and fetch the updated list
      setNewAnnouncement({ title: "", content: "" });
      setCoverImage(null);
      setEditingAnnouncement(null);
      fetchAnnouncements(); // Fetch updated announcements after adding/editing
    } catch (error) {
      console.error("Error saving announcement:", error);
      setError("Error saving announcement. Please try again.");
    } finally {
      setIsLoading(false); // End loading state
    }
  };

  // Delete announcement (Admin Only)
  const handleDeleteAnnouncement = async (id) => {
    try {
      await fetch(`/api/announcements/delete/${id}`, { method: "DELETE" });
      setAnnouncements((prev) => prev.filter((ann) => ann._id !== id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  // Bookmark an announcement (for all users)
  const handleBookmarkAnnouncement = async (id) => {
    await fetch(`/api/announcements/bookmark/${id}`, { method: "POST" });

    setAnnouncements((prev) =>
      prev.map((ann) =>
        ann._id === id
          ? {
              ...ann,
              bookmarkedBy: ann.bookmarkedBy.includes(userId)
                ? ann.bookmarkedBy.filter((uid) => uid !== userId) // Unbookmark
                : [...ann.bookmarkedBy, userId], // Bookmark
            }
          : ann
      )
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-5xl font-extrabold text-center text-gray-800 mb-8">
        AU Connect Announcements
      </h1>

      {/* Admin Section: Add/Edit Announcement */}
      {role === "admin" && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-semibold mb-6">
            {editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
          </h2>

          {/* Title Input */}
          <label className="block text-xl font-medium mb-2">Title</label>
          <input
            type="text"
            placeholder="Title"
            className="mb-4 p-3 border rounded w-full focus:ring focus:border-blue-300"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
          />

          {/* Content Input */}
          <label className="block text-xl font-medium mb-2">Content</label>
          <ReactQuill
            value={newAnnouncement.content}
            onChange={(content) => setNewAnnouncement({ ...newAnnouncement, content })}
            className="mb-4"
            modules={modules} // Enable custom toolbar with image upload
          />

          {/* Cover Image Input */}
          <label className="block text-xl font-medium mb-2">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverImageChange}
            className="mb-4 p-3 border rounded w-full focus:ring focus:border-blue-300"
          />

          <button
            onClick={handleSaveAnnouncement}
            className={`w-full py-3 mt-4 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {editingAnnouncement ? "Update Announcement" : "Add Announcement"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}

      {/* Announcement List */}
      <h2 className="text-4xl font-semibold mb-6">Latest Announcements</h2>
      {announcements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl"
            >
              {/* Display the cover image if it exists */}
              {announcement.coverImage && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={`http://localhost:5000${announcement.coverImage}`}
                    alt={announcement.title}
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}

              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {announcement.title}
                </h3>
                <div
                  className="text-gray-700 mb-4"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
                <p className="text-sm text-gray-500">
                  Posted on: {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 flex items-center justify-between bg-gray-100">
                {/* Bookmark Button */}
                {isLoggedIn && (
                  <button
                  onClick={() => handleBookmarkAnnouncement(announcement._id)}
                  className={`py-2 px-4 font-bold rounded ${
                    announcement.bookmarkedBy.includes(userId)
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {announcement.bookmarkedBy.includes(userId)
                    ? "Unbookmark"
                    : "Bookmark"}
                </button>
                )}

                {/* Admin Controls: Edit/Delete */}
                {role === "admin" && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setEditingAnnouncement(announcement);
                        setNewAnnouncement({
                          title: announcement.title,
                          content: announcement.content,
                        });
                      }}
                      className="py-2 px-4 bg-green-500 hover:bg-green-700 text-white font-bold rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="py-2 px-4 bg-red-500 hover:bg-red-700 text-white font-bold rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-lg font-medium text-gray-500 text-center">No announcements available.</p>
      )}
    </div>
  );
}
