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

  // Admin action: handle adding a new user
  const handleAddNewUser = () => {
    setIsAddingNewUser(true);
    setEditingUserId(null);
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
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter users based on search query
    const filtered = users.filter((user) =>
      [user.displayName, user.email, user.faculty, user.studentId]
        .some((field) => field.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  // Handle sorting changes
  const handleSortChange = (criteria) => {
    setSortCriteria(criteria);
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[criteria] > b[criteria] ? 1 : -1;
      } else {
        return a[criteria] < b[criteria] ? 1 : -1;
      }
    });
    setFilteredUsers(sortedUsers);
  };

  // Admin action: handle editing a user
  const handleEditUser = (user) => {
    setEditingUserId(user._id);
    setIsAddingNewUser(false);
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
  };

  // Admin action: handle deleting a user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      setSuccess("User deleted successfully");
    } catch (err) {
      setError("Error deleting user");
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
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>
        {/* Other fields for email, faculty, etc. */}
        {/* Profile Picture Upload */}
        <div className="mb-4">
          <label className="block text-gray-700">Profile Picture:</label>
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          {editingUserId ? "Update User" : isAddingNewUser ? "Add User" : "Update Profile"}
        </button>
      </form>

      {/* Admin User Table (Admin Only) */}
      {role === "admin" && (
        <>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full border border-gray-300 p-2 rounded-lg"
            />
          </div>
          <table className="mt-4 w-full border border-gray-300">
            <thead>
              <tr>
                <th onClick={() => handleSortChange("displayName")}>
                  Display Name
                </th>
                <th onClick={() => handleSortChange("email")}>Email</th>
                <th onClick={() => handleSortChange("faculty")}>Faculty</th>
                <th onClick={() => handleSortChange("studentId")}>
                  Student ID
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.displayName}</td>
                  <td>{user.email}</td>
                  <td>{user.faculty}</td>
                  <td>{user.studentId}</td>
                  <td>
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleAddNewUser}
            className="mt-4 bg-green-500 text-white py-2 px-4 rounded-lg"
          >
            Add New User
          </button>
        </>
      )}
    </div>
  );
}
