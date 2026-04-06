import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, isPast, isToday, parseISO } from "date-fns";
import { X, AlignLeft, AlertCircle, Calendar, Hash } from "lucide-react";
import { Task, Status, COLUMNS, PRIORITY_COLORS } from "@/types/task";
import { cn } from "@/lib/utils";

export function TaskDetailsModal({ 
  task, 
  onClose, 
  onStatusChange,
  onUpdateTask 
}: { 
  task: Task, 
  onClose: () => void, 
  onStatusChange: (status: Status) => void,
  onUpdateTask: (updates: Partial<Task>) => void
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(task.title);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDescValue, setEditDescValue] = useState(task.description || "");

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    if (editTitleValue.trim() !== task.title && editTitleValue.trim() !== "") {
      onUpdateTask({ title: editTitleValue.trim() });
    } else {
      setEditTitleValue(task.title);
    }
  };

  const handleDescSave = () => {
    setIsEditingDesc(false);
    const newDesc = editDescValue.trim() === "" ? null : editDescValue.trim();
    if (newDesc !== task.description) {
      onUpdateTask({ description: newDesc });
    }
  };
  
  const [isEditingStartDate, setIsEditingStartDate] = useState(false);
  const [editStartDateValue, setEditStartDateValue] = useState(task.start_date ? task.start_date.split("T")[0] : "");
  const handleStartDateSave = () => {
    setIsEditingStartDate(false);
    const apiVal = editStartDateValue ? new Date(editStartDateValue).toISOString() : null;
    if (apiVal !== task.start_date) {
      onUpdateTask({ start_date: apiVal });
    }
  };

  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editDueDateValue, setEditDueDateValue] = useState(task.due_date ? task.due_date.split("T")[0] : "");
  const handleDueDateSave = () => {
    setIsEditingDueDate(false);
    if (!editDueDateValue) return; // Due date is required
    const apiVal = new Date(editDueDateValue).toISOString();
    if (apiVal !== task.due_date) {
      onUpdateTask({ due_date: apiVal });
    }
  };

  const [isEditingAssignee, setIsEditingAssignee] = useState(false);
  const [editAssigneeValue, setEditAssigneeValue] = useState(task.assigned_to || "");
  const handleAssigneeSave = () => {
    setIsEditingAssignee(false);
    const newVal = editAssigneeValue.trim() === "" ? null : editAssigneeValue.trim();
    if (newVal !== task.assigned_to) {
      onUpdateTask({ assigned_to: newVal });
    }
  };
  const isPastDue = isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
  const isDueToday = isToday(parseISO(task.due_date));
  const showDateAlert = (isPastDue || isDueToday) && task.status !== "Completed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        layoutId={String(task.id)}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
             <div className="flex flex-wrap items-center gap-3">
                <span className={cn("text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border", PRIORITY_COLORS[task.priority])}>
                  {task.priority} Priority
                </span>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {task.status}
                </span>
             </div>
             {isEditingTitle ? (
               <input
                 autoFocus
                 value={editTitleValue}
                 onChange={(e) => setEditTitleValue(e.target.value)}
                 onBlur={handleTitleSave}
                 onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                 className="text-2xl font-semibold text-gray-900 leading-tight w-full bg-white border border-blue-400 rounded px-2 py-1 outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
               />
             ) : (
               <h2 
                 onDoubleClick={() => { setEditTitleValue(task.title); setIsEditingTitle(true); }}
                 className="text-2xl font-semibold text-gray-900 leading-tight cursor-text hover:bg-gray-50 p-1 rounded -ml-1 transition-colors border border-transparent hover:border-gray-200"
                 title="Double click to edit"
               >
                 {task.title}
               </h2>
             )}
          </div>
          <button 
             onClick={onClose} 
             className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors self-start shrink-0"
          >
             <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-8">
          <div className="flex items-start gap-3">
             <AlignLeft className="w-5 h-5 text-gray-400 mt-1" />
             <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Description</h3>
                {isEditingDesc ? (
                  <textarea
                    autoFocus
                    value={editDescValue}
                    onChange={(e) => setEditDescValue(e.target.value)}
                    onBlur={handleDescSave}
                    className="w-full text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-white border border-blue-400 rounded px-3 py-2 outline-none shadow-sm focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                  />
                ) : (
                  <p 
                    onDoubleClick={() => { setEditDescValue(task.description || ""); setIsEditingDesc(true); }}
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-wrap cursor-text hover:bg-gray-50 p-2 rounded -ml-2 transition-colors border border-transparent hover:border-gray-200 min-h-[60px]", 
                      !task.description ? "text-gray-400 italic" : "text-gray-600"
                    )}
                    title="Double click to edit"
                  >
                    {task.description || "Double click to add a description..."}
                  </p>
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Start Date</h4>
                {isEditingStartDate ? (
                  <input
                    type="date"
                    autoFocus
                    value={editStartDateValue}
                    onChange={(e) => setEditStartDateValue(e.target.value)}
                    onBlur={handleStartDateSave}
                    className="w-full text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded px-2 py-1 outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    onDoubleClick={() => { setEditStartDateValue(task.start_date ? task.start_date.split("T")[0] : ""); setIsEditingStartDate(true); }}
                    className={cn(
                       "flex items-center gap-2 text-sm font-medium cursor-text hover:bg-gray-200/50 p-1 rounded -ml-1 transition-colors border border-transparent hover:border-gray-200 min-h-[32px]", 
                       !task.start_date ? "text-gray-400 italic" : "text-gray-600"
                    )}
                    title="Double click to edit"
                  >
                    <Calendar className="w-4 h-4" />
                    {task.start_date ? format(parseISO(task.start_date), "MMMM d, yyyy") : "No start date..."}
                  </div>
                )}
             </div>
             
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Due Date *</h4>
                {isEditingDueDate ? (
                  <input
                    type="date"
                    autoFocus
                    required
                    value={editDueDateValue}
                    onChange={(e) => setEditDueDateValue(e.target.value)}
                    onBlur={handleDueDateSave}
                    className="w-full text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded px-2 py-1 outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    onDoubleClick={() => { setEditDueDateValue(task.due_date ? task.due_date.split("T")[0] : ""); setIsEditingDueDate(true); }}
                    className={cn(
                       "flex items-center gap-2 text-sm font-medium cursor-text hover:bg-gray-200/50 p-1 rounded -ml-1 transition-colors border border-transparent hover:border-gray-200 min-h-[32px]", 
                       showDateAlert ? "text-red-600" : "text-gray-600"
                    )}
                    title="Double click to edit"
                  >
                    {showDateAlert ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    {task.due_date ? format(parseISO(task.due_date), "MMMM d, yyyy") : "Set due date..."}
                  </div>
                )}
             </div>
             
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Assignee</h4>
                {isEditingAssignee ? (
                  <input
                    autoFocus
                    value={editAssigneeValue}
                    onChange={(e) => setEditAssigneeValue(e.target.value)}
                    onBlur={handleAssigneeSave}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAssigneeSave(); }}
                    placeholder="E.g. Alex Johnson"
                    className="w-full text-sm font-medium text-gray-800 bg-white border border-blue-400 rounded px-2 py-1 outline-none shadow-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div 
                    onDoubleClick={() => { setEditAssigneeValue(task.assigned_to || ""); setIsEditingAssignee(true); }}
                    className="flex items-center gap-2 cursor-text hover:bg-gray-200/50 p-1 rounded -ml-1 transition-colors border border-transparent hover:border-gray-200 min-h-[32px]"
                    title="Double click to edit"
                  >
                     <div className="w-6 h-6 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {task.assigned_to ? task.assigned_to.substring(0, 2).toUpperCase() : "?"}
                     </div>
                     <span className={cn("text-sm font-medium truncate", !task.assigned_to ? "text-gray-400 italic" : "text-gray-600")}>
                        {task.assigned_to || "Unassigned..."}
                     </span>
                  </div>
                )}
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
           <div className="text-sm text-gray-400 font-medium px-2 uppercase tracking-wide">
             ID: {task.id}
           </div>
           <select 
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value as Status)}
              className="bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
           >
              {COLUMNS.map(col => <option key={col} value={col}>Move to {col}</option>)}
           </select>
        </div>
      </motion.div>
    </div>
  );
}
