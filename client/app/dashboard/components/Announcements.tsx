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
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Announcements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 hover:shadow-md transition-all duration-300"
              >
                <h3 className="font-semibold text-sm mb-2 text-foreground">{announcement.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {announcement.description}
                </p>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
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

