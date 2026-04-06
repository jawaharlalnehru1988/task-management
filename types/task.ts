export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "Backlog" | "To Do" | "In Progress" | "Completed";

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  start_date?: string | null;
  priority: Priority;
  status: Status;
  due_date: string;
  tags: string[];
  assigned_to?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const COLUMNS: Status[] = ["Backlog", "To Do", "In Progress", "Completed"];

export const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Low: "bg-green-50 text-green-700 border-green-200",
};

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};
