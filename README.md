# KM Media Course Registration System

A secure web application for course registration with JWT authentication, built with React, Node.js, and SQLite.

## Features

### 🔐 Security

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Helmet security headers

### 👥 User Management

- User registration and login
- Role-based access control (User/Admin)
- Profile management
- Secure password handling

### 📚 Course Management

- Browse available courses
- Course search and filtering
- Course details and enrollment
- Admin course management (CRUD operations)

### 🎓 Registration System

- Course registration for users
- Registration status tracking
- Admin approval/rejection system
- User registration history

### 🎨 Modern UI/UX

- Responsive design with Tailwind CSS
- Modern React components
- Toast notifications
- Loading states and error handling

## Tech Stack

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **cors** for cross-origin requests

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **React Hook Form** for form handling
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd kmmedia
   ```

2. **Install all dependencies**

   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   ```bash
   cd server
   cp env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   DB_PATH=./database.sqlite
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5000) and frontend development server (port 3000).

### Default Admin Account

- **Email**: admin@kmmedia.com
- **Password**: admin123

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Courses

- `GET /api/courses` - Get all active courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/courses/admin/all` - Get all courses (admin)
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `PATCH /api/courses/:id/toggle` - Toggle course status (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Registrations

- `GET /api/registrations/my` - Get user's registrations
- `POST /api/registrations` - Register for a course
- `DELETE /api/registrations/:id` - Cancel registration
- `GET /api/registrations/admin/all` - Get all registrations (admin)
- `PATCH /api/registrations/:id/status` - Update registration status (admin)
- `GET /api/registrations/admin/status/:status` - Get registrations by status (admin)

## Project Structure

```
kmmedia/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── database/      # Database setup and models
│   │   ├── middleware/    # Authentication middleware
│   │   ├── routes/        # API routes
│   │   └── types/         # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── package.json           # Root package.json
└── README.md
```

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Validation**: Server-side validation with express-validator
4. **CORS Protection**: Configured for production and development
5. **Rate Limiting**: Prevents abuse and DDoS attacks
6. **Security Headers**: Helmet middleware for security headers
7. **SQL Injection Prevention**: Parameterized queries with SQLite

## Development

### Backend Development

```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
```

### Frontend Development

```bash
cd client
npm start           # Start development server
npm run build       # Build for production
```

### Database

The application uses SQLite for simplicity. The database file (`database.sqlite`) is automatically created when the server starts.

## Production Deployment

1. **Environment Variables**: Update all environment variables for production
2. **JWT Secret**: Use a strong, unique JWT secret
3. **Database**: Consider migrating to PostgreSQL or MySQL for production
4. **HTTPS**: Ensure SSL/TLS is configured
5. **Build**: Run `npm run build` in both client and server directories

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository.
