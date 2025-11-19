"use client";

import { useGetAnnouncementsQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation, useDeleteAnnouncementMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateAnnouncementModal from "./CreateAnnouncementModal";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Announcements = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);

  if (isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const { data, error, isLoading, isFetching } = useGetAnnouncementsQuery({ 
    schoolId, 
    search: searchTerm || undefined 
  });
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const handleCreateAnnouncement = async (announcementData: any) => {
    try {
      await createAnnouncement(announcementData).unwrap();
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const handleUpdateAnnouncement = async (id: number, announcementData: any) => {
    try {
      await updateAnnouncement({ id, data: announcementData }).unwrap();
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error("Error updating announcement:", error);
    }
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(id).unwrap();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Failed to delete announcement");
      }
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-center text-lg font-semibold">
          Access Denied
        </p>
      </div>
    );
  }

  const announcements = data?.data || [];

  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <Header name="Announcements" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <PlusCircleIcon size={20} />
          Create Announcement
        </button>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900">
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((announcement: any) => (
                <TableRow key={announcement.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell className="font-medium">{announcement.title}</TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate" title={announcement.description}>
                      {announcement.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Extract date part directly to avoid timezone conversion
                      const dateStr = typeof announcement.date === 'string' 
                        ? announcement.date 
                        : announcement.date.toISOString();
                      const dateOnly = dateStr.includes('T') 
                        ? dateStr.split('T')[0] 
                        : dateStr;
                      const [year, month, day] = dateOnly.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return format(date, "MMM dd, yyyy");
                    })()}
                  </TableCell>
                  <TableCell>{announcement.class?.name || "All Classes"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        onCreate={handleCreateAnnouncement}
        onUpdate={handleUpdateAnnouncement}
        initialData={editingAnnouncement}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Announcements;

