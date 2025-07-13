# Learn AI - Online Learning Platform

A full-stack web application for online learning with AI-powered course recommendations, built with React, Node.js, Express, and MongoDB. Features comprehensive course management, user authentication, and intelligent AI-driven recommendations with usage monitoring.

## 🚀 Features

### For Students

- **Course Browsing**: Browse and search through available courses with real-time filtering
- **AI Recommendations**: Get personalized course recommendations using GPT-3.5
- **Course Enrollment**: Enroll in courses with one-click and track enrollment status
- **Progress Tracking**: View enrolled courses and track learning progress
- **Search Functionality**: Real-time search across course titles, descriptions, and instructors
- **Enrollment Status**: Clear visual indicators showing which courses you're enrolled in

### For Instructors

- **Course Management**: Create, edit, and delete courses with rich content
- **Dashboard**: Manage all your courses from a centralized dashboard
- **Student Management**: View enrolled students for each course
- **Course Analytics**: Track course performance and student engagement

### For Admins

- **AI API Management**: Monitor and control AI API usage with comprehensive dashboard
- **Usage Statistics**: View daily, weekly, and monthly usage data with visual charts
- **Limit Control**: Set daily request limits (default: 250) and adjust as needed
- **API Status**: Enable/disable AI functionality for maintenance
- **Usage History**: Track historical usage patterns and trends
- **Admin Dashboard**: Comprehensive management interface with real-time monitoring

### Technical Features

- **JWT Authentication**: Secure login/logout with refresh tokens and automatic renewal
- **Role-based Access**: Separate interfaces for students, instructors, and admins
- **AI API Management**: Admin dashboard to monitor and control AI API usage (250 daily limit)
- **Real-time Search**: Server-side and client-side search capabilities
- **Responsive Design**: Mobile-friendly UI with modern design and smooth animations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading indicators throughout the application
- **Token Management**: Automatic token refresh and error recovery

## 🏗️ Architecture

```
learn-ai/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic controllers
│   ├── middleware/         # Custom middleware (auth, validation)
│   ├── models/            # MongoDB schemas (User, Course, ApiUsage)
│   ├── routes/            # API route definitions
│   ├── common-functions/  # Utility functions (token management)
│   ├── createAdmin.js     # Admin user creation script
│   └── server.js          # Main server file
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components (Admin, Instructor, Student)
│   │   ├── common-function/ # Frontend utilities (axios config, tokens)
│   │   └── App.jsx        # Main app component with routing
│   └── package.json
├── docs/                  # Project documentation
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SYSTEM_DESIGN.md
│   └── PRESENTATION_OUTLINE.md
└── README.md
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework with middleware support
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Authentication with refresh token mechanism
- **bcryptjs** - Password hashing and security
- **OpenAI API** - AI-powered course recommendations
- **Axios** - HTTP client for external API calls

### Frontend

- **React** - UI library with hooks and functional components
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client with interceptors for token management
- **React Router** - Client-side routing with lazy loading
- **CSS-in-JS** - Inline styles for component styling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- OpenAI API key
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/learn-ai.git
cd learn-ai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/learn-ai

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Server Configuration
PORT=5000

# JWT Secret (for authentication)
JWT_SECRET=your-jwt-secret-key-here
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Create Admin User (Optional)

To access the admin dashboard for AI API management:

```bash
cd backend
node createAdmin.js
```

This creates an admin user with:

- Email: admin@admin.com
- Username: admin
- Password: admin123

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: https://online-learning-platform-be.onrender.com

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // or "instructor" or "admin"
}
```

#### POST `/api/auth/login`

Login with existing credentials.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/refresh`

Refresh access token using refresh token.

### Course Endpoints

#### GET `/api/courses`

Get all available courses with search and filtering.

#### POST `/api/courses`

Create a new course (Instructor only).

#### PUT `/api/courses/:id`

Update an existing course (Instructor only).

#### DELETE `/api/courses/:id`

Delete a course (Instructor only).

#### POST `/api/courses/:id/enroll`

Enroll in a course (Student only).

#### GET `/api/courses/enrolled`

Get enrolled courses (Student only).

#### GET `/api/courses/:id/students`

Get enrolled students for a course (Instructor only).

### Recommendation Endpoints

#### POST `/api/recommend/courses`

Get AI-powered course recommendations based on user prompt.

#### GET `/api/recommend/suggestions`

Get course suggestions based on keywords.

### Admin Endpoints

#### GET `/api/admin/api-usage`

Get current AI API usage statistics (Admin only).

#### PUT `/api/admin/api-usage/settings`

Update AI API usage settings (Admin only).

#### POST `/api/admin/api-usage/reset`

Reset daily API usage count (Admin only).

#### GET `/api/admin/api-usage/history`

Get detailed API usage history (Admin only).

#### GET `/api/admin/api-usage/summary`

Get API usage summary for dashboard (Admin only).

## 🎯 Key Features Demo

### Student Experience

1. **Registration/Login**: Create account or login with existing credentials
2. **Course Discovery**: Browse courses with search and filtering
3. **AI Recommendations**: Get personalized course suggestions
4. **Enrollment**: Enroll in courses with one-click
5. **Progress Tracking**: View enrolled courses and track progress

### Instructor Experience

1. **Course Creation**: Create new courses with rich content
2. **Course Management**: Edit and delete existing courses
3. **Student Analytics**: View enrolled students and course performance
4. **Dashboard**: Centralized management interface

### Admin Experience

1. **API Monitoring**: Real-time AI API usage tracking
2. **Usage Control**: Set limits and control API access
3. **Statistics**: View detailed usage analytics
4. **System Management**: Enable/disable features and add notes

## 🔧 Configuration

### Environment Variables

**Backend (.env):**

```env
MONGODB_URI=mongodb://localhost:27017/learn-ai
OPENAI_API_KEY=your-openai-api-key
PORT=5000
JWT_SECRET=your-secret-key
```

**Frontend (vite.config.js):**

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "https://online-learning-platform-be.onrender.com",
    },
  },
});
```

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup**: Configure production environment variables
2. **Database**: Set up MongoDB Atlas or production MongoDB instance
3. **API Keys**: Configure OpenAI API key and JWT secret
4. **Server**: Deploy to Heroku, Railway, or AWS

### Frontend Deployment

1. **Build**: Run `npm run build` to create production build
2. **Hosting**: Deploy to Vercel, Netlify, or AWS S3
3. **Environment**: Configure API endpoints for production

## 🧪 Testing

### Manual Testing

1. **User Registration**: Test all user roles (student, instructor, admin)
2. **Course Management**: Create, edit, and delete courses
3. **Enrollment**: Test course enrollment and status tracking
4. **AI Recommendations**: Test recommendation system with various prompts
5. **Admin Features**: Test API usage monitoring and control

### API Testing

Use tools like Postman or curl to test all endpoints:

```bash
# Test registration
curl -X POST https://online-learning-platform-be.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"password123","role":"student"}'

# Test login
curl -X POST https://online-learning-platform-be.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

## 📊 Performance

### Optimizations

- **Lazy Loading**: React components loaded on demand
- **Token Caching**: Efficient JWT token management
- **API Rate Limiting**: AI API usage control and monitoring
- **Database Indexing**: Optimized MongoDB queries
- **Error Handling**: Comprehensive error recovery

### Monitoring

- **API Usage**: Real-time monitoring of AI API consumption
- **User Activity**: Track user engagement and course enrollments
- **System Health**: Monitor server performance and database connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT-3.5 API
- MongoDB for the database solution
- React and Node.js communities for excellent documentation
- All contributors and testers

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation files in the `docs/` directory

---

**Learn AI** - Empowering education with artificial intelligence 🚀
