import { Task, Status, Epic } from "@/types/task";

const API_BASE = "https://api.asknehru.com/api/tasks/";
const EPIC_API_BASE = "https://api.asknehru.com/api/epics/";

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function fetchEpics(): Promise<Epic[]> {
  const res = await fetch(EPIC_API_BASE);
  if (!res.ok) throw new Error("Failed to fetch epics");
  return res.json();
}

export async function createTask(data: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

export async function createEpic(data: Omit<Epic, "id" | "created_at" | "updated_at">): Promise<Epic> {
  const res = await fetch(EPIC_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create epic");
  return res.json();
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update task ${id}`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete task ${id}`);
}
