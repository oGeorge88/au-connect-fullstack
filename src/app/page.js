"use client";
import Link from 'next/link';
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "./AuthContext"; // Import AuthContext
import "quill/dist/quill.snow.css"; // Correct path for Quill styles

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

// Sample data for demonstration purposes
const sampleAnnouncements = [
  { id: 1, title: "Welcome to AU Connect", description: "Join our platform to connect with fellow students!" },
  { id: 2, title: "Upcoming Event: Career Fair", description: "Don't miss the Career Fair on September 30!" },
];

const sampleTestimonials = [
  { id: 1, text: "AU Connect has transformed my university experience!", author: "Jane Doe" },
  { id: 2, text: "A fantastic platform for networking and staying informed!", author: "John Smith" },
];

const sampleUpcomingEvents = [
  { id: 1, date: "September 30", title: "Career Fair" },
  { id: 2, date: "October 10", title: "Guest Lecture: AI in Education" },
];

const HomePage = () => {
  const { isLoggedIn, role } = useAuth(); // Get role from AuthContext
  const [announcements, setAnnouncements] = useState(sampleAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Change this based on how many announcements you want to show per page

  // Add or edit announcement (Admin Only)
  const handleSaveAnnouncement = async () => {
    setIsLoading(true);
    setError("");

    // Simulate an API call
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        throw new Error("Title and content are required!");
      }

      const newAnn = {
        id: announcements.length + 1, // Simple ID generation
        ...newAnnouncement,
      };

      // Update state with new announcement
      setAnnouncements((prev) => [newAnn, ...prev]);
      setNewAnnouncement({ title: "", content: "" });
      setCoverImage(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }
      // Validate file size (e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setError("File size must be less than 2MB.");
        return;
      }
      setCoverImage(file);
    }
  };

  // Pagination logic
  const indexOfLastAnnouncement = currentPage * itemsPerPage;
  const indexOfFirstAnnouncement = indexOfLastAnnouncement - itemsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirstAnnouncement, indexOfLastAnnouncement);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-12">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold">Welcome to AU Connect</h1>
          <p className="mt-4 text-lg">Connect with your peers, join discussions, and stay updated!</p>
          <Link href="/signup" className="mt-6 inline-block bg-white text-red-600 font-semibold py-2 px-4 rounded hover:bg-gray-200">Get Started</Link>
        </div>
      </section>

      {/* Announcement Section for Admin */}
      {role === "admin" && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-3xl font-semibold mb-6">Add Announcement</h2>
          <input
            type="text"
            placeholder="Title"
            className="mb-4 p-3 border rounded w-full focus:ring focus:border-red-300"
            value={newAnnouncement.title}
            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
          />
          <ReactQuill
            value={newAnnouncement.content}
            onChange={(content) => setNewAnnouncement({ ...newAnnouncement, content })}
            className="mb-4"
            modules={modules}
          />
          {coverImage && (
            <img
              src={URL.createObjectURL(coverImage)}
              alt="Cover Preview"
              className="mb-4 w-full h-auto rounded"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4 p-3 border rounded w-full focus:ring focus:border-red-300"
          />
          <button
            onClick={handleSaveAnnouncement}
            className={`w-full py-3 mt-4 text-xl font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="text-white" fill="none" strokeWidth="4" strokeLinecap="round" cx="12" cy="12" r="10" />
                </svg>
                Saving...
              </span>
            ) : "Add Announcement"}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}

      {/* Featured Announcements Section */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Featured Announcements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentAnnouncements.map(announcement => (
            <div key={announcement.id} className="bg-white shadow rounded p-4">
              <h3 className="font-bold">{announcement.title}</h3>
              <p className="text-gray-700">{announcement.description}</p>
              <Link href={`/announcements/${announcement.id}`} className="text-red-600 hover:underline">Read More</Link>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/login" className="bg-white shadow rounded p-4 text-center">
            <h3 className="font-bold">Contact Management</h3>
          </Link>
          <Link href="/login" className="bg-white shadow rounded p-4 text-center">
            <h3 className="font-bold">Email Communication</h3>
          </Link>
          <Link href="/login" className="bg-white shadow rounded p-4 text-center">
            <h3 className="font-bold">Admin Dashboard</h3>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-200 py-8">
        <h2 className="text-2xl font-semibold text-center mb-4">What Our Users Say</h2>
        <div className="flex flex-wrap justify-center">
          {sampleTestimonials.map(testimonial => (
            <div key={testimonial.id} className="bg-white shadow rounded p-4 mx-2 my-2">
              <p className="text-gray-700">{`"${testimonial.text}"`}</p> {/* Escaped quotes */}
              <p className="font-semibold mt-2">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        <ul className="list-disc list-inside">
          {sampleUpcomingEvents.map(event => (
            <li key={event.id} className="text-gray-700">{`${event.date}: ${event.title}`}</li>
          ))}
        </ul>
      </section>

      {/* Contact Support */}
      <section className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
        <p className="text-gray-700">Contact our support team for assistance.</p>
        <Link href="/contact" className="text-red-600 hover:underline">Get Support</Link>
      </section>
    </div>
  );
};

export default HomePage;
