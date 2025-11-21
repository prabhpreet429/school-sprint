"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  GraduationCap,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  UserCheck,
  Users,
  BookOpen,
  School,
  Calendar,
  Megaphone,
  Layers,
  NotebookPen,
  BookMarked,
  ClipboardCheck,
  Trophy,
  CheckSquare,
  FileText,
  DollarSign,
  Receipt,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const schoolId = searchParams?.get("schoolId");
  
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  // Preserve schoolId in the URL if it exists
  const hrefWithSchoolId = schoolId ? `${href}?schoolId=${schoolId}` : href;

  return (
    <Link href={hrefWithSchoolId}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-3" : "justify-start px-6 py-3"
        }
        hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 gap-2 transition-colors ${
          isActive ? "bg-blue-200 dark:bg-blue-700 text-white" : ""
        }
      }`}
      >
        <Icon className="w-5 h-5 !text-gray-700 dark:!text-gray-300" />

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-sm text-gray-700 dark:text-gray-300`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-60 md:w-56"
  } bg-white dark:bg-gray-800 transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-2 justify-between md:justify-normal items-center pt-6 ${
          isSidebarCollapsed ? "px-4" : "px-6"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
            <img
              src="/schoolsprint-logo.png"
              alt="SchoolSprint Logo"
              className="w-full h-full object-cover rounded-full"
              style={{ maxWidth: '40px', maxHeight: '40px' }}
              onError={(e) => {
                console.error('Logo failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1
            className={`${
              isSidebarCollapsed ? "hidden" : "block"
            } font-extrabold text-xl text-gray-900 dark:text-gray-100 whitespace-nowrap`}
          >
            SchoolSprint
          </h1>
        </div>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-6 overflow-y-auto">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/teachers"
          icon={GraduationCap}
          label="Teachers"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/students"
          icon={UserCheck}
          label="Students"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/parents"
          icon={Users}
          label="Parents"
          isCollapsed={isSidebarCollapsed}
        />
        {user?.role === "admin" && (
          <>
            <SidebarLink
              href="/users"
              icon={Users}
              label="Users"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href="/accounts/create"
              icon={UserPlus}
              label="Create Account"
              isCollapsed={isSidebarCollapsed}
            />
          </>
        )}
        <SidebarLink
          href="/grades"
          icon={School}
          label="Grades"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/classes"
          icon={Layers}
          label="Classes"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/lessons"
          icon={NotebookPen}
          label="Lessons"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/subjects"
          icon={BookMarked}
          label="Subjects"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/assignments"
          icon={FileText}
          label="Assignments"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/exams"
          icon={ClipboardCheck}
          label="Exams"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/results"
          icon={Trophy}
          label="Results"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/attendances"
          icon={CheckSquare}
          label="Attendances"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/fees"
          icon={DollarSign}
          label="Fees"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/student-fees"
          icon={Receipt}
          label="Student Fees"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/payments"
          icon={DollarSign}
          label="Payments"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/events"
          icon={Calendar}
          label="Events"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/announcements"
          icon={Megaphone}
          label="Announcements"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">&copy; 2024 SchoolSprint</p>
      </div>
    </div>
  );
};

export default Sidebar;