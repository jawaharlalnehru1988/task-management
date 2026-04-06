import React from "react";
import { motion } from "framer-motion";
import { Trash2, Hash, Calendar, AlertCircle, Circle, CheckCircle2 } from "lucide-react";
import { format, isPast, isToday, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, PRIORITY_COLORS } from "@/types/task";

export function TaskCard({
  task,
  onDragStart,
  onDelete,
  onStatusChange,
  onSelect,
}: {
  task: Task;
  onDragStart: (e: any, id: number) => void;
  onDelete: () => void;
  onStatusChange?: () => void;
  onSelect: () => void;
}) {
  const isPastDue = isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));
  const isDueToday = isToday(parseISO(task.due_date));
  const showDateAlert = (isPastDue || isDueToday) && task.status !== "Completed";

  return (
    <motion.div
      layout
      layoutId={String(task.id)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      draggable
      onDragStart={(e: any) => onDragStart(e, task.id)}
      onClick={onSelect}
      className={cn(
        "group bg-white p-4 rounded-xl shadow-sm border border-[#dadce0] hover:shadow-md cursor-grab active:cursor-grabbing w-full flex flex-col gap-3 relative overflow-hidden transition-[box-shadow]",
        task.status === "Completed" && "opacity-75 bg-gray-50/50"
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          {onStatusChange && (
            <button 
              onClick={(e) => { e.stopPropagation(); onStatusChange(); }}
              title="Mark as Completed"
              className="text-gray-300 hover:text-green-500 transition-colors"
            >
              <Circle className="w-4 h-4" />
            </button>
          )}
          {task.status === "Completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border",
              PRIORITY_COLORS[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-md -mt-1 -mr-1"
          title="Delete Task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <h3 className={cn("font-medium text-gray-800 leading-snug", task.status === "Completed" && "line-through text-gray-500")}>
        {task.title}
      </h3>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-0.5 bg-[#F1F3F4] text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-100"
            >
              <Hash className="w-3 h-3 text-gray-400" />
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-100">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              showDateAlert
                ? "text-red-600"
                : "text-gray-500"
            )}
          >
            {showDateAlert ? (
              <AlertCircle className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            {showDateAlert && isPastDue ? "Overdue" : showDateAlert && isDueToday ? "Due Today" : format(parseISO(task.due_date), "MMM d")}
          </div>

          <div className="relative">
             <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm" title="Assigned to User">
                AJ
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
