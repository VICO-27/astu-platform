# 🎓 ASTU Platform — Adama Science and Technology University

A modern, full-stack educational platform for students at ADAMA Science and Technology University (ASTU) in Ethiopia. Built with **React**, **Django**, **Groq AI**, and modern web technologies.

**Live Demo:** _Coming Soon_

---

## ✨ Features

### 🎯 Core Features

- ✅ **Student Authentication** — Secure email-based sign-in with JWT tokens
- ✅ **Courses & Chapters** — Browse, search, and explore all university courses
- ✅ **AI-Powered Study Assistant** — Powered by Groq LLaMA3 for real-time help
- ✅ **Study Materials** — Download and organize course materials (PDFs, docs, etc.)
- ✅ **Kanban Projects** — Collaborative project management with tasks & messaging
- ✅ **Campus Announcements** — Real-time updates and notifications
- ✅ **Global Search** — Instant search across courses, materials, and more
- ✅ **Scientific Calculator** — In-app calculator with advanced functions

### 🎨 User Experience

- 🌙 **Dark Mode** — Toggle between light and dark themes
- 📱 **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast Performance** — Built with Vite for instant load times
- 🎭 **Smooth Animations** — Framer Motion-powered interactions
- ♿ **Accessibility** — WCAG-compliant design

### 🤖 AI Integration

- **Groq LLaMA3 70B** — Latest open-source model for academic assistance
- **Course-Specific Chat** — Real-time SSE streaming for instant responses
- **AI Study Notes** — Auto-generate study guides for any chapter
- **Project AI Help** — Get help with project planning and code

### 👥 Collaboration

- **Shared Projects** — Create and collaborate on team projects
- **Task Management** — Kanban-style task tracking with status updates
- **Project Messaging** — Communicate with team members directly
- **Activity Tracking** — See who did what and when

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+ (SQLite for dev)
- Redis (for background tasks)

### Automated Setup (Recommended)

**For macOS/Linux:**

```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**

```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### Manual Setup

**1. Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\Activate.ps1
cp .env.example .env      # Edit .env with your config
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: **http://localhost:8000**

**2. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

3. Open **http://localhost:5173** in your browser

---

## 🔑 Configuration

### Backend `.env` Setup

```env
# Django
DEBUG=True
SECRET_KEY=your-super-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=astu_db
DB_USER=astu_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# CORS (for frontend)
CORS_ALLOWED_ORIGINS=http://localhost:5173

# AI (Groq)
GROQ_API_KEY=your-groq-api-key  # Get from https://console.groq.com
GROQ_AI_MOCK=True               # Use True to mock responses without API key
```

### Getting Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for free
3. Generate an API key
4. Add to `backend/.env`

---

## 📁 Project Structure

```
astu_platform/
├── backend/                    # Django REST API
│   ├── apps/
│   │   ├── ai_assistant/      # AI endpoints & Groq integration
│   │   ├── courses/           # Course management
│   │   ├── materials/         # Study materials
│   │   ├── projects/          # Kanban workspace
│   │   ├── announcements/     # Campus notices
│   │   ├── users/             # Auth & profiles
│   │   └── search/            # Global search
│   ├── core/
│   │   ├── settings/          # Django config
│   │   ├── urls.py
│   │   └── auth_views.py
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # Theme context
│   │   ├── api.js             # API client
│   │   ├── App.jsx            # Main app
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── package.json
│   └── index.html
│
├── SETUP.md                   # Detailed setup guide
├── README.md                  # This file
├── setup.sh                   # Linux/macOS setup script
└── setup.ps1                  # Windows setup script
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/login/` — Sign in
- `POST /api/v1/auth/register/` — Create account
- `POST /api/v1/auth/logout/` — Sign out
- `GET /api/v1/users/me/` — Get current user

### Courses

- `GET /api/v1/courses/` — List all courses
- `GET /api/v1/courses/{id}/` — Get course details
- `GET /api/v1/chapters/{id}/` — Get chapter

### Materials

- `GET /api/v1/materials/` — List materials
- `POST /api/v1/materials/{id}/download/` — Track download

### Projects

- `GET /api/v1/projects/` — List projects
- `POST /api/v1/projects/` — Create project
- `GET /api/v1/projects/{id}/tasks/` — Get tasks
- `POST /api/v1/projects/{id}/tasks/` — Create task

### AI Assistant

- `POST /api/v1/ai/chat/` — **SSE stream** for course chat
- `POST /api/v1/ai/notes/generate/` — Generate study notes
- `GET /api/v1/ai/notes/{id}/` — Get cached notes
- `POST /api/v1/ai/home/` — General AI chat

### Search

- `GET /api/v1/search/?q=query` — Global search

### Announcements

- `GET /api/v1/announcements/` — Fetch announcements

---

## 🛠️ Development Commands

### Backend

```bash
cd backend
source venv/bin/activate

# Run dev server
python manage.py runserver

# Create superuser (admin)
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Run tests
python manage.py test

# Load sample data
python manage.py seed_backend_samples
```

### Frontend

```bash
cd frontend

# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🐛 Troubleshooting

### Frontend can't reach backend

```
Error: API request failed
```

✅ **Fix:** Ensure backend is running on port 8000  
✅ Check CORS settings in `backend/core/settings/base.py`  
✅ Open browser console (F12) for detailed errors

### AI responses not working

```
Error: AI service unavailable
```

✅ Check `GROQ_API_KEY` in `backend/.env`  
✅ Try `GROQ_AI_MOCK=True` to test without API key  
✅ Check backend logs for errors

### Database connection error

```
Error: could not connect to server
```

✅ Ensure PostgreSQL is running  
✅ Check `DB_*` variables in `.env`  
✅ Run: `python manage.py migrate`

### Port already in use

```
Error: Address already in use
```

✅ Backend: `python manage.py runserver 8001`  
✅ Frontend: `npm run dev -- --port 5174`

---

## 🔐 Security

### Production Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Generate strong `SECRET_KEY` (50+ random characters)
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Restrict CORS to your domain only
- [ ] Store secrets in `.env` (never commit!)
- [ ] Use environment-specific settings
- [ ] Set up rate limiting
- [ ] Enable CSRF protection
- [ ] Regular security audits

---

## 📚 Tech Stack

### Backend

- **Django 5.0** — Web framework
- **Django REST Framework** — API layer
- **PostgreSQL** — Database
- **Groq API** — AI/LLM
- **Celery** — Background tasks
- **Redis** — Cache & task queue
- **dj-rest-auth** — Authentication

### Frontend

- **React 19** — UI library
- **Vite 8** — Build tool
- **Tailwind CSS** — Styling
- **Framer Motion** — Animations
- **Lucide React** — Icons
- **JavaScript (ES6+)** — Language

### Infrastructure

- **Render.com** — Hosting (recommended)
- **GitHub** — Version control
- **Cloudinary** — Media storage (optional)

---

## 📸 Screenshots

_Coming Soon_

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) file for details.

---

## 📞 Support & Contact

- 📧 Email: support@astu.edu.et
- 🐛 Issues: [GitHub Issues](https://github.com/astu-platform/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/astu-platform/discussions)

---

## 🎯 Roadmap

### v1.1 (Q3 2026)

- [ ] Mobile app (React Native)
- [ ] Video streaming for lectures
- [ ] Exam simulation platform
- [ ] Grade tracking system

### v1.2 (Q4 2026)

- [ ] Advanced analytics dashboard
- [ ] Peer tutoring marketplace
- [ ] Advanced scheduling system
- [ ] Integration with university systems

### v2.0 (2027)

- [ ] AI-powered course recommendations
- [ ] Real-time collaboration tools
- [ ] Advanced learning analytics
- [ ] Multi-university support

---

## 🙏 Acknowledgments

- **ASTU** — For the opportunity to build this platform
- **Groq** — For the amazing LLaMA3 model
- **Django & React Communities** — For excellent frameworks
- **Contributors** — For making this project better

---

**Made with ❤️ for ASTU Students**

_Last Updated: June 1, 2026_
