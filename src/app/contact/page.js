"use client";
import { useState, useEffect } from "react";

const ContactPage = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("");
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
  const [profilePicture, setProfilePicture] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(""); // For error handling
  const [successMessage, setSuccessMessage] = useState(""); // For success feedback

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const contactResponse = await fetch("/api/contacts");
      const contactsData = await contactResponse.json();
      setContacts(contactsData);
      setFilteredContacts(contactsData);

      const authResponse = await fetch("/api/check-auth");
      const authData = await authResponse.json();
      setIsAdmin(authData.role === "admin");
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

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

      if (!response.ok) throw new Error("Network response was not ok");

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
        setSuccessMessage("Contact updated successfully!");
      } else {
        setContacts([...contacts, updatedContact]);
        setFilteredContacts([...filteredContacts, updatedContact]);
        setSuccessMessage("Contact added successfully!");
      }

      // Reset form and messages
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
      setSearchQuery("");
      setSortField("");
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving contact:", error);
      setErrorMessage("Error saving contact.");
    }
  };

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
      setSuccessMessage("Contact deleted successfully!");
    } catch (error) {
      console.error("Error deleting contact:", error);
      setErrorMessage("Error deleting contact.");
    }
  };

  const handleEdit = (contactId) => {
    const contactToEdit = contacts.find((contact) => contact._id === contactId);
    setFormData(contactToEdit);
    setEditingContactId(contactId);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

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

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Management</h1>

      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          encType="multipart/form-data"
        >
          {/* Form Fields */}
          {[
            { label: "Name", name: "name", type: "text", required: true },
            { label: "Faculty", name: "faculty", type: "text", required: true },
            { label: "Role", name: "role", type: "text" },
            { label: "Department", name: "department", type: "text" },
            { label: "Email", name: "email", type: "email" },
            { label: "Phone", name: "phone", type: "tel" },
            { label: "Facebook", name: "facebook", type: "text" },
            { label: "Line", name: "line", type: "text" },
          ].map((field) => (
            <div className="mb-4" key={field.name}>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required={field.required}
              />
            </div>
          ))}
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
            {profilePicture && (
              <img
                src={URL.createObjectURL(profilePicture)}
                alt="Profile Preview"
                className="mt-2 w-20 h-20 object-cover"
              />
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {editingContactId ? "Update Contact" : "Add Contact"}
          </button>
        </form>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Search Contacts
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Sort By
        </label>
        <select
          value={sortField}
          onChange={handleSortChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        >
          <option value="">Select Field</option>
          <option value="name">Name</option>
          <option value="faculty">Faculty</option>
          <option value="role">Role</option>
          <option value="department">Department</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="facebook">Facebook</option>
          <option value="line">Line</option>
        </select>
      </div>

      <ul className="list-none">
        {filteredContacts.map((contact) => (
          <li key={contact._id} className="border-b py-2 flex justify-between">
            <span>{contact.name}</span>
            {isAdmin && (
              <div>
                <button
                  onClick={() => handleEdit(contact._id)}
                  className="text-blue-500 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(contact._id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactPage;
