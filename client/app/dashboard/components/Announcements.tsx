"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { DashboardAnnouncement } from "@/state/api";
import { format } from "date-fns";

interface AnnouncementsProps {
  announcements: DashboardAnnouncement[];
}

const Announcements = ({ announcements }: AnnouncementsProps) => {

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-900/20 dark:via-pink-900/20 dark:to-fuchsia-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-rose-200/50 dark:border-rose-700/50">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 bg-gradient-to-r from-rose-100/80 to-pink-100/80 dark:from-rose-800/30 dark:to-pink-800/30 rounded-xl border border-rose-200/50 dark:border-rose-700/50 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-semibold text-sm mb-2 text-foreground">{announcement.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {announcement.description}
                </p>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {format(new Date(announcement.date), "MMM dd, yyyy")}
                  {announcement.className && ` • ${announcement.className}`}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No announcements</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Announcements;

