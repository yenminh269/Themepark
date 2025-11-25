# VELOCITY VALLEY

Full-stack Theme Park Management System for COSC 3380: Database Systems

**Repository:** [yenminh269/Themepark](https://github.com/yenminh269/Themepark)

**Hosted Link:** [Velocity Valley](https://velocityvalley-themepark.vercel.app/)

> **Note:** Please wait about 20 seconds for the backend server to start when first accessing the site.

---

## Project Overview

Velocity Valley is a comprehensive full-stack web application designed to manage all aspects of a theme park's operations. The system provides functionality for customer ticket purchasing, merchandise and food sales, ride maintenance, employee scheduling, zone management, and automated business intelligence. The platform supports multiple user roles including customers, general managers, store managers, mechanical employees, and sales employees.

---

## System Features

### 1) Data Management Capabilities

The system supports comprehensive CRUD operations across multiple entity types:

#### Customers
- **Sign Up & Authentication:** Email-based registration with password authentication, OAuth2 Google login
- **Edit/Modify:** Name, phone, date of birth, password
- **Forget Password:** Secure password reset via email with temporary password generation
- **Complete Profile:** Required profile completion for OAuth users

#### Employees
- **Add New Employees:** Automated unique email and temporary password generation
- **Edit/Modify:**
  - Personal info: first name, last name, gender, email, phone, SSN
  - Job-specific: job title, hire date, terminate date, salary
- **Schedule:** Assign mechanical employees to ride maintenance tasks
- **Assign:** Assign sales employees to store shifts

#### Rides
- **Add New Rides:** Name, description, capacity, operational hours, image URL, price, open and close time
- **Edit/Modify:** All ride attributes, status (open/closed/maintenance/pending_expansion)
- **Maintenance:** Assign mechanical employees to ride maintenance tasks
- **Expansion:** Automatic expansion trigger when ride reaches 15% monthly sales quota
- **Rain Management:** Automatic closure during rain, automatic reopening when rain clears

#### Stores (Merchandise, Food & Beverage)
- **Add New Stores:** Name, type (merchandise/food_drink), status, description, image URL
- **Edit/Modify:** Store details, operating hours
- **Inventory Management:** Stock tracking, restocking, low-stock alerts
- **Employee Assignment:** Assign sales employees to store shifts

#### Merchandise Items
- **Add New Items:** Name, description, price, category, stock quantity, image URL
- **Edit/Modify:** All item attributes, stock management
- **Stock Management:** Track inventory levels across multiple stores
- **Restock:** Update stock quantities with automated alerts

#### Zones
- **Add New Zones:** Zone name, description
- **Assignments:** Assign rides and stores to zones
- **Park Map:** Visual representation of all zones with assigned attractions

#### Maintenance Tasks
- **Create Tasks:** Assign rides to mechanical employees with priority levels
- **Track Status:** scheduled → in_progress → done
- **Completion:** Employees mark tasks complete with timestamp

#### Rain-Out Management
- **Add Rain Events:** Date, notes, start/end times
- **Clear Rain:** Automatically reopen eligible rides
- **History:** Track all rain events and affected rides

---

### 2) User Roles & Access Control

The application implements a role-based access control system with distinct user roles:

#### Customer 🎟️
**Public Access:**
- Browse park information (hours, parking, safety, FAQ, accessibility, group bookings)
- View stores and merchandise

**Authenticated Access:**
- Purchase ride tickets with email confirmation
- Purchase merchandise and food items
- View order history and confirmations
- Edit profile information
- Change password
- Explore park map with zones, rides, and stores
- View ride schedules and operational hours

#### General Manager 💼
**Full System Access:**
- **Employee Management:**
  - Add, edit, terminate employees, revoke termination, permanently delete
  - Reset employee passwords with temporary password generation
  - View all employee records and their information
- **Ride Management:**
  - Create, edit, delete rides
  - Assign rides to zones
  - Schedule maintenance tasks
  - Approve/reject ride expansion requests
  - View ride expansion history
- **Store Management:**
  - Create, edit, delete stores
  - Assign stores to zones
  - Manage overall merchandise inventory
- **Zone Management:**
  - Create, edit, delete zones
  - Assign rides and stores to zones
- **Reports & Analytics:**
  - Merchandise sales reports (store growth, revenue, monthly analysis)
  - Ride reports (total rides, revenue, maintenance activities, popularity)
  - Customer reports (new registrations, purchase activity)
- **Rain Management:**
  - View rain-out history

#### Store Manager 🏪
**Store Operations:**
- Assign sales employees to store shifts
- Manage overall merchandise items across all stores
- Manage inventory for individual stores (merchandise and food/beverage)
- Restock items when inventory runs low
- Create and manage sales employee schedules
- View and manage store operations

#### Mechanical Employee 🔧
**Maintenance Operations:**
- View assigned maintenance tasks for the day
- Update task status (scheduled → done)
- Complete maintenance records with timestamp
- Add rain-out records when weather conditions require ride closures
- View rain-out history
- Change password securely
- Clear rain events to reopen rides

#### Sales Employee 💰
**Point of Sale Operations:**
- View scheduled shifts and assigned stores
- Check work schedule (date, store, shift times)
- Change password securely

---

### 3) Semantic Constraints (Database Triggers)

#### Trigger 1: Ride Expansion (15% Business Rule)
**Purpose:** Trigger ride expansion when sales quota is reached

**Event:** After insert on `ride_order_detail` table

**Condition:**
- Ride reaches 15% of monthly sales quota
- Ride is NOT already pending expansion
- Ride has NOT been expanded this month

**Action:**
- Updates ride status to `pending_expansion`
- Creates entry in `ride_expansion_history` table with `pending` status
- Prevents duplicate expansion requests for the same month
- General Manager can approve/reject expansion from admin panel
  - **Approve:** Creates new ride with incremented name, returns original ride to `open` status
  - **Reject:** Returns original ride to `open` status

#### Trigger 2: Rain-Out Ride Management
**Purpose:** Automatically close/reopen rides based on weather conditions

**Event:** After insert on `rain_out` table

**Condition:**
- **Rain Start:** When `cleared_at` is NULL (rain event begins)
- **Rain Clear:** When `cleared_at` is set (rain event ends)

**Action:**
- **Rain Start:**
  - Closes all rides with status `open` by setting status to `closed`
  - Excludes rides already permanently deleted
- **Rain Clear:**
  - Reopens all rides with status `closed` by setting status to `open`
  - Excludes rides under maintenance or permanently closed
  - Maintains ride safety by respecting maintenance schedules

---

### 4) Reports & Analytics

The application provides comprehensive reporting capabilities with customizable filters:

#### Merchandise Sales Analytics 📊

**A) Store Average Growth**
- **Specific Store Mode:**
  - Compares daily revenue to previous day
  - Calculates average daily growth rate
  - Identifies growth trends for individual stores

- **All Stores Mode:**
  - Compares each store's revenue to average of all stores on same day
  - Shows relative performance between stores
  - Identifies top and underperforming locations

**B) Total Revenue Analysis**
- **All Merchandise / All Stores / All Categories:**
  - Identifies best-performing stores by total revenue
  - Shows overall revenue distribution across locations

- **All Merchandise / Specific Store / All Categories:**
  - Best-selling items across all categories for a specific store
  - Helps store managers optimize inventory

- **All Merchandise / Specific Store / Specific Category:**
  - Detailed transactions: customer name, order date, item name, quantity, price, subtotal
  - Best-selling items in specific category for specific store

- **All Merchandise / All Stores / Specific Category:**
  - Category performance across all locations
  - Shows which store sells most of specific category

- **Specific Merchandise / All Stores:**
  - Tracks single item performance across locations
  - Identifies which store generates most revenue for specific item

- **Specific Merchandise / Specific Store:**
  - Detailed sales data for specific item at specific location
  - Customer purchasing patterns

**C) Monthly Growth Analysis**
- **Specific Store Mode:**
  - Average monthly growth rate
  - Identifies which month had highest growth
  - Year-over-year comparison

- **All Stores Mode:**
  - Month-to-month revenue comparison
  - Identifies which month all stores grew most
  - Shows which store contributed most to growth

#### Ride Analytics 🎢

**A) Total Rides & Revenue**
- **Specific Ride:**
  - Total rides given in selected period
  - Total revenue generated
  - Average rides per day

- **All Rides:**
  - Comparison across all rides
  - Identifies most profitable rides
  - Capacity utilization analysis

**B) Total Maintenance Activities**
- Count of maintenance tasks by ride
- Time spent in maintenance
- Maintenance frequency analysis
- Cost impact on operations

**C) Most Popular Rides**
- Ranked by total rides given
- Customer preference trends
- Peak usage times
- Wait time optimization data

#### Customer Analytics 👥

**A) New Customer Registrations**
- Daily/weekly/monthly registration trends
- Growth rate analysis
- Registration source tracking (email vs OAuth)

**B) Customer Purchase Activity**
- Total customers who made purchases
- Average order value
- Purchase frequency
- Customer lifetime value
- Repeat customer rate

---

## Technologies

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-319795?style=for-the-badge&logo=chakra-ui&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![SendGrid](https://img.shields.io/badge/SendGrid-3368C7?style=for-the-badge&logo=sendgrid&logoColor=white)

### Database
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

### Testing
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

### Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

### Version Control
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

---

## Hosting Locally

### Prerequisites

- Git installed on your machine
- Latest version of Node.js (v16 or higher)
- MySQL installed locally (v8.0 or higher)
- npm package manager

### Clone the Repository

```bash
git clone https://github.com/yenminh269/Themepark.git
cd Themepark-Management-System
code .
```

#### Important Environment Configuration (`server/.env`)

Create a `.env` file in the `server` directory:
 `.env` files must be properly configured before hosting locally.

### Database Setup

1. **Import the SQL Schema and Data:**
   - Open MySQL Workbench
   - Import the SQL dump file (provided separately)
   - Ensure all tables, triggers, and stored procedures are created

2. **Verify Database Connection:**
   - Ensure MySQL server is running
   - Verify credentials in `server/.env` match your MySQL setup

### Starting the Backend

```bash
cd server                # Navigate to the backend directory
npm install              # Install dependencies
npm run dev              # Start the development server
```

The backend server will start on `http://localhost:3001`

### Starting the Frontend

Open a new terminal:

```bash
# From the root directory
npm install              # Install frontend dependencies
npm run dev              # Start the development server
```

> **Note:** A new window will automatically open in your default browser at `http://localhost:5173` (or the port Vite chooses).
---

## Project Structure

```
Themepark-Management-System/
├── src/                          # Frontend source code
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── admin/           # General Manager components
│   │   │   ├── customer/        # Customer-facing components
│   │   │   ├── employee/        # Sales Employee dashboard
│   │   │   ├── employee-maintenance/  # Mechanical Employee dashboard
│   │   │   ├── Manager/         # Store Manager components
│   │   │   └── public/          # Public pages (login, signup, etc.)
│   │   └── input/               # Reusable form components
│   ├── services/
│   │   └── api.js               # API client service
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Application entry point
├── server/                       # Backend source code
│   ├── config/
│   │   └── db.js                # Database connection
│   ├── middleware/
│   │   └── auth.js              # Authentication middleware
│   ├── routes/                  # API route handlers
│   │   ├── customer.routes.js
│   │   ├── employee.routes.js
│   │   ├── ride.routes.js
│   │   ├── store.routes.js
│   │   ├── zone.routes.js
│   │   ├── maintenance.routes.js
│   │   ├── password.routes.js
│   │   └── ...
│   └── index.js                 # Server entry point
│   └── .env                      # Backend environment variables
├── package.json                  # Frontend dependencies
├── server/package.json           # Backend dependencies
└── README.md                     # This file
```

---

## Key Features Implementation Details

### Authentication & Authorization
- JWT-based authentication for employees and customers
- OAuth2 Google login for customers
- Role-based access control with protected routes
- Secure password hashing using bcrypt
- Password reset via email with temporary passwords

### Email Notifications
- Automated email confirmation for ticket purchases and merchandise orders
- Password reset emails with temporary passwords
- SendGrid integration for reliable email delivery

### Real-time Updates
- Live inventory tracking across multiple stores
- Real-time maintenance task assignment and completion
- Dynamic ride expansion based on sales performance

### Reports & Analytics
- Customizable date range filters
- Multiple aggregation options (store, category, item)
- Visual data representation
- Export-ready data formats

---

## Database Schema Highlights

### Key Tables
- `customer` - Customer accounts and profiles
- `employee` - Employee records with role-based access
- `ride` - Theme park rides with operational status
- `store` - Merchandise and food/beverage stores
- `merchandise_item` - Store inventory items
- `zone` - Park zones for organizational structure
- `ride_order` - Customer ride ticket purchases
- `store_order` - Customer merchandise/food purchases
- `maintenance` - Ride maintenance task tracking
- `employee_store_job` - Employee shift scheduling
- `rain_out` - Weather event tracking
- `ride_expansion_history` - Ride expansion audit trail

### Key Relationships
- Customers place orders for rides and store items
- Employees are assigned to stores and maintenance tasks
- Rides and stores are assigned to zones
- Maintenance employees are assigned to ride maintenance
- Sales employees are scheduled for store shifts

---

## Troubleshooting

### Backend Won't Start
- Verify MySQL server is running
- Check database credentials in `server/.env`
- Ensure database `themepark` exists
- Check for port conflicts on port 3001

### Frontend Won't Connect to Backend
- Verify backend is running on `http://localhost:3001`
- Ensure CORS is configured correctly in `server/.env`
- Clear browser cache and reload

### Database Connection Errors
- Verify MySQL user has proper permissions
- Check firewall settings for port 3306
- Ensure database name matches `.env` configuration

### Email Notifications Not Working
- Verify SendGrid API key is valid
- Check `SENDGRID_FROM_EMAIL` is verified in SendGrid
- Review SendGrid account limits and quotas
- Check `Spam` folder in your email inbox

---

## License

This project is developed for educational purposes as part of COSC 3380: Database Systems.

---

## Contact

For questions or issues, please contact the development team through GitHub issues.
