"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Filter, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, Status, Priority, COLUMNS, PRIORITY_WEIGHT } from "@/types/task";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { AddTaskModal } from "@/components/AddTaskModal";
import { fetchTasks, createTask, updateTask, deleteTask as deleteApiTask } from "@/lib/api";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState<Status | null>(null);
  const [sortByUrgency, setSortByUrgency] = useState<Record<Status, boolean>>({
    Backlog: false,
    "To Do": false,
    "In Progress": false,
    Completed: false,
  });

  useEffect(() => {
    setIsClient(true);
    fetchTasks()
      .then(data => {
        setTasks(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load tasks", err);
        setIsLoading(false);
      });
  }, []);

  const handleDragStart = (e: any, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: Status) => {
    e.preventDefault();
    if (draggedTaskId === null) return;

    const idToUpdate = draggedTaskId;
    const taskIndex = tasks.findIndex(t => t.id === idToUpdate);
    if (taskIndex < 0) return;
    
    const oldTask = tasks[taskIndex];
    if (oldTask.status === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic Update
    setTasks((prev) =>
      prev.map((task) =>
        task.id === idToUpdate ? { ...task, status: targetStatus } : task
      )
    );
    setDraggedTaskId(null);

    // Persist API
    try {
      await updateTask(idToUpdate, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert if failed
      setTasks((prev) =>
        prev.map((task) =>
          task.id === idToUpdate ? { ...task, status: oldTask.status } : task
        )
      );
    }
  };

  const toggleSort = (status: Status) => {
    setSortByUrgency((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const handleCreateTask = async (newTaskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await createTask(newTaskData);
      setTasks([...tasks, created]);
      setIsAddingTask(null);
    } catch (err) {
      console.error("Creation failed", err);
      alert("Failed to create the task on server.");
    }
  };

  const handleDeleteTask = async (id: number) => {
    const backupTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    
    try {
      await deleteApiTask(id);
    } catch (err) {
      console.error("Deletion failed", err);
      setTasks(backupTasks); 
    }
  };

  const handleStatusChangeBtn = async (id: number, newStatus: Status) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex < 0) return;
    const oldStatus = tasks[taskIndex].status;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(id, { status: newStatus });
      if (selectedTask?.id === id) {
          setSelectedTask(prev => prev ? {...prev, status: newStatus} : null);
      }
    } catch (error) {
      console.error("Status update error", error);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: oldStatus } : t))
      );
    }
  };

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Syncing with Server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 text-gray-800 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
            Task Management
          </h1>
          <p className="text-gray-500 mt-1.5 md:ml-10 text-sm">Organize your work with this Google Workspace inspired board.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsAddingTask("To Do")}
             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2 text-sm"
           >
             <Plus className="w-4 h-4" /> Add Task
           </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start h-full pb-10 overflow-x-auto snap-x snap-mandatory hide-scrollbars">
        {COLUMNS.map((columnStatus) => {
          let columnTasks = tasks.filter((t) => t.status === columnStatus);
          
          if (sortByUrgency[columnStatus]) {
            columnTasks = [...columnTasks].sort(
              (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
            );
          }

          return (
            <div
              key={columnStatus}
              className="flex-1 w-full min-w-[320px] md:min-w-[300px] shrink-0 bg-[#F1F3F4] rounded-xl flex flex-col shadow-sm border border-transparent snap-center transition-colors"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnStatus)}
            >
              <div className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-gray-800 tracking-tight">{columnStatus}</h2>
                  <span className="bg-gray-200/80 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleSort(columnStatus)}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      sortByUrgency[columnStatus] ? "bg-white text-blue-600 shadow-sm" : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    )}
                    title="Priority Check Filter"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsAddingTask(columnStatus)}
                    className="p-1.5 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-md transition-colors"
                    title="Quick Add"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="px-3 pb-3 pt-1 flex-1 overflow-y-auto w-full min-h-[500px] flex flex-col gap-3">
                <AnimatePresence>
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDragStart={handleDragStart}
                      onDelete={() => handleDeleteTask(task.id)}
                      onStatusChange={columnStatus !== "Completed" ? () => handleStatusChangeBtn(task.id, "Completed") : undefined}
                      onSelect={() => setSelectedTask(task)}
                    />
                  ))}
                </AnimatePresence>
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400 border-2 border-dashed border-gray-300 rounded-lg mx-1 mt-1 transition-colors hover:border-gray-400 hover:text-gray-500 cursor-default">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)}
            onStatusChange={(status) => handleStatusChangeBtn(selectedTask.id, status)}
          />
        )}
        {isAddingTask && (
          <AddTaskModal 
             onClose={() => setIsAddingTask(null)}
             onAddTask={handleCreateTask}
             initialStatus={isAddingTask}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
