# Employee Management System (EMS)

A comprehensive full-stack Employee Management System built with the MERN stack, featuring professional UI components, role-based access control, and complete HR management functionality.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based login with role-based access control
- **Role-Based Dashboards** - Different interfaces for Admin, HR, Manager, and Employee roles
- **Employee Management** - Complete CRUD operations for employee data
- **Attendance Tracking** - Clock in/out functionality with attendance reports
- **Leave Management** - Leave application, approval workflow, and balance tracking
- **Payroll System** - Salary calculations, payslips, and payment tracking
- **Performance Management** - Performance reviews, goal setting, and evaluations
- **Document Management** - File upload and document storage capabilities
- **Analytics & Reports** - Charts, statistics, and comprehensive reporting
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Material-UI** - Component library
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **Formik & Yup** - Form handling and validation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **MongoDB** (v4.0.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Yashsharma1401/Employee_Management.git
cd Employee_Management
```

### 2. Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following environment variables to `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/employee_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_very_long_and_secure_2024
JWT_EXPIRE=30d

# Password Hashing
BCRYPT_ROUNDS=12
```

### 4. Database Setup

#### Option A: Local MongoDB Installation

1. **Install MongoDB Community Edition:**
   - **Windows:** Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS:** `brew install mongodb-community`
   - **Linux:** Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service:**
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is running:**
   ```bash
   # Check if MongoDB is listening on port 27017
   netstat -an | grep 27017
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management
   ```

### 5. Seed Database (Optional)

Populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample departments (IT, HR, Finance, Marketing, Operations)
- Demo user accounts with different roles
- Sample employee data

## 🚀 Running the Application

### Development Mode

Run both backend and frontend concurrently:

```bash
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend application** on `http://localhost:3000`

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔐 Demo Credentials

After seeding the database, you can use these demo accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | admin@ems.com | admin123 | Full system access |
| HR Manager | sarah.johnson@ems.com | hr123 | HR operations |
| IT Manager | john.smith@ems.com | manager123 | Team management |
| Employee | employee@ems.com | emp123 | Personal dashboard |

## 📁 Project Structure

```
Employee_Management/
├── client/                 # React frontend
│   ├── public/            # Public assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json       # Frontend dependencies
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   └── routes/           # API routes
├── .env                  # Environment variables
├── package.json          # Backend dependencies
└── README.md            # This file
```

## 📝 Available Scripts

### Root Directory Scripts

```bash
npm run dev          # Start both frontend and backend in development
npm run server       # Start only backend server
npm run client       # Start only frontend application
npm start           # Start production server
npm run build       # Build frontend for production
npm run seed        # Seed database with sample data
```

### Frontend Scripts (in /client directory)

```bash
npm start           # Start development server
npm run build       # Build for production
npm test            # Run tests
npm run eject       # Eject from Create React App
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `POST /api/attendance/clock-in` - Clock in
- `PATCH /api/attendance/clock-out/:id` - Clock out
- `GET /api/attendance/my-attendance` - Get user's attendance

### Leave Management
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my-leaves` - Get user's leaves
- `PATCH /api/leave/:id/process` - Approve/reject leave

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** 
- Ensure MongoDB is installed and running
- Check if MongoDB service is started
- Verify the `MONGODB_URI` in `.env` file

#### 2. Port Already in Use
```bash
Error: listen EADDRINUSE :::3000
```
**Solution:**
- Kill the process using the port: `lsof -ti:3000 | xargs kill -9`
- Or use a different port by modifying the configuration

#### 3. Module Not Found Errors
```bash
Module not found: Can't resolve './Component'
```
**Solution:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure all dependencies are installed

#### 4. CORS Issues
```bash
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- The backend includes CORS configuration
- Verify the frontend is running on `http://localhost:3000`
- Check proxy configuration in `client/package.json`

### Environment-Specific Issues

#### Windows Users
- Use Git Bash or PowerShell for commands
- Ensure MongoDB Windows Service is running
- Use `npm run dev` instead of `concurrently` if issues occur

#### macOS Users
- Use Homebrew for MongoDB installation
- Ensure Xcode Command Line Tools are installed
- Run `sudo npm install -g npm` if permission issues occur

#### Linux Users
- Use `sudo` for global npm installations if needed
- Ensure proper MongoDB service configuration
- Check firewall settings for ports 3000 and 5000

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

**Yash Sharma**
- GitHub: [@Yashsharma1401](https://github.com/Yashsharma1401)
- Email: yashsharma1401@example.com

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- Tailwind CSS for the utility-first styling approach
- MongoDB team for the robust database solution
- React and Node.js communities for comprehensive documentation

---

**Happy Coding! 🚀**

For support or questions, please open an issue in the GitHub repository.
