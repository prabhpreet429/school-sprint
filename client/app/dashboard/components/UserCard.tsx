"use client";

import { Users, GraduationCap, UserCheck, School, TrendingUp, MapPin, Globe, Phone, Mail, Clock } from "lucide-react";
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
      bgGradient: "from-slate-600 via-slate-700 to-slate-800",
      iconBg: "bg-slate-500/30",
      iconColor: "text-slate-200",
      label: "Attendance %",
      defaultCount: 0,
    },
    teacher: {
      icon: GraduationCap,
      bgGradient: "from-violet-600 via-purple-600 to-purple-700",
      iconBg: "bg-violet-500/30",
      iconColor: "text-violet-200",
      label: "Teachers",
      defaultCount: 0,
    },
    student: {
      icon: UserCheck,
      bgGradient: "from-teal-600 via-cyan-600 to-blue-600",
      iconBg: "bg-teal-500/30",
      iconColor: "text-teal-200",
      label: "Students",
      defaultCount: 0,
    },
    parent: {
      icon: Users,
      bgGradient: "from-amber-600 via-orange-600 to-orange-700",
      iconBg: "bg-amber-500/30",
      iconColor: "text-amber-200",
      label: "Parents",
      defaultCount: 0,
    },
    school: {
      icon: School,
      bgGradient: "from-slate-700 via-indigo-700 to-indigo-800",
      iconBg: "bg-indigo-500/30",
      iconColor: "text-indigo-200",
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
      <div className="w-full h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className={cn("bg-gradient-to-br", bgGradient, "p-5 w-full h-full flex flex-col justify-between")}>
          {/* School Name - Centered */}
          <div className="text-center mb-3">
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1">
              {displayLabel}
            </p>
            <h3 className="text-white text-lg font-bold leading-tight drop-shadow-sm">
              {schoolDetails.name || "School Name"}
            </h3>
          </div>

          {/* Split Layout - Left and Right */}
          <div className="flex items-start gap-6 px-2">
            {/* Left Column */}
            <div className="flex-1 min-w-0 space-y-2.5">
              {schoolDetails.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-white/70 flex-shrink-0 mt-0.5" />
                  <p className="text-white/85 text-sm leading-relaxed line-clamp-2">
                    {schoolDetails.address}
                  </p>
                </div>
              )}
              {schoolDetails.country && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-white/70 flex-shrink-0" />
                  <p className="text-white/85 text-sm font-medium">
                    {schoolDetails.country}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="flex-1 min-w-0 space-y-2.5 text-right">
              {schoolDetails.phone && (
                <div className="flex items-center justify-end gap-2">
                  <p className="text-white/85 text-sm font-medium">
                    {schoolDetails.phone}
                  </p>
                  <Phone className="h-4 w-4 text-white/70 flex-shrink-0" />
                </div>
              )}
              {schoolDetails.email && (
                <div className="flex items-center justify-end gap-2">
                  <p className="text-white/85 text-sm font-medium truncate">
                    {schoolDetails.email}
                  </p>
                  <Mail className="h-4 w-4 text-white/70 flex-shrink-0" />
                </div>
              )}
              {schoolDetails.timezone && (
                <div className="flex items-center justify-end gap-2">
                  <p className="text-white/75 text-sm font-medium">
                    {schoolDetails.timezone}
                  </p>
                  <Clock className="h-4 w-4 text-white/70 flex-shrink-0" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-[200px] h-full rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0">
      <div className={cn("bg-gradient-to-br", bgGradient, "p-5 w-full h-full flex flex-col justify-between")}>
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

