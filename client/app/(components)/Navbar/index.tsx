"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { Bell, Menu, Moon, Sun, LogOut } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const { user, logout } = useAuth();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* LEFT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <div>
            <button onClick={toggleDarkMode}>
              {isDarkMode ? (
                <Sun className="cursor-pointer text-gray-500 dark:text-gray-400" size={24} />
              ) : (
                <Moon className="cursor-pointer text-gray-500 dark:text-gray-400" size={24} />
              )}
            </button>
          </div>
          {/* <div className="relative">
            <Bell className="cursor-pointer text-gray-500 dark:text-gray-400" size={24} />
            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div> */}
          <hr className="w-0 h-7 border border-solid border-l border-gray-300 dark:border-gray-600 mx-3" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 cursor-pointer">
              Logo
              {/* <Image
                src="https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/profile.jpg"
                alt="Profile"
                width={50}
                height={50}
                className="rounded-full h-full object-cover"
              /> */}
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {user?.username || "User"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || ""}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;