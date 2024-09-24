"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "./AuthContext"; // Import AuthContext
import "quill/dist/quill.snow.css"; // Correct path for Quill styles
import Image from "next/image"; // Import Image from next/image

// Dynamically import ReactQuill (client-side only)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [coverImage, setCoverImage] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(21);
  const [isMobile, setIsMobile] = useState(false);
  const [loadMoreCount, setLoadMoreCount] = useState(6);

  // Fetch announcements from backend
  useEffect(() => {
    fetchAnnouncements();
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let updatedAnnouncements = announcements.filter((announcement) =>
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort by title or date
    if (sortOption === "title") {
      updatedAnnouncements.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "newest") {
      updatedAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      updatedAnnouncements.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredAnnouncements(updatedAnnouncements);
  }, [searchTerm, sortOption, announcements]);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }
      const data = await response.json();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements. Please try again later.");
    }
  };

  // Handle cover image change
  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  // Add or edit announcement (Admin Only)
  const handleSaveAnnouncement = async () => {
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
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
        body: formData,
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

      setNewAnnouncement({ title: "", content: "" });
      setCoverImage(null);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      setError("Error saving announcement. Please try again.");
    } finally {
      setIsLoading(false);
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

  // Detect mobile device
  const handleResize = () => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768);
    }
  };

  // Load more for mobile
  const handleLoadMore = () => {
    setLoadMoreCount((prevCount) => prevCount + 6);
  };

  // Pagination logic
  const totalPages = Math.max(Math.ceil(filteredAnnouncements.length / itemsPerPage), 1);
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, filteredAnnouncements.length);
  const indexOfFirstItem = Math.max(0, indexOfLastItem - itemsPerPage);
  const currentItems = filteredAnnouncements.slice(indexOfFirstItem, indexOfLastItem);

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

      {/* Search Bar and Sort Dropdown */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          className="p-3 border rounded w-full md:w-1/3 mb-4 md:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-3 border rounded w-full md:w-1/5"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Announcement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {currentItems.map((announcement) => (
          <div key={announcement._id} className="bg-white shadow-lg rounded-lg p-4">
            <h3 className="text-2xl font-bold">{announcement.title}</h3>
            {announcement.coverImage && (
              <Image
                src={announcement.coverImage}
                alt={announcement.title}
                width={500}
                height={300}
                className="mb-4 rounded"
              />
            )}
            <div
              className="mb-4"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
            <p className="text-gray-500 text-sm">{new Date(announcement.createdAt).toLocaleDateString()}</p>

            {role === "admin" && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setEditingAnnouncement(announcement);
                    setNewAnnouncement({ title: announcement.title, content: announcement.content });
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAnnouncement(announcement._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {isMobile && loadMoreCount < filteredAnnouncements.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 text-xl font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow mb-6"
        >
          Load More
        </button>
      )}

      {/* Pagination */}
      <div className="flex justify-center mb-4">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-4 py-2 mx-1 text-white rounded ${currentPage === index + 1 ? "bg-blue-600" : "bg-gray-500"}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
