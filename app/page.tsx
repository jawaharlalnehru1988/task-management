"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, CheckCircle2, Layout, FolderKanban, Hash, Trash2, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Task, Status, Priority, COLUMNS, PRIORITY_WEIGHT, Epic } from "@/types/task";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailsModal } from "@/components/TaskDetailsModal";
import { AddTaskModal } from "@/components/AddTaskModal";
import { fetchTasks, fetchEpics, createEpic, createTask, updateTask, deleteTask as deleteApiTask, deleteEpic as deleteApiEpic } from "@/lib/api";

export default function KanbanBoard() {
  const { token, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Epic specific states
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null);
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [deletingEpicId, setDeletingEpicId] = useState<number | null>(null);
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [newEpicClient, setNewEpicClient] = useState("");

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
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isClient, authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      Promise.all([fetchTasks(), fetchEpics()])
        .then(([tasksData, epicsData]) => {
          setTasks(tasksData);
          setEpics(epicsData);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load initial data", err);
          setIsLoading(false);
          if (err.message === "Unauthorized") {
            logout();
          }
        });
    }
  }, [isAuthenticated, logout]);

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

    setTasks((prev) =>
      prev.map((task) =>
        task.id === idToUpdate ? { ...task, status: targetStatus } : task
      )
    );
    setDraggedTaskId(null);

    try {
      await updateTask(idToUpdate, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status", err);
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
      // Inject currently selected epic inherently
      const mergedData = { ...newTaskData, epic: selectedEpicId };
      const created = await createTask(mergedData);
      setTasks([...tasks, created]);
      setIsAddingTask(null);
    } catch (err) {
      console.error("Creation failed", err);
      alert("Failed to create the task on server.");
    }
  };

  const handleCreateEpic = async () => {
    if (!newEpicTitle.trim()) return;
    try {
      const created = await createEpic({ 
        title: newEpicTitle.trim(), 
        client_name: newEpicClient.trim() || null 
      });
      setEpics([...epics, created]);
      setNewEpicTitle("");
      setNewEpicClient("");
      setIsAddingEpic(false);
      setSelectedEpicId(created.id);
    } catch (err) {
      console.error("Epic creation failed", err);
      alert("Failed to create Epic.");
    }
  };

  const handleDeleteEpic = async (id: number) => {
    const backupEpics = [...epics];
    setEpics((prev) => prev.filter((epic) => epic.id !== id));
    
    if (selectedEpicId === id) {
      setSelectedEpicId(null);
    }
    
    setDeletingEpicId(null);

    try {
      await deleteApiEpic(id);
    } catch (err) {
      console.error("Epic deletion failed", err);
      setEpics(backupEpics);
      alert("Failed to delete Epic on server.");
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
    await handleUpdateTaskData(id, { status: newStatus });
  };

  const handleUpdateTaskData = async (id: number, updates: Partial<Task>) => {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex < 0) return;
    const oldTask = tasks[taskIndex];

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    if (selectedTask?.id === id) {
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await updateTask(id, updates);
    } catch (error) {
      console.error("Task update error", error);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? oldTask : t))
      );
      if (selectedTask?.id === id) {
         setSelectedTask(oldTask);
      }
    }
  };

  if (!isClient || authLoading || (isAuthenticated && isLoading)) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Syncing with Server...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Filter tasks based on globally selected Epic Context
  const filteredTasks = selectedEpicId === null 
    ? tasks 
    : tasks.filter(t => t.epic === selectedEpicId);

  return (
    <div className="h-screen bg-[#F8F9FA] text-gray-800 font-sans flex overflow-hidden">
      
      {/* Left Sidebar Layout */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
         <div className="p-5 border-b border-gray-100 flex items-center gap-3">
             <div className="bg-blue-600 text-white p-2 rounded-lg">
                <CheckCircle2 className="w-6 h-6" />
             </div>
             <h1 className="text-lg font-bold tracking-tight text-gray-900">Workspace</h1>
         </div>
         
         <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3 ml-2 flex items-center gap-2">
              <Layout className="w-4 h-4" /> Views
            </h2>
            <div className="space-y-1 mb-8">
               <button
                 onClick={() => setSelectedEpicId(null)}
                 className={cn(
                   "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                   selectedEpicId === null ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                 )}
               >
                 <FolderKanban className="w-4 h-4" /> Global Flow
               </button>
            </div>

            <div className="flex items-center justify-between mb-3 ml-2">
               <h2 className="text-xs uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
                 <Hash className="w-4 h-4" /> Epics
               </h2>
               <button 
                 onClick={() => setIsAddingEpic(true)}
                 className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                 title="New Epic"
               >
                 <Plus className="w-3.5 h-3.5" />
               </button>
            </div>
            
            {isAddingEpic && (
               <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-blue-100 shadow-sm space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Title</label>
                    <input
                      autoFocus
                      placeholder="Epic title..."
                      value={newEpicTitle}
                      onChange={(e) => setNewEpicTitle(e.target.value)}
                      onKeyDown={(e) => {
                         if (e.key === 'Enter') handleCreateEpic();
                         if (e.key === 'Escape') setIsAddingEpic(false);
                      }}
                      className="w-full text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Client Name</label>
                    <input
                      placeholder="Client..."
                      value={newEpicClient}
                      onChange={(e) => setNewEpicClient(e.target.value)}
                      onKeyDown={(e) => {
                         if (e.key === 'Enter') handleCreateEpic();
                         if (e.key === 'Escape') setIsAddingEpic(false);
                      }}
                      className="w-full text-sm font-medium text-gray-800 bg-white border border-gray-200 rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCreateEpic}
                      className="flex-1 text-xs font-bold bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setIsAddingEpic(false)}
                      className="flex-1 text-xs font-bold bg-white text-gray-500 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
               </div>
            )}

            <div className="space-y-1">
               {epics.map(epic => (
                  <div
                    key={epic.id}
                    onClick={() => setSelectedEpicId(epic.id)}
                    className={cn(
                      "w-full group flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors text-left font-medium cursor-pointer",
                      selectedEpicId === epic.id ? "bg-blue-50 text-blue-700 font-semibold shadow-sm border border-blue-100/50" : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    )}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{epic.title}</span>
                      {epic.client_name && (
                        <span className="text-[10px] opacity-70 truncate font-normal leading-tight">
                          {epic.client_name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         setDeletingEpicId(epic.id);
                      }}
                      className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
                      title="Delete Epic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               ))}
            </div>
         </div>

         {/* Logout Section */}
         <div className="p-4 border-t border-gray-100">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group"
            >
              <div className="p-1.5 rounded-md group-hover:bg-red-100 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              Sign Out
            </button>
         </div>
      </aside>

      {/* Main Board View */}
      <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-2">
              {selectedEpicId === null ? "Global Flow" : epics.find(e => e.id === selectedEpicId)?.title || "Epic Flow"}
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              {selectedEpicId === null ? "Viewing all tasks across the workspace." : `Filtering tasks designated to this Epic.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddingTask("To Do")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm flex items-center gap-2 text-sm focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-6 items-start h-full pb-4 overflow-x-auto snap-x snap-mandatory">
          {COLUMNS.map((columnStatus) => {
            let columnTasks = filteredTasks.filter((t) => t.status === columnStatus);
            
            if (sortByUrgency[columnStatus]) {
              columnTasks = [...columnTasks].sort(
                (a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
              );
            }

            return (
              <div
                key={columnStatus}
                className="flex-[0_0_auto] w-full min-w-[280px] md:min-w-[260px] max-w-[280px] bg-[#F1F3F4] rounded-xl flex flex-col shadow-sm border border-transparent snap-center transition-colors h-full max-h-full"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnStatus)}
              >
                <div className="p-4 flex items-center justify-between group shrink-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 tracking-tight text-sm uppercase">{columnStatus}</h3>
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

                <div className="px-3 pb-3 pt-1 flex-1 overflow-y-auto w-full flex flex-col gap-3 min-h-[100px]">
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
      </main>

      <AnimatePresence>
        {selectedTask && (
          <TaskDetailsModal 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)}
            onStatusChange={(status) => handleStatusChangeBtn(selectedTask.id, status)}
            onUpdateTask={(updates) => handleUpdateTaskData(selectedTask.id, updates)}
          />
        )}
        {isAddingTask && (
          <AddTaskModal 
             onClose={() => setIsAddingTask(null)}
             onAddTask={handleCreateTask}
             initialStatus={isAddingTask}
          />
        )}
        {deletingEpicId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               onClick={() => setDeletingEpicId(null)}
             />
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-[70] p-6 relative"
             >
                <div className="flex items-center gap-4 mb-6">
                   <div className="bg-red-50 p-3 rounded-full">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                   </div>
                   <div>
                      <h2 className="text-lg font-bold text-gray-900">Delete Epic?</h2>
                      <p className="text-sm text-gray-500">This action cannot be undone and will unbind all tasks.</p>
                   </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                   <button 
                     onClick={() => setDeletingEpicId(null)}
                     className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors capitalize"
                   >
                     cancel
                   </button>
                   <button 
                     onClick={() => handleDeleteEpic(deletingEpicId)}
                     className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors capitalize shadow-sm"
                   >
                     delete
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
