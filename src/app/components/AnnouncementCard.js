"use client"; // Ensure this component is rendered on the client side

import { useState } from 'react';

const AnnouncementCard = ({ announcement }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Toggle the 'like' state
  const toggleLike = () => {
    setIsLiked(!isLiked);
    // Future improvement: make an API call to store the like status if needed
  };

  // Toggle the 'bookmark' state
  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Future improvement: make an API call to store the bookmark status if needed
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 m-2">
      {/* Announcement Title */}
      <h3 className="font-semibold text-lg text-gray-800">{announcement.title}</h3>
      
      {/* Announcement Content */}
      <div className="mt-2 text-gray-600" dangerouslySetInnerHTML={{ __html: announcement.content }}></div>

      {/* Buttons for Like and Bookmark */}
      <div className="flex justify-between items-center mt-4">
        {/* Like Button */}
        <button 
          onClick={toggleLike} 
          aria-label={isLiked ? 'Unlike announcement' : 'Like announcement'}
          aria-pressed={isLiked}
          className={`text-sm transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          {isLiked ? 'Unlike' : 'Like'}
        </button>

        {/* Bookmark Button */}
        <button 
          onClick={toggleBookmark} 
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark announcement'}
          aria-pressed={isBookmarked}
          className={`text-sm transition-colors duration-300 ${isBookmarked ? 'text-blue-500' : 'text-gray-500'}`}
        >
          {isBookmarked ? 'Unbookmark' : 'Bookmark'}
        </button>
      </div>
    </div>
  );
};

export default AnnouncementCard;
