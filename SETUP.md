# ASTU Platform — Complete Setup & Integration Guide

This guide covers setting up the **backend**, **frontend**, and **AI integration** for the ASTU Platform.

---

## 📋 Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 12+** (or SQLite for dev)
- **Redis** (for Celery background tasks)
- **Git**

---

## 🚀 Quick Start

### 1️⃣ Backend Setup

#### Clone and Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Create `.env` File in `backend/`

```env
# Django settings
DEBUG=True
SECRET_KEY=your-super-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL recommended; SQLite for quick dev)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=astu_db
DB_USER=astu_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432

# For quick testing with SQLite (comment out above):
# DB_ENGINE=django.db.backends.sqlite3
# DB_NAME=db.sqlite3

# CORS (allow frontend to communicate with backend)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# AI / Groq Integration
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=llama3-70b-8192
GROQ_AI_MOCK=False  # Set to True to mock AI responses without API key

# Email (optional, for notifications)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0
```

#### Run Migrations

```bash
python manage.py migrate
```

#### Create Superuser (Admin)

```bash
python manage.py createsuperuser
# Follow prompts to set email and password
```

#### Load Sample Data (Optional)

```bash
python manage.py seed_backend_samples
# Or manually load via:
# python manage.py import_cse_curriculum
```

#### Start Backend Server

```bash
python manage.py runserver 0.0.0.0:8000
```

✅ Backend running at: **http://localhost:8000**

---

### 2️⃣ Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### The Frontend Already Knows the Backend

The `frontend/src/api.js` file automatically detects the backend:

- **Development**: Uses `http://localhost:8000`
- **Production**: Uses the same origin as the frontend

No `.env` file needed for frontend in development!

#### Start Frontend Dev Server

```bash
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 🔗 Integration Verification

### 1. Test Backend Health

```bash
curl http://localhost:8000/api/v1/announcements/
# Should return [] or a list if data exists
```

### 2. Test Frontend Loads

Open **http://localhost:5173** in your browser

- You should see the ASTU Platform home page
- Announcements panel (left), showcase (center), widgets (right)

### 3. Test Authentication

1. Click **"Sign In"** in the navbar
2. Register or sign in with credentials
3. Should redirect to profile completion form
4. After completion, should return to home

### 4. Test API Integration

After signing in:

1. Navigate to **"Courses"** (from navbar shortcuts)
2. Should load courses from backend
3. Click a course → should load chapters
4. Click **"Study Notes"** tab → AI should generate or fetch notes

### 5. Test AI Integration

1. In Courses view, type a question in the chat box
2. Click send → should stream AI response
3. Check browser console (F12) for any errors

---

## 🤖 AI Integration Setup

### Enable Groq AI

**Option 1: Using Real Groq API**

1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. Add to `.env`:
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxx
   GROQ_AI_MOCK=False
   ```
4. Restart backend: `python manage.py runserver`

**Option 2: Mock AI (No API Key Needed)**

1. In `backend/.env`, set:
   ```env
   GROQ_AI_MOCK=True
   ```
2. AI responses will return placeholder text
3. Perfect for development/testing

### AI Endpoints

| Endpoint                     | Method | Purpose                               |
| ---------------------------- | ------ | ------------------------------------- |
| `/api/v1/ai/chat/`           | POST   | SSE streaming chat for course context |
| `/api/v1/ai/notes/generate/` | POST   | Generate & cache notes for a chapter  |
| `/api/v1/ai/notes/{id}/`     | GET    | Retrieve cached notes                 |
| `/api/v1/ai/home/`           | POST   | General-purpose AI chat               |
| `/api/v1/ai/project/`        | POST   | Project-context AI assistance         |

---

## 📁 Project Structure

```
astu_platform/
├── backend/
│   ├── apps/
│   │   ├── ai_assistant/      ← AI endpoints & Groq integration
│   │   ├── courses/           ← Course management
│   │   ├── materials/         ← Study materials/downloads
│   │   ├── projects/          ← Kanban project workspace
│   │   ├── announcements/     ← Campus announcements
│   │   ├── users/             ← User auth & profiles
│   │   └── search/            ← Global search
│   ├── core/
│   │   ├── settings/          ← Django configuration
│   │   ├── urls.py            ← Route definitions
│   │   └── auth_views.py      ← Custom auth endpoints
│   ├── requirements.txt       ← Python dependencies
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── components/        ← React components
│   │   ├── context/           ← React Context (theme, etc.)
│   │   ├── api.js             ← API client layer
│   │   ├── App.jsx            ← Main app with views
│   │   └── main.jsx           ← React entry point
│   ├── package.json           ← Node dependencies
│   ├── vite.config.js         ← Vite build config
│   └── index.html
│
└── README.md
```

---

## 🛠️ Development Commands

### Backend

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start dev server
python manage.py runserver

# Run tests
python manage.py test

# Collect static files (production)
python manage.py collectstatic

# Seed sample data
python manage.py seed_backend_samples
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Frontend shows "API request failed"

- ✓ Ensure backend is running on `http://localhost:8000`
- ✓ Check CORS settings in `backend/core/settings/base.py`
- ✓ Open browser console (F12) for detailed error messages

### AI responses not working

- ✓ Check `GROQ_API_KEY` is set in `.env` if `GROQ_AI_MOCK=False`
- ✓ Test with `GROQ_AI_MOCK=True` first
- ✓ Check backend logs for API errors: `tail -f backend/manage.py runserver`

### Database connection errors

- ✓ Ensure PostgreSQL is running (or use SQLite in dev)
- ✓ Check `DB_*` variables in `.env`
- ✓ Run migrations: `python manage.py migrate`

### Frontend npm issues

- ✓ Delete `node_modules/` and run `npm install` again
- ✓ Clear npm cache: `npm cache clean --force`
- ✓ Use Node 18+: `node --version`

### Port already in use

- ✓ Backend: `python manage.py runserver 0.0.0.0:8001` (use different port)
- ✓ Frontend: `npm run dev -- --port 5174` (use different port)

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/login/` — Sign in
- `POST /api/v1/auth/register/` — Create account
- `POST /api/v1/auth/logout/` — Sign out
- `POST /api/v1/auth/token/refresh/` — Refresh JWT token

### Courses & Materials

- `GET /api/v1/courses/` — List all courses
- `GET /api/v1/courses/my/` — List user's personalized courses
- `GET /api/v1/chapters/{id}/` — Get chapter details
- `GET /api/v1/materials/` — List materials for download

### Projects & Kanban

- `GET /api/v1/projects/` — List user's projects
- `POST /api/v1/projects/` — Create new project
- `GET /api/v1/projects/{id}/tasks/` — Get project tasks
- `POST /api/v1/projects/{id}/tasks/` — Add task
- `PATCH /api/v1/tasks/{id}/move/` — Move task to status

### Announcements

- `GET /api/v1/announcements/` — Fetch announcements

### Search

- `GET /api/v1/search/?q=query` — Global search

---

## 🔐 Security Notes

⚠️ **For Production:**

1. Set `DEBUG=False` in `.env`
2. Generate a strong `SECRET_KEY`
3. Set up HTTPS/SSL
4. Use environment-specific settings
5. Enable CORS only for your domain
6. Store `GROQ_API_KEY` securely (use .env file)
7. Use strong database passwords

---

## 📞 Support

For issues or questions:

1. Check the **Troubleshooting** section above
2. Review backend logs: `python manage.py runserver` output
3. Check frontend console: Press `F12` in browser
4. Create an issue on the project repository

---

## ✨ Features Included

- ✅ **User Authentication** (Email-based, JWT tokens)
- ✅ **Courses & Chapters** (Browse, explore, search)
- ✅ **AI Assistant** (Groq-powered chat & note generation)
- ✅ **Study Materials** (Download & track)
- ✅ **Projects & Kanban** (Collaborative workspace)
- ✅ **Announcements** (Campus notice board)
- ✅ **Dark Mode** (Theme toggle)
- ✅ **Scientific Calculator** (In-app widget)
- ✅ **Global Search** (Instant lookup)
- ✅ **Responsive Design** (Mobile-friendly)

---

**Last Updated:** June 1, 2026  
**Version:** 1.0.0
