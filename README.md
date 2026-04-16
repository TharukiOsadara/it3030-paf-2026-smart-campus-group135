# Smart Campus Operations Hub - IT3030 PAF Assignment 2026

A comprehensive web platform for managing university facility bookings, asset management, and maintenance operations.

## 📋 Project Overview

This system provides:
- **Module A**: Facilities & Assets Catalogue Management
- **Module B**: Booking Management with Workflow
- **Module C**: Maintenance & Incident Ticketing
- **Module D**: Real-time Notifications
- **Module E**: OAuth 2.0 Authentication & Role-Based Authorization

## 🏗️ Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.4
- Spring Security + OAuth2
- Spring Data JPA
- H2 Database
- Maven

### Frontend
- React 18+
- React Router
- Axios
- TailwindCSS / Material-UI (to be decided)
- Vite (or Create React App)

### DevOps
- GitHub Actions (CI/CD)
- JUnit & Mockito (Backend Testing)
- Jest & React Testing Library (Frontend Testing)

## 🚀 Quick Setup

### Prerequisites
- JDK 17 or higher
- Node.js 18+ and npm
- Git
- Maven 3.6+

### Step 1: Clone and Setup Project Structure

```bash
git clone <repository-url>
cd it3030-paf-2026-smart-campus-group135

# Run the setup script to create all directories
# On Windows:
setup-project.bat

# On Mac/Linux:
chmod +x setup-project.sh
./setup-project.sh
```

### Step 2: Configure Database

No manual database setup is required. The backend uses a local H2 database file for development and an in-memory H2 database for tests.

### Step 3: Configure OAuth 2.0

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8080/api/login/oauth2/code/google`
6. Update the Google OAuth2 values in `backend/.env` or `backend/.env.example`.

### Step 4: Configure JWT Secret

Generate a secure JWT secret (256-bit minimum):
```bash
# On Linux/Mac:
openssl rand -base64 64

# On Windows (PowerShell):
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

Add the secret to `backend/.env` as `JWT_SECRET=YOUR_GENERATED_SECRET`.

### Step 5: Install and Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will start on `http://localhost:8080`

API Documentation (Swagger): `http://localhost:8080/api/swagger-ui.html`

### Step 6: Install and Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:3000` (or configured port)

## 📁 Project Structure

```
it3030-paf-2026-smart-campus-group135/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/lk/sliit/smartcampus/
│   │   │   │   ├── config/           # Security, CORS, File storage configs
│   │   │   │   ├── controller/       # REST API endpoints
│   │   │   │   ├── service/          # Business logic layer
│   │   │   │   ├── repository/       # Data access layer
│   │   │   │   ├── model/            # JPA entities
│   │   │   │   │   └── enums/        # Status enums
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   │   ├── request/      # Request DTOs
│   │   │   │   │   └── response/     # Response DTOs
│   │   │   │   ├── security/         # JWT, OAuth handlers
│   │   │   │   ├── exception/        # Custom exceptions & handlers
│   │   │   │   └── util/             # Helper utilities
│   │   │   └── resources/
│   │   │       └── application.yml   # Application configuration
│   │   └── test/                     # Unit and integration tests
│   ├── uploads/                      # File uploads (incident images)
│   └── pom.xml                       # Maven dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                 # Login, OAuth components
│   │   │   ├── facilities/           # Resource catalogue UI
│   │   │   ├── bookings/             # Booking management UI
│   │   │   ├── tickets/              # Incident ticket UI
│   │   │   ├── notifications/        # Notification panel
│   │   │   └── common/               # Reusable components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API service layer
│   │   ├── context/                  # React Context (Auth, etc.)
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils/                    # Helper functions
│   │   └── assets/                   # Images, styles
│   └── package.json
├── docs/
│   ├── architecture/                 # System architecture diagrams
│   ├── api/                          # API documentation & Postman collections
│   ├── testing/                      # Test reports and evidence
│   └── screenshots/                  # UI screenshots for submission
├── .github/
│   └── workflows/                    # GitHub Actions CI/CD
├── .gitignore
├── README.md
└── setup-project.bat/.sh             # Project structure setup script
```

## 🔑 Key Features & Endpoints

### Module A: Facilities & Assets Catalogue

**Endpoints (Member 1):**
- `GET /api/resources` - List all resources with filters
- `GET /api/resources/{id}` - Get resource details
- `POST /api/resources` - Create new resource (ADMIN)
- `PUT /api/resources/{id}` - Update resource (ADMIN)
- `DELETE /api/resources/{id}` - Delete resource (ADMIN)

### Module B: Booking Management

**Endpoints (Member 2):**
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings` - Get all bookings (ADMIN)
- `PUT /api/bookings/{id}/approve` - Approve booking (ADMIN)
- `PUT /api/bookings/{id}/reject` - Reject booking (ADMIN)
- `PUT /api/bookings/{id}/cancel` - Cancel booking
- `GET /api/bookings/conflicts` - Check availability

### Module C: Maintenance & Incident Ticketing

**Endpoints (Member 3):**
- `POST /api/tickets` - Create incident ticket (with images)
- `GET /api/tickets` - List tickets (filtered by user/status)
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}/assign` - Assign technician (ADMIN)
- `PUT /api/tickets/{id}/status` - Update status (TECHNICIAN)
- `POST /api/tickets/{id}/comments` - Add comment
- `PUT /api/tickets/{id}/comments/{commentId}` - Edit comment
- `DELETE /api/tickets/{id}/comments/{commentId}` - Delete comment

### Module D: Notifications

**Endpoints (Member 4 - Part 1):**
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

### Module E: Authentication & Authorization

**Endpoints (Member 4 - Part 2):**
- `GET /api/auth/login` - Initiate OAuth2 login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile
- `GET /api/users` - List users (ADMIN)
- `PUT /api/users/{id}/role` - Update user role (ADMIN)

## 👥 Team Contribution Guide

Each member must implement **at least 4 endpoints** using different HTTP methods (GET, POST, PUT/PATCH, DELETE).

### Recommended Allocation:
- **Member 1**: Module A (Facilities/Resources Management)
- **Member 2**: Module B (Booking Workflow)
- **Member 3**: Module C (Incident Tickets & Comments)
- **Member 4**: Module D & E (Notifications + Auth/User Management)

### Git Workflow:
1. Create feature branches from `main`:
   ```bash
   git checkout -b feature/module-a-resources
   git checkout -b feature/module-b-bookings
   git checkout -b feature/module-c-tickets
   git checkout -b feature/module-d-e-notifications-auth
   ```

2. Commit regularly with clear messages:
   ```bash
   git commit -m "feat(resources): Add resource catalogue endpoint"
   git commit -m "fix(bookings): Fix conflict checking logic"
   ```

3. Push and create Pull Requests for review

4. Merge to `main` after review

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Postman Collection
Import `docs/api/Smart-Campus-API.postman_collection.json` for manual API testing.

## 🔒 Security Best Practices

- ✅ OAuth 2.0 authentication (Google)
- ✅ JWT for session management
- ✅ Role-based access control (USER, ADMIN, TECHNICIAN)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (JPA/Hibernate)
- ✅ File upload validation (type, size, count)
- ✅ CORS configuration
- ✅ Password hashing (if implementing local auth)

## 📊 Non-Functional Requirements

- **Performance**: Response time < 2 seconds for standard operations
- **Scalability**: Support 1000+ concurrent users
- **Availability**: 99% uptime target
- **Usability**: Responsive UI, clear error messages
- **Maintainability**: Clean code, proper documentation
- **Security**: OWASP Top 10 compliance

## 📝 Submission Checklist

- [ ] All 5 modules (A-E) fully implemented
- [ ] Each member has 4+ endpoints with different HTTP methods
- [ ] Database properly configured and persistent
- [ ] OAuth 2.0 login working
- [ ] Role-based authorization enforced
- [ ] Input validation and error handling
- [ ] File upload working (max 3 images per ticket)
- [ ] Booking conflict prevention working
- [ ] Notifications being generated
- [ ] Unit/integration tests written
- [ ] Postman collection provided
- [ ] GitHub Actions workflow configured
- [ ] README with setup instructions
- [ ] Architecture diagrams created
- [ ] API documentation complete
- [ ] Screenshots/video of working system
- [ ] Final report PDF prepared
- [ ] Individual contributions clearly documented

## 📖 Documentation

- Architecture diagrams: `docs/architecture/`
- API documentation: `docs/api/`
- Test evidence: `docs/testing/`
- Screenshots: `docs/screenshots/`

## 🚢 Deployment (Optional)

### Backend Deployment Options:
- Heroku
- AWS Elastic Beanstalk
- Railway
- Render

### Frontend Deployment Options:
- Vercel
- Netlify
- GitHub Pages (with React Router configuration)

## 📄 License

This project is created for educational purposes as part of IT3030 PAF Assignment 2026.

## 👨‍💻 Team Members

- Member 1: [Name] - Module A (Facilities Management)
- Member 2: [Name] - Module B (Booking Management)
- Member 3: [Name] - Module C (Incident Ticketing)
- Member 4: [Name] - Modules D & E (Notifications & Auth)

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review Postman collection examples
3. Contact team members
4. Refer to assignment guidelines

---

**Important**: This is a group assignment with individual assessment. Ensure your commits clearly show your contributions. Be prepared to explain your code during the viva.