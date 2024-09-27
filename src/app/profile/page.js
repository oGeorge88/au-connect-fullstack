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
  const [submitting, setSubmitting] = useState(false); // For managing submission state

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
        console.error(err); // Log error for debugging
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
    setSubmitting(true); // Set submitting state
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
        setSuccess("User updated successfully!");
      } else if (role === "admin" && isAddingNewUser) {
        // Add a new user (admin action)
        const response = await axios.post(
          "/api/admin/users",
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } } // Set the correct headers
        );
        setUsers((prevUsers) => [...prevUsers, response.data]);
        setSuccess("New user added successfully!");
      } else {
        // Update the logged-in user's profile
        const response = await axios.put(
          "/api/user/profile",
          formDataToSend,
          { headers: { "Content-Type": "multipart/form-data" } } // Set the correct headers
        );
        setProfile(response.data);
        setSuccess("Profile updated successfully!");
      }
      setEditingUserId(null);
      setIsAddingNewUser(false); // Reset the adding new user state
    } catch (err) {
      setError("Error updating user data");
      console.error(err); // Log error for debugging
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  // Filter users based on search query
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filtered = users.filter(user =>
      user.displayName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Sort users based on criteria
  const handleSort = (criteria) => {
    const sorted = [...filteredUsers].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[criteria] > b[criteria] ? 1 : -1;
      } else {
        return a[criteria] < b[criteria] ? 1 : -1;
      }
    });
    setFilteredUsers(sorted);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc"); // Toggle sort direction
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-center text-2xl font-bold mt-10">{role === "admin" ? "User Management" : "Profile"}</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      {role === "admin" ? (
        <>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by display name"
            className="mt-4 p-2 border border-gray-300 rounded"
          />
          <table className="mt-4 w-full border border-collapse">
            <thead>
              <tr>
                <th onClick={() => handleSort("displayName")} className="cursor-pointer">Display Name</th>
                <th onClick={() => handleSort("username")} className="cursor-pointer">Username</th>
                <th onClick={() => handleSort("email")} className="cursor-pointer">Email</th>
                <th onClick={() => handleSort("faculty")} className="cursor-pointer">Faculty</th>
                <th onClick={() => handleSort("studentId")} className="cursor-pointer">Student ID</th>
                <th onClick={() => handleSort("gender")} className="cursor-pointer">Gender</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.displayName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.faculty}</td>
                  <td>{user.studentId}</td>
                  <td>{user.gender}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditingUserId(user._id);
                        setFormData({
                          displayName: user.displayName,
                          username: user.username,
                          email: user.email,
                          faculty: user.faculty,
                          studentId: user.studentId,
                          gender: user.gender,
                          password: "",
                          profilePicture: null,
                        });
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={() => {
              setIsAddingNewUser(true);
              setFormData({
                displayName: "",
                username: "",
                email: "",
                faculty: "",
                studentId: "",
                gender: "",
                password: "",
                profilePicture: null,
              });
            }}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Add New User
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10">
          <h2 className="text-lg font-bold mb-4">Profile Details</h2>
          <div className="mb-4">
            <label className="block">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Faculty</label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block">Profile Picture</label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Update Profile"}
          </button>
        </form>
      )}
    </div>
  );
}
