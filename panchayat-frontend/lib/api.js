const API_BASE_URL = "http://localhost:8000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Request Failed");
  }
  // Handle file downloads (non-JSON)
  const contentType = response.headers.get("content-type");
  if (contentType && (contentType.includes("text/csv") || contentType.includes("application/octet-stream"))) {
    return response.blob();
  }
  return response.json();
}

export const api = {
  get: async (endpoint, token = null) => {
    const headers = { "Content-Type": "application/json" };
    const t = token || getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "GET", headers });
    return handleResponse(response);
  },

  post: async (endpoint, data, token = null) => {
    const headers = { "Content-Type": "application/json" };
    const t = token || getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "POST", headers, body: JSON.stringify(data) });
    return handleResponse(response);
  },

  put: async (endpoint, data, token = null) => {
    const headers = { "Content-Type": "application/json" };
    const t = token || getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "PUT", headers, body: JSON.stringify(data) });
    return handleResponse(response);
  },

  delete: async (endpoint, token = null) => {
    const headers = { "Content-Type": "application/json" };
    const t = token || getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "DELETE", headers });
    return handleResponse(response);
  },

  download: async (endpoint, filename, token = null) => {
    const headers = {};
    const t = token || getToken();
    if (t) headers["Authorization"] = `Bearer ${t}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "GET", headers });
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
