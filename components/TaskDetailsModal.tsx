import React from "react";
import { motion } from "framer-motion";
import { format, isPast, isToday, parseISO } from "date-fns";
import { X, AlignLeft, AlertCircle, Calendar, Hash } from "lucide-react";
import { Task, Status, COLUMNS, PRIORITY_COLORS } from "@/types/task";
import { cn } from "@/lib/utils";

export function TaskDetailsModal({ 
  task, 
  onClose, 
  onStatusChange 
}: { 
  task: Task, 
  onClose: () => void, 
  onStatusChange: (status: Status) => void 
}) {
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
             <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
               {task.title}
             </h2>
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
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {task.description || "No detailed description provided for this task."}
                </p>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
             {task.start_date && (
               <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Start Date</h4>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {format(parseISO(task.start_date), "MMMM d, yyyy")}
                  </div>
               </div>
             )}
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Due Date</h4>
                <div className={cn("flex items-center gap-2 text-sm font-medium", showDateAlert ? "text-red-600" : "text-gray-600")}>
                  {showDateAlert ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                  {format(parseISO(task.due_date), "MMMM d, yyyy")}
                </div>
             </div>
             <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Assignee</h4>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shadow-sm">
                      AJ
                   </div>
                   <span className="text-sm text-gray-600 font-medium">Alex Johnson</span>
                </div>
             </div>
          </div>

          <div>
             <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
               <Hash className="w-4 h-4 text-gray-400" />
               Tags
             </h3>
             <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg border border-gray-200 font-medium hover:bg-gray-200 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
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
