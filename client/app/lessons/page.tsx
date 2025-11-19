"use client";

import { useGetLessonsQuery, useCreateLessonMutation, useUpdateLessonMutation, useDeleteLessonMutation } from "@/state/api";
import Header from "@/app/(components)/Header";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlusCircleIcon, SearchIcon, Edit, Trash2 } from "lucide-react";
import CreateLessonModal from "./CreateLessonModal";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Lessons = () => {
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

  const { data, error, isLoading, isFetching } = useGetLessonsQuery({ 
    schoolId, 
    search: searchTerm || undefined 
  });
  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const handleCreateLesson = async (lessonData: any) => {
    try {
      await createLesson(lessonData).unwrap();
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Failed to create lesson:", error);
    }
  };

  const handleUpdateLesson = async (id: number, lessonData: any) => {
    try {
      await updateLesson({ id, data: lessonData }).unwrap();
      setIsModalOpen(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Error updating lesson:", error);
    }
  };

  const handleEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await deleteLesson(id).unwrap();
      } catch (error) {
        console.error("Error deleting lesson:", error);
        alert("Failed to delete lesson");
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
      <div className="p-4">
        <div className="text-center text-red-500 py-4">
          Error loading lessons. Please try again.
        </div>
      </div>
    );
  }

  const lessons = data?.data || [];

  return (
    <div className="p-4">
      <Header name="Lessons" />
      
      {/* Search and Create */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => {
            setEditingLesson(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Create Lesson
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Name</TableHead>
              <TableHead className="whitespace-nowrap">Day</TableHead>
              <TableHead className="whitespace-nowrap">Start Time</TableHead>
              <TableHead className="whitespace-nowrap">End Time</TableHead>
              <TableHead className="whitespace-nowrap">Subject</TableHead>
              <TableHead className="whitespace-nowrap">Class</TableHead>
              <TableHead className="whitespace-nowrap">Teacher</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No lessons found
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson: any) => (
                <TableRow key={lesson.id}>
                  <TableCell className="whitespace-nowrap">{lesson.name}</TableCell>
                  <TableCell className="whitespace-nowrap">{lesson.day}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(lesson.startTime), "HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(lesson.endTime), "HH:mm")}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{lesson.subject?.name || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">{lesson.class?.name || "N/A"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {lesson.teacher ? `${lesson.teacher.name} ${lesson.teacher.surname}` : "N/A"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
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

      {/* MODAL */}
      <CreateLessonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLesson(null);
        }}
        onCreate={handleCreateLesson}
        onUpdate={handleUpdateLesson}
        initialData={editingLesson}
        schoolId={schoolId}
      />
    </div>
  );
};

export default Lessons;

