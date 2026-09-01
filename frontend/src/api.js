const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isForm = options.body instanceof FormData;

  if (!isForm && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request("/auth/me"),

  users: () => request("/users"),

  role: (id, role) =>
    request(`/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  projects: () => request("/projects"),

  createProject: (body) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateProject: (id, body) =>
    request(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteProject: (id) =>
    request(`/projects/${id}`, {
      method: "DELETE",
    }),

  bugs: (query = "") =>
    request(`/bugs${query}`),

  bug: (id) =>
    request(`/bugs/${id}`),

  createBug: (form) =>
    request("/bugs", {
      method: "POST",
      body: form,
    }),

  updateBug: (id, form) =>
    request(`/bugs/${id}`, {
      method: "PUT",
      body: form,
    }),

  status: (id, status) =>
    request(`/bugs/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assign: (id, assignedTo) =>
    request(`/bugs/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ assignedTo }),
    }),

  comment: (id, text) =>
    request(`/bugs/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  deleteBug: (id) =>
    request(`/bugs/${id}`, {
      method: "DELETE",
    }),

  stats: () =>
    request("/dashboard/stats"),
};

export const API_BASE = API.replace(/\/api$/, "");

