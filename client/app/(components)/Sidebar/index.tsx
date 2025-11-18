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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

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
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
        hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 gap-3 transition-colors ${
          isActive ? "bg-blue-200 dark:bg-blue-700 text-white" : ""
        }
      }`}
      >
        <Icon className="w-6 h-6 !text-gray-700 dark:!text-gray-300" />

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700 dark:text-gray-300`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white dark:bg-gray-800 transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        Logo
        {/* <Image
          src="https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/logo.png"
          alt="edstock-logo"
          width={27}
          height={27}
          className="rounded w-8"
        /> */}
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl text-gray-900 dark:text-gray-100`}
        >
          EDSTOCK
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8">
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
          href="/settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">&copy; 2024 Edstock</p>
      </div>
    </div>
  );
};

export default Sidebar;