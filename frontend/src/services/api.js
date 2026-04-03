const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ detail: "Unexpected error" }));
    throw new Error(payload.detail || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  getCategories: (token) => request("/categories", { token }),
  createCategory: (payload, token) => request("/categories", { method: "POST", body: payload, token }),
  getTransactions: (token) => request("/transactions", { token }),
  createTransaction: (payload, token) => request("/transactions", { method: "POST", body: payload, token }),
  updateTransaction: (id, payload, token) =>
    request(`/transactions/${id}`, { method: "PUT", body: payload, token }),
  deleteTransaction: (id, token) => request(`/transactions/${id}`, { method: "DELETE", token }),
  getBudgets: (token) => request("/budgets", { token }),
  createBudget: (payload, token) => request("/budgets", { method: "POST", body: payload, token }),
  getAnalytics: (month, year, token) => request(`/analytics/dashboard?month=${month}&year=${year}`, { token }),
  getMonthlyReport: (month, year, token) => request(`/reports/monthly?month=${month}&year=${year}`, { token }),
};
