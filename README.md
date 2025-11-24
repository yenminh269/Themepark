# Theme Park Management System

A full-stack web application for managing theme park operations, built with React, Express, and MySQL.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### Database Setup

1. **Install MySQL Workbench** (if not already installed):
   - Download from https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for Windows

2. **Configure Environment Variables**:
   - Copy the `.env` file and update with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   ```

3. **Set up the Database**:
   ```bash
   # Run the database setup script
   node setup-db.js
   ```
   This will:
   - Create the `your_database_name` database
   - Import the schema and data from `src.sql`
   - Add sample employee data

### Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   cd server && npm install
   ```

2. **Start the Backend Server**:
   ```bash
   cd server
   node index.js
   ```
   Server will run on http://localhost:3001

3. **Start the Frontend** (in a new terminal):
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Testing the Application

- Visit http://localhost:5173
- Admin login credentials (sample data):
  - Email: john.doe@themepark.com
  - Password: password123
- Check admin employees page at http://localhost:5173/admin/employees

## Features

- Customer authentication and registration
- Admin dashboard for managing employees, rides, and stores
- Employee management system
- Ride and store management
- Order management for ride tickets
- Responsive UI with modern design

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Chakra UI
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT tokens
- **State Management**: React Context
