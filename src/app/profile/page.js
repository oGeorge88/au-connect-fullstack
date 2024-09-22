"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext"; // Ensure AuthContext is properly set up

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests

export default function ProfilePage() {
  const { userId, role } = useAuth(); // Get the logged-in user's ID and role from the AuthContext
  const [users, setUsers] = useState([]); // For storing all users (admin only)
  const [filteredUsers, setFilteredUsers] = useState([]); // For filtered users (search and sort)
  const [profile, setProfile] = useState({}); // For storing the logged-in user's profile (regular user)
  const [formData, setFormData] = useState({
    displayName: "",
    username: "",
    email: "",
    faculty: "",
    studentId: "",
    gender: "",
    password: "",
    profilePicture: null, // Added for profile picture
  });
  const [editingUserId, setEditingUserId] = useState(null); // To track the user being edited (admin only)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAddingNewUser, setIsAddingNewUser] = useState(false); // For adding a new user
  const [searchQuery, setSearchQuery] = useState(""); // For search input
  const [sortCriteria, setSortCriteria] = useState("displayName"); // Default sort criteria is by Display Name
  const [sortDirection, setSortDirection] = useState("asc"); // Default sort direction is ascending

  // Fetch user data based on the role (admin or regular user)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (role === "admin") {
          // Fetch all users for admins
          const response = await axios.get("/api/admin/users");
          setUsers(response.data);
          setFilteredUsers(response.data); // Initially, show all users
        } else {
          // Fetch the logged-in user's own profile
          const response = await axios.get("/api/user/profile");
          setProfile(response.data);
          setFormData({
            displayName: response.data.displayName || "",
            username: response.data.username || "",
            email: response.data.email || "",
            faculty: response.data.faculty || "",
            studentId: response.data.studentId || "",
            gender: response.data.gender || "",
            password: "",
            profilePicture: null,
          });
        }

        setLoading(false);
      } catch (err) {
        setError("Error fetching user data");
        setLoading(false);
      }
    };

    fetchData();
  }, [role, userId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission for adding/editing a user or updating the logged-in user's profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData(); // Use FormData for file uploads
      formDataToSend.append("displayName", formData.displayName);
      formDataToSend.append("username", formData.username);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("faculty", formData.faculty);
      formDataToSend.append("studentId", formData.studentId);
      formDataToSend.append("gender", formData.gender);
      if (formData.password) formDataToSend.append("password", formData.password);
      if (formData.profilePicture) formDataToSend.append("profilePicture", formData.profilePicture); // Include profile picture if updated

      if (role === "admin" && editingUserId) {
        // Update an existing user (admin action)
        const response = await axios.put(
          `/api/admin/users/${editingUserId}`,
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } } // Set the correct headers
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === editingUserId ? response.data : user
          )
        );
        setSuccess("User updated successfully");
      } else if (role !== "admin") {
        // Update logged-in user's profile (user action)
        const response = await axios.put("/api/user/profile", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProfile(response.data);
        setSuccess("Profile updated successfully");
      } else if (isAddingNewUser) {
        // Add a new user (admin action)
        const response = await axios.post("/api/admin/users", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUsers((prevUsers) => [...prevUsers, response.data]);
        setSuccess("User added successfully");
      }

      setFormData({
        displayName: "",
        username: "",
        email: "",
        faculty: "",
        studentId: "",
        gender: "",
        password: "",
        profilePicture: null, // Reset profile picture field
      });
      setEditingUserId(null);
      setIsAddingNewUser(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving user");
    }
  };

  if (loading) return <div>Loading...</div>; // Display loading message
  if (error) return <div className="text-red-500">{error}</div>; // Display error message

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {role === "admin" ? "Admin User Management" : "Your Profile"}
      </h2>

      {/* Success and Error Messages */}
      {success && <div className="mt-4 text-green-500">{success}</div>}
      {error && <div className="mt-4 text-red-500">{error}</div>}

      {/* Profile or User Form */}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Form Fields for User Info */}
        <div className="mb-4">
          <label className="block text-gray-700">Display Name:</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Faculty:</label>
          <input
            type="text"
            name="faculty"
            value={formData.faculty}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Student ID:</label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Gender:</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Password (leave blank to keep current one):
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Profile Picture:</label>
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleInputChange}
            className="mt-1 p-2 block w-full rounded-md border-gray-300"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {editingUserId || isAddingNewUser ? "Save User" : "Update Profile"}
        </button>
      </form>

      {/* Admin-Specific Section: List of Users */}
      {role === "admin" && (
        <>
          <h3 className="text-xl font-bold mt-6 mb-4">All Users</h3>
          <button
            onClick={handleAddNewUser}
            className="mb-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add New User
          </button>
          {/* Admin-Specific Section: Search and Sort */}
          <div className="mb-8">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                {/* Search Bar */}
                <div className="relative w-full md:w-1/2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search by Name, Email, Faculty, or ID..."
                    className="w-full px-5 py-3 rounded-full border border-gray-200 bg-gray-100 shadow-inner focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width="20"
                    height="20"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6a4 4 0 100 8 4 4 0 000-8zm0 8l4 4"
                    />
                  </svg>
                </div>

                {/* Sort By Dropdown */}
                <div className="flex items-center space-x-4">
                  <label
                    htmlFor="sort"
                    className="font-semibold text-gray-600"
                  >
                    Sort By:
                  </label>
                  <select
                    id="sort"
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-3 rounded-full bg-gray-100 border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="displayName">Display Name</option>
                    <option value="username">Username</option>
                    <option value="email">Email</option>
                    <option value="faculty">Faculty</option>
                    <option value="studentId">Student ID</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="bg-white p-4 shadow-md rounded-lg">
                <p>
                  <strong>Display Name:</strong> {user.displayName}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Faculty:</strong> {user.faculty}
                </p>
                <p>
                  <strong>Student ID:</strong> {user.studentId}
                </p>
                <p>
                  <strong>Gender:</strong> {user.gender}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
