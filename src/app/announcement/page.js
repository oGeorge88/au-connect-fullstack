"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import dynamic from 'next/dynamic';
import Image from "next/image";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    ["clean"],
  ],
};

export default function HomePage() {
  const { isLoggedIn, role, userId } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to fetch announcements.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      setError("Title and content are required.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newAnnouncement.title);
    formData.append("content", newAnnouncement.content);
    formData.append("userId", userId);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create announcement.");
      }

      const data = await response.json();
      setAnnouncements((prev) => [...prev, data]);
      setNewAnnouncement({ title: "", content: "" });
      setCoverImage(null);
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError("Failed to create announcement.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>
      {error && <p className="text-red-500">{error}</p>}
      {isLoggedIn && role === "admin" && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Create New Announcement</h2>
          <input
            type="text"
            placeholder="Title"
            value={newAnnouncement.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <ReactQuill
            value={newAnnouncement.content}
            onChange={(content) => handleChange("content", content)}
            modules={modules}
            className="h-40 mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverImage(e.target.files[0])}
            className="border p-2 mb-2 w-full"
          />
          <button
            onClick={handleCreateAnnouncement}
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 mt-2"
          >
            {isLoading ? "Creating..." : "Create Announcement"}
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold">Current Announcements</h2>
      {fetchLoading ? (
        <p>Loading announcements...</p>
      ) : announcements.length > 0 ? (
        <ul>
          {announcements.map((announcement) => (
            <li key={announcement.id} className="border-b mb-4 pb-2">
              <h3 className="text-lg font-bold">{announcement.title}</h3>
              <div dangerouslySetInnerHTML={{ __html: announcement.content }} />
              {announcement.coverImage && (
                <Image
                  src={announcement.coverImage}
                  alt={announcement.title}
                  width={600}
                  height={400}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No announcements available.</p>
      )}
    </div>
  );
}
