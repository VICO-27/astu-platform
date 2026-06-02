// Central ASTU API client layer
const LOCALHOST_HOSTNAMES = ["localhost", "127.0.0.1"];
const isLocalDevHost = LOCALHOST_HOSTNAMES.includes(window.location.hostname) || window.location.port === "5173";
export const API_BASE_URL = isLocalDevHost
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : "";
const BASE_URL = API_BASE_URL;

let accessToken = localStorage.getItem("astu_access");
let refreshToken = localStorage.getItem("astu_refresh");

// Internal helper to get authorization headers
function getHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

// Global request wrapper with automatic token refresh
async function request(url, options = {}) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  
  // Set default method
  options.method = options.method || "GET";
  
  // Set headers
  const isFormData = options.body instanceof FormData;
  const headers = getHeaders(options.headers || {});
  
  if (!isFormData && options.body && typeof options.body === "object") {
    options.body = JSON.stringify(options.body);
    headers["Content-Type"] = "application/json";
  }
  
  options.headers = headers;

  let response = await fetch(fullUrl, options);

  // If unauthorized (401), attempt token refresh
  if (response.status === 401 && refreshToken) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      // Retry original request with new token
      options.headers = getHeaders(options.headers);
      response = await fetch(fullUrl, options);
    } else {
      // Clear auth and trigger callback/logout
      clearAuth();
      window.dispatchEvent(new Event("astu-unauthorized"));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Extract user-friendly error message from response
    let errorMessage = errorData.detail || "API request failed";
    
    // For validation errors, try to extract field-specific messages
    if (!errorMessage || errorMessage === "API request failed") {
      if (errorData.email) errorMessage = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
      else if (errorData.password1) errorMessage = Array.isArray(errorData.password1) ? errorData.password1[0] : errorData.password1;
      else if (errorData.password2) errorMessage = Array.isArray(errorData.password2) ? errorData.password2[0] : errorData.password2;
      else if (errorData.name) errorMessage = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
      else if (typeof errorData === 'object') errorMessage = JSON.stringify(errorData).substring(0, 200);
    }
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

// Refresh JWT access token
async function attemptRefresh() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    
    setAuth(data.access, data.refresh, data.user);
    return true;
  } catch (err) {
    clearAuth();
    return false;
  }
}

export function setAuth(access, refresh, user) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem("astu_access", access);
  localStorage.setItem("astu_refresh", refresh);
  if (user) {
    localStorage.setItem("astu_user", JSON.stringify(user));
  }
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem("astu_access");
  localStorage.removeItem("astu_refresh");
  localStorage.removeItem("astu_user");
}

export function getStoredUser() {
  const user = localStorage.getItem("astu_user");
  return user ? JSON.parse(user) : null;
}

// ── AUTHENTICATION ──
export const auth = {
  async register(email, password, name) {
    const data = await request("/api/v1/auth/register/", {
      method: "POST",
      body: { email, password1: password, password2: password, name },
    });
    setAuth(data.access, data.refresh, data.user);
    return data.user;
  },

  async login(email, password) {
    const data = await request("/api/v1/auth/login/", {
      method: "POST",
      body: { email, password },
    });
    setAuth(data.access, data.refresh, data.user);
    return data.user;
  },

  async logout() {
    try {
      if (refreshToken) {
        await request("/api/v1/auth/logout/", {
          method: "POST",
          body: { refresh: refreshToken },
        });
      }
    } finally {
      clearAuth();
    }
  },

  async getMe() {
    return request("/api/v1/users/me/");
  },

  async completeProfile(profileData) {
    // profileData = { student_id, department_id, year, semester, bio }
    const data = await request("/api/v1/users/register/complete/", {
      method: "POST",
      body: {
        student_id: profileData.student_id,
        department: profileData.department_id,
        year: profileData.year,
        semester: profileData.semester,
        bio: profileData.bio || ""
      }
    });
    // Update local storage user profile
    const stored = getStoredUser();
    if (stored) {
      stored.profile_complete = true;
      localStorage.setItem("astu_user", JSON.stringify(stored));
    }
    return data;
  },

  async updateProfile(profileData) {
    return request("/api/v1/users/me/", {
      method: "PATCH",
      body: profileData
    });
  }
};

// ── ANNOUNCEMENTS ──
export const announcements = {
  async list() {
    return request("/api/v1/announcements/");
  }
};

// ── DEPARTMENTS ──
export const departments = {
  async list() {
    return request("/api/v1/departments/");
  },
  async get(id) {
    return request(`/api/v1/departments/${id}/`);
  }
};

// ── COURSES & CHAPTERS ──
export const courses = {
  async list() {
    return request("/api/v1/courses/");
  },
  async listPersonalized() {
    return request("/api/v1/courses/my/");
  },
  async get(id) {
    return request(`/api/v1/courses/${id}/`);
  },
  async getChapter(id) {
    return request(`/api/v1/chapters/${id}/`);
  }
};

// ── MATERIALS ──
export const materials = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/api/v1/materials/${query ? `?${query}` : ""}`);
  },
  async trackDownload(id) {
    return request(`/api/v1/materials/${id}/download/`, { method: "POST" });
  }
};

// ── PROJECTS & KANBAN ──
export const projects = {
  async list() {
    return request("/api/v1/projects/");
  },
  async listExplore() {
    return request("/api/v1/projects/explore/");
  },
  async get(id) {
    return request(`/api/v1/projects/${id}/`);
  },
  async create(projectData) {
    return request("/api/v1/projects/", {
      method: "POST",
      body: projectData
    });
  },
  async delete(id) {
    return request(`/api/v1/projects/${id}/`, { method: "DELETE" });
  },
  async getTasks(projectId) {
    return request(`/api/v1/projects/${projectId}/tasks/`);
  },
  async createTask(projectId, taskData) {
    return request(`/api/v1/projects/${projectId}/tasks/`, {
      method: "POST",
      body: taskData
    });
  },
  async moveTask(taskId, newStatus) {
    return request(`/api/v1/tasks/${taskId}/move/`, {
      method: "PATCH",
      body: { status: newStatus }
    });
  },
  async getMessages(projectId) {
    return request(`/api/v1/projects/${projectId}/messages/`);
  },
  async sendMessage(projectId, content) {
    return request(`/api/v1/projects/${projectId}/messages/`, {
      method: "POST",
      body: { content }
    });
  },
  async getActivity(projectId) {
    return request(`/api/v1/projects/${projectId}/activity/`);
  }
};

// ── SEARCH ──
export const search = {
  async global(q) {
    return request(`/api/v1/search/?q=${encodeURIComponent(q)}`);
  }
};

// ── AI ASSISTANT ──
export const ai = {
  async askHome(question, history = []) {
    return request("/api/v1/ai/home/", {
      method: "POST",
      body: { question, history }
    });
  },

  async askProject(projectId, question, history = []) {
    return request("/api/v1/ai/project/", {
      method: "POST",
      body: { project_id: projectId, question, history }
    });
  },

  async getNotes(chapterId) {
    return request(`/api/v1/ai/notes/${chapterId}/`);
  },

  async generateNotes(chapterId, forceRegenerate = false) {
    return request("/api/v1/ai/notes/generate/", {
      method: "POST",
      body: { chapter_id: chapterId, force_regenerate: forceRegenerate }
    });
  },

  // SSE Stream for chapter AI chat
  async streamChat(chapterId, question, history = [], onChunk, onError, onDone) {
    const fullUrl = `${BASE_URL}/api/v1/ai/chat/`;
    const headers = getHeaders({ "Content-Type": "application/json" });
    
    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          chapter_id: chapterId,
          question,
          history
        })
      });

      if (response.status === 401 && refreshToken) {
        const refreshed = await attemptRefresh();
        if (refreshed) {
          // Retry stream
          return streamChat(chapterId, question, history, onChunk, onError, onDone);
        } else {
          clearAuth();
          window.dispatchEvent(new Event("astu-unauthorized"));
          throw new Error("Unauthorized");
        }
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || "AI response failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Save the last partial line back to the buffer
        buffer = lines.pop();

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith("data: ")) {
            const dataStr = cleanLine.substring(6).trim();
            if (dataStr === "[DONE]") {
              onDone();
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                onError(new Error(data.error));
                return;
              }
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (err) {
              // Ignore partial JSON parse errors
            }
          }
        }
      }
      
      onDone();
    } catch (error) {
      onError(error);
    }
  }
};
