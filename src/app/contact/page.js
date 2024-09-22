"use client";
import { useState, useEffect } from "react";

const ContactPage = () => {
  const [contacts, setContacts] = useState([]); // Store contacts
  const [filteredContacts, setFilteredContacts] = useState([]); // Filtered contacts for searching/sorting
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [sortField, setSortField] = useState(""); // Sorting criteria
  const [formData, setFormData] = useState({
    name: "",
    faculty: "",
    role: "",
    department: "",
    email: "",
    phone: "",
    facebook: "",
    line: "",
  });
  const [profilePicture, setProfilePicture] = useState(null); // Profile picture
  const [isAdmin, setIsAdmin] = useState(false); // Admin check
  const [editingContactId, setEditingContactId] = useState(null); // Editing state
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch contacts and check if the user is admin when the page loads
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch existing contacts and check if user is admin
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactResponse = await fetch("/api/contacts");
      const contactsData = await contactResponse.json();
      setContacts(contactsData);
      setFilteredContacts(contactsData);

      const authResponse = await fetch("/api/check-auth");
      const authData = await authResponse.json();
      setIsAdmin(authData.role === "admin"); // Set isAdmin flag based on role

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle profile picture change
  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  // Handle form submission (add or edit contact)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const data = new FormData();
      for (let key in formData) {
        data.append(key, formData[key]);
      }
      if (profilePicture) {
        data.append("profilePicture", profilePicture);
      }

      let response;
      if (editingContactId) {
        response = await fetch(`/api/contacts/${editingContactId}`, {
          method: "PUT",
          body: data,
        });
      } else {
        response = await fetch("/api/contacts", {
          method: "POST",
          body: data,
        });
      }

      const updatedContact = await response.json();
      if (editingContactId) {
        setContacts((prevContacts) =>
          prevContacts.map((contact) =>
            contact._id === editingContactId ? updatedContact : contact
          )
        );
        setFilteredContacts((prevFiltered) =>
          prevFiltered.map((contact) =>
            contact._id === editingContactId ? updatedContact : contact
          )
        );
      } else {
        setContacts([...contacts, updatedContact]);
        setFilteredContacts([...filteredContacts, updatedContact]);
      }

      setFormData({
        name: "",
        faculty: "",
        role: "",
        department: "",
        email: "",
        phone: "",
        facebook: "",
        line: "",
      });
      setProfilePicture(null);
      setEditingContactId(null);
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  // Handle contact deletion
  const handleDelete = async (contactId) => {
    if (!isAdmin) return;

    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      setContacts(contacts.filter((contact) => contact._id !== contactId));
      setFilteredContacts(
        filteredContacts.filter((contact) => contact._id !== contactId)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Handle editing a contact
  const handleEdit = (contactId) => {
    const contactToEdit = contacts.find((contact) => contact._id === contactId);
    setFormData(contactToEdit);
    setEditingContactId(contactId);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  // Handle sorting
  const handleSortChange = (e) => {
    const field = e.target.value;
    setSortField(field);

    const sorted = [...filteredContacts].sort((a, b) => {
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    });

    setFilteredContacts(sorted);
  };

  // Format Facebook URL
  const formatFacebookUrl = (facebook) => {
    if (!facebook.startsWith("http")) {
      return `https://www.facebook.com/${facebook}`;
    }
    return facebook;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Management</h1>

      {/* Only show the form if the user is an admin */}
      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          encType="multipart/form-data"
        >
          {/* Form Fields */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Faculty
            </label>
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          {/* More form fields like role, department, etc. */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingContactId ? "Update Contact" : "Add Contact"}
          </button>
        </form>
      )}

      {/* Search Bar */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Search Contacts
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by name..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>

      {/* Sort Filter */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Sort Contacts
        </label>
        <select
          value={sortField}
          onChange={handleSortChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        >
          <option value="">Sort by...</option>
          <option value="name">Name</option>
          <option value="faculty">Faculty</option>
          <option value="role">Role</option>
        </select>
      </div>

      {/* Display Existing Contacts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Existing Contacts</h2>
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {contact.name}
                  </h3>
                  <p className="text-gray-600">
                    <span className="font-semibold">Faculty:</span>{" "}
                    {contact.faculty}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-semibold">Role:</span> {contact.role}
                  </p>
                  {/* More contact information */}
                </div>

                {isAdmin && (
                  <div className="p-4 flex justify-between items-center border-t border-gray-200">
                    <button
                      className="bg-blue-500 text-white py-1 px-4 rounded-md"
                      onClick={() => handleEdit(contact._id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white py-1 px-4 rounded-md"
                      onClick={() => handleDelete(contact._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No contacts found.</p>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
