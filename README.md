# AU Connect - Full Stack Social Media Platform

**AU Connect** is a full-stack web application designed as a social media platform for students of AU. It includes features like user authentication, role-based access, announcement management, user profile management, and more. The application is built using **Next.js** for the frontend, **Node.js**/ **Express** for the backend, and **MongoDB** for the database.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Frontend Pages](#frontend-pages)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User Authentication (Sign Up, Login, Logout)
- Role-Based Access Control (Admin/User)
- Create, Read, Update, Delete (CRUD) operations for Announcements, Admin and User Profile
- User Profile Management
- Bookmark Announcements
- File Upload (Profile pictures, announcement cover images)
- Search and filter features
- Admin capabilities for user management
- API built with Express and secured with session-based authentication

## Technologies Used

- **Frontend**: Next.js (React), TailwindCSS, ReactQuill (for rich text editing)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: bcrypt, express-session
- **File Upload**: multer
- **Deployment**: Vercel (for the frontend), MongoDB Atlas, Heroku (for the backend)
  
## Getting Started

To get started with AU Connect, follow the steps below to set up the project on your local machine.

### Prerequisites

- Node.js (v14+)
- MongoDB (MongoDB Atlas or local MongoDB instance)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/au-connect.git
   cd au-connect
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root of your project with the following environment variables:

```bash
SESSION_SECRET=yourSuperSecretKeyHere
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ENV=development
```

- `SESSION_SECRET`: A secret key for session management.
- `MONGODB_URI`: Your MongoDB connection string (can be local or Atlas).
- `NEXT_PUBLIC_API_URL`: The base API URL for the Next.js frontend.
- `NEXT_PUBLIC_ENV`: The environment in which the app is running (e.g., development, production).

### Project Structure

```
├── models              # Mongoose Models (User, Announcement, Contact)
├── pages               # Next.js pages (login, signup, profile, announcements)
├── public              # Public assets (images, icons, etc.)
├── routes              # Express routes for API
├── src
│   ├── components      # Reusable React components
│   ├── app             # AuthContext and global layout setup
│   └── styles          # Global styles (TailwindCSS)
├── middleware          # Auth middleware (isAuthenticated, isAdmin)
├── .env                # Environment variables
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── README.md           # Project documentation
└── server.js           # Entry point for the Express backend
```

### API Routes

The backend API is built with Express and handles user authentication, announcements, and profile management. Here are the key routes:

- **Authentication**:
  - `POST /api/login`: Logs in the user.
  - `POST /api/signup`: Registers a new user.
  - `POST /api/logout`: Logs out the user.

- **Announcements**:
  - `GET /api/announcements`: Fetch all announcements.
  - `POST /api/announcements/create`: Create a new announcement (Admin only).
  - `PUT /api/announcements/edit/:id`: Edit an existing announcement (Admin only).
  - `DELETE /api/announcements/delete/:id`: Delete an announcement (Admin only).
  - `POST /api/announcements/bookmark/:id`: Bookmark/unbookmark an announcement.

- **User Profile**:
  - `GET /api/user/profile`: Fetch user profile (Authenticated user).
  - `PUT /api/user/profile`: Update user profile.

- **Admin**:
  - `GET /api/admin/users`: View all users (Admin only).
  - `POST /api/admin/users`: Create a new user (Admin only).
  - `PUT /api/admin/users/:id`: Edit a user (Admin only).
  - `DELETE /api/admin/users/:id`: Delete a user (Admin only).

### Frontend Pages

- **/login**: Login page
- **/signup**: Signup page
- **/profile**: User profile page
- **/announcements**: Announcement listing and admin controls
- **/contacts**: Contact management for users (Admin only)

### Running the Application

1. Run the backend server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

### Deployment

For deployment, you can use the following services:

- **Frontend**: [Vercel](https://vercel.com/)
- **Backend**: [Heroku](https://www.heroku.com/)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

### Deployment Steps

1. **Frontend** (Vercel):
   - Connect your GitHub repository to Vercel.
   - Add the required environment variables via Vercel’s dashboard.
   - Deploy.

2. **Backend** (Heroku):
   - Set up the project on Heroku and connect it to your GitHub repository.
   - Deploy.

### Contributing

We welcome contributions to AU Connect. Here’s how you can get started:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a pull request.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.