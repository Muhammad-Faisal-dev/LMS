# Learning Management System (LMS)

A full-featured Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js) with role-based access control for administrators, teachers, and students.

## Features

- **User Authentication & Authorization**

  - Role-based access control (Admin, Teacher, Student)
  - User registration with admin approval system
  - Unique IDs for teachers and students

- **Admin Features**

  - Approve/reject user registrations
  - Send targeted messages to students, teachers, or both
  - Manage users and courses

- **Teacher Features**

  - Create and manage courses
  - Enroll/unenroll students
  - Upload course materials and create assignments

- **Student Features**
  - View enrolled courses
  - Access course materials and assignments
  - Receive messages from administrators

## Technologies Used

- **Frontend**:

  - React.js
  - Redux Toolkit for state management
  - React Router for navigation
  - Tailwind CSS for styling

- **Backend**:
  - Node.js with Express
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd lms
   ```

2. Install server dependencies

   ```
   cd server
   npm install
   ```

3. Install client dependencies

   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/lms
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

### Running the Application

1. Start the server

   ```
   cd server
   npm run dev
   ```

2. In a new terminal, start the client

   ```
   cd client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Initial Setup

1. Register an admin account first
2. Use the admin account to approve teacher and student registrations
3. Create courses and enroll students

## License

This project is licensed under the MIT License.
