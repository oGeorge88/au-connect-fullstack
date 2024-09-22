"use client";
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    // Fetch announcements from the backend
    const fetchAnnouncements = async () => {
      const response = await fetch('/api/announcements');
      const data = await response.json();
      setAnnouncements(data);
    };

    fetchAnnouncements(); // Call function when component mounts
  }, []);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <div key={announcement._id} className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold">{announcement.title}</h2>
            <p className="mt-2">{announcement.content}</p>
            <p className="mt-4 text-sm text-gray-500">Posted on: {new Date(announcement.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default HomePage;
