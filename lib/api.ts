import { Task, Status, Epic } from "@/types/task";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

const DEFAULT_API_ORIGIN = "https://api.asknehru.com";
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
const API_ROOT = `${API_ORIGIN}/api`;

const API_BASE = `${API_ROOT}/tasks/`;
const EPIC_API_BASE = `${API_ROOT}/epics/`;
const AUTH_API_BASE = `${API_ROOT}/auth`;

function getHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function loginApi(usernameOrEmail: string, password: string): Promise<{ token: string, user: User }> {
  const res = await fetch(`${AUTH_API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Invalid credentials (Status: ${res.status})`);
  }
  return res.json();
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(API_BASE, { headers: getHeaders() });
  if (res.status === 401) {
     if (typeof window !== "undefined") localStorage.removeItem("auth_token");
     throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchEpics(): Promise<Epic[]> {
  const res = await fetch(EPIC_API_BASE, { headers: getHeaders() });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to fetch epics");
  return res.json();
}

export async function createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function createEpic(data: Omit<Epic, "id" | "created_at" | "updated_at">): Promise<Epic> {
  const res = await fetch(EPIC_API_BASE, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create epic");
  return res.json();
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update task ${id}`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete task ${id}`);
}

export async function deleteEpic(id: number): Promise<void> {
  const res = await fetch(`${EPIC_API_BASE}${id}/`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete epic ${id}`);
}
