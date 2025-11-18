"use client";

import { Users, GraduationCap, UserCheck, School, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchoolDetails {
  name?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string;
  timezone?: string | null;
}

interface UserCardProps {
  type: "admin" | "teacher" | "student" | "parent" | "school";
  count?: number;
  label?: string;
  schoolDetails?: SchoolDetails;
}

const UserCard = ({ type, count, label, schoolDetails }: UserCardProps) => {
  const config = {
    admin: {
      icon: TrendingUp,
      bgGradient: "from-blue-500 via-blue-600 to-blue-700",
      iconBg: "bg-blue-400/20",
      iconColor: "text-blue-300",
      label: "Attendance %",
      defaultCount: 0,
    },
    teacher: {
      icon: GraduationCap,
      bgGradient: "from-purple-500 via-purple-600 to-purple-700",
      iconBg: "bg-purple-400/20",
      iconColor: "text-purple-300",
      label: "Teachers",
      defaultCount: 0,
    },
    student: {
      icon: UserCheck,
      bgGradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-400/20",
      iconColor: "text-emerald-300",
      label: "Students",
      defaultCount: 0,
    },
    parent: {
      icon: Users,
      bgGradient: "from-orange-500 via-orange-600 to-orange-700",
      iconBg: "bg-orange-400/20",
      iconColor: "text-orange-300",
      label: "Parents",
      defaultCount: 0,
    },
    school: {
      icon: School,
      bgGradient: "from-indigo-500 via-indigo-600 to-indigo-700",
      iconBg: "bg-indigo-400/20",
      iconColor: "text-indigo-300",
      label: "School",
      defaultCount: 1,
    },
  };

  const { icon: Icon, bgGradient, iconBg, iconColor, label: defaultLabel, defaultCount } = config[type];
  const displayCount = count ?? defaultCount;
  const displayLabel = label ?? defaultLabel;

  // Special rendering for school card with details
  if (type === "school" && schoolDetails) {
    return (
      <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(50%-0.67rem)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full sm:flex-shrink-0">
        <div className={cn("bg-gradient-to-br", bgGradient, "p-5 w-full h-full min-h-[160px] flex flex-col justify-between")}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-white/90 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {displayLabel}
              </p>
              <p className="text-white text-base font-bold leading-tight mb-2">
                {schoolDetails.name || "School Name"}
              </p>
              <div className="space-y-1">
                {schoolDetails.address && (
                  <p className="text-white/80 text-xs leading-snug truncate">
                    📍 {schoolDetails.address}
                  </p>
                )}
                {schoolDetails.country && (
                  <p className="text-white/80 text-xs">
                    🌍 {schoolDetails.country}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {schoolDetails.phone && (
                    <p className="text-white/80 text-xs">
                      📞 {schoolDetails.phone}
                    </p>
                  )}
                  {schoolDetails.email && (
                    <p className="text-white/80 text-xs truncate">
                      ✉️ {schoolDetails.email}
                    </p>
                  )}
                </div>
                {schoolDetails.timezone && (
                  <p className="text-white/70 text-xs">
                    🕐 {schoolDetails.timezone}
                  </p>
                )}
              </div>
            </div>
            <div className={cn("rounded-xl p-2.5 flex-shrink-0", iconBg)}>
              <Icon className={cn("h-6 w-6", iconColor)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.67rem)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full sm:flex-shrink-0">
      <div className={cn("bg-gradient-to-br", bgGradient, "p-5 w-full h-full min-h-[160px] flex flex-col justify-between")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-white/90 text-xs font-semibold uppercase tracking-wider mb-1.5">
              {displayLabel}
            </p>
            <p className="text-white text-2xl font-bold">
              {displayLabel.includes("%") ? `${displayCount}%` : displayCount.toLocaleString()}
            </p>
          </div>
          <div className={cn("rounded-xl p-2.5 flex-shrink-0", iconBg)}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
        {type === "admin" && displayLabel.includes("%") && (
          <div className="mt-3 pt-2 border-t border-white/20">
            <p className="text-white/70 text-xs">Overall attendance rate</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;

