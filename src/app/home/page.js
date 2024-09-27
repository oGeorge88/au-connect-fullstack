"use client";
import { useEffect, useState } from 'react';

const HomePage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    // Fetch announcements from the backend
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch('/api/announcements');
        if (!response.ok) {
          throw new Error('Failed to fetch announcements.');
        }
        const data = await response.json();
        setAnnouncements(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements(); // Call function when component mounts
  }, []);

  if (loading) {
    return <div className="text-center">Loading announcements...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      {error && <p className="text-red-500">{error}</p>}
      {announcements.length === 0 ? (
        <p>No announcements available.</p>
      ) : (
        announcements.map((announcement) => (
          <div key={announcement._id} className="bg-white shadow-md rounded-lg p-4 mb-4 transition-transform hover:scale-105">
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
