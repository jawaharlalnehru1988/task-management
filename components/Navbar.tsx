"use client";

import React, { useState } from "react";
import { User as UserIcon, Bell, Search, ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 relative z-50">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search tasks, epics..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5">
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1" />

        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 pl-2 group cursor-pointer outline-none"
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 leading-tight">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Guest User"}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {user?.email || "Member"}
              </span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              {user?.username ? (
                <span className="font-bold text-sm uppercase">{user.username.substring(0, 2)}</span>
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all ${isMenuOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-50 sm:hidden">
                    <p className="text-sm font-bold text-gray-900">{user?.username}</p>
                    <p className="text-[10px] text-gray-500">{user?.email}</p>
                  </div>
                  
                  <div className="p-1.5">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                      <UserCircle className="w-4 h-4" /> My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                  </div>

                  <div className="h-px bg-gray-50 my-1" />

                  <div className="p-1.5">
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
