# Registration "Failed to Fetch" — Troubleshooting Guide

## Problem: "Failed to Fetch" Error During Registration

When you try to register, you see:

```
Failed to fetch
```

This means the frontend cannot communicate with the backend. Here's how to fix it:

---

## ✅ Quick Fixes (Try These First)

### 1. **Make Sure Backend is Running**

Most common cause! The backend must be running on `http://localhost:8000`.

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\Activate.ps1
python manage.py runserver
```

✅ You should see:

```
Starting development server at http://localhost:8000/
```

### 2. **Check CORS Configuration**

Frontend runs on `http://localhost:5173` and needs permission to communicate with backend.

**Backend file:** `backend/core/settings/base.py`

Look for:

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://localhost:3000',
    cast=Csv()
)
```

**Make sure your `backend/.env` includes:**

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

If you changed this, restart the backend.

### 3. **Test API Manually**

Open a new terminal and test:

```bash
# Test the backend is responding
curl http://localhost:8000/api/v1/announcements/

# Should return: [] or a JSON list (not an error)
```

---

## 🔍 Debugging Steps

### Check Browser Console

1. Open your browser (Chrome/Firefox/Edge)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try to register again
5. Look for detailed error messages

Common errors you might see:

- `Failed to fetch` — Backend not running
- `CORS error` — CORS not configured correctly
- `Network error` — Connection issue

### Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try to register
4. Look for the request to `/api/v1/auth/register/`
5. Click it and check:
   - **Status**: Should be `201` (success) or `400` (validation error), NOT connection error
   - **Response**: Shows the error details

---

## 🐛 Specific Error Solutions

### Error: "Failed to fetch" with no details

**Solution:**

```bash
# 1. Check backend is running
ps aux | grep "manage.py runserver"

# 2. If not, start it:
cd backend && python manage.py runserver

# 3. Check logs for errors
# The terminal running runserver should show detailed errors
```

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:**

1. Edit `backend/.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

2. Restart backend:

```bash
python manage.py runserver
```

### Error: "Invalid email or password"

**This is normal** — You typed your credentials wrong. Try again.

### Error: "An account with this email already exists"

**This is normal** — Email is already registered. Use Sign In instead, or register with a different email.

---

## 📋 Complete Checklist

Before trying to register, ensure all of these are ✅:

- [ ] Backend is running: `python manage.py runserver`
- [ ] Backend shows "Starting development server at http://localhost:8000/"
- [ ] Frontend is running: `npm run dev`
- [ ] Frontend shows "VITE v8.x.x ready in xxx ms"
- [ ] Can access http://localhost:5173 in browser
- [ ] `backend/.env` exists (copy from `.env.example` if not)
- [ ] `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173`
- [ ] `curl http://localhost:8000/api/v1/announcements/` returns JSON (not error)

---

## 🆕 New Features Added

### ✨ Google Sign-In

A new **"Sign in with Google"** button is available on both login and register screens.

**How it works:**

1. Click **"Sign in with Google"** button
2. You'll be redirected to Google login
3. After approving, you'll be logged in automatically

**Requirements:**

- Backend must have Google OAuth configured
- Set in `backend/.env`:
  ```env
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your-client-secret
  ```

### 🎥 Improved Video Display

Videos in the home page showcase are now:

- **Fully visible** — Shadow removed for better clarity
- **Larger display area** — Video takes up full space
- **Better controls** — Left/Right buttons moved below video
- **More opacity** — Video is now 50% visible (was 35%)

---

## 🚀 If Everything is Setup Correctly

1. Navigate to http://localhost:5173
2. Click **"Sign In"** button (top right)
3. Click **"Don't have an account? Register"**
4. Fill in form:
   - Full Name: `Your Name`
   - Email: `your.email@astu.edu.et` (or any email)
   - Password: `YourPassword123!`
5. Click **"Create Account"**
6. Fill in profile:
   - Student ID: `UGR/12345/16`
   - Department: `Computer Science & Engineering`
   - Year: `1`
   - Semester: `1`
   - Bio: (optional)
7. Click **"Finish Setup"**

✅ **You should now be logged in!**

---

## 📞 Still Having Issues?

### Check Backend Logs

The terminal running `python manage.py runserver` shows detailed error logs.

**Example issue you might see:**

```
Traceback (most recent call last):
  ...
django.core.exceptions.ImproperlyConfigured: Incorrect setup...
```

**Common backend issues:**

- Database not running
- Missing migrations: `python manage.py migrate`
- Bad `SECRET_KEY` in `.env`

### Reset Everything

If something is broken:

```bash
# 1. Stop both frontend and backend (Ctrl+C)

# 2. Delete frontend cache
cd frontend
rm -rf node_modules
npm install

# 3. Reset backend database
cd ../backend
rm db.sqlite3  # if using SQLite

# 4. Run migrations fresh
python manage.py migrate

# 5. Restart both servers
# Terminal 1:
python manage.py runserver

# Terminal 2:
cd ../frontend
npm run dev
```

---

## 💡 Pro Tips

- **Keep terminals open** — One for backend, one for frontend
- **Check console (F12)** — Always check browser console for errors
- **Restart after .env changes** — Backend must restart to pick up new `.env` values
- **Test with curl** — Use `curl` to test API without browser complexity
- **Clear cache** — Browser cache can cause issues: Ctrl+Shift+Delete

---

## 📚 Related Files

- Backend auth: `backend/core/auth_views.py`
- Frontend auth: `frontend/src/api.js` (line 108+)
- Auth modal: `frontend/src/App.jsx` (line 24+)
- CORS config: `backend/core/settings/base.py` (line 260+)

---

**Last Updated:** June 1, 2026  
**Version:** 1.0.1

For more help, see [README.md](README.md) and [SETUP.md](SETUP.md).
