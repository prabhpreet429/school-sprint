"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { format } from "date-fns";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  schoolId: number;
  teacherId?: number;
  studentId?: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: number;
    name: string;
    surname: string;
  };
  student?: {
    id: number;
    name: string;
    surname: string;
  };
  parent?: {
    id: number;
    name: string;
    surname: string;
  };
}

export default function UsersPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const schoolId = user?.schoolId || parseInt(searchParams?.get("schoolId") || "1");

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!schoolId) return;

      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/users?schoolId=${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin") {
      fetchUsers();
    }
  }, [schoolId, user]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Only admins can view users.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      u.email.toLowerCase().includes(search) ||
      u.username.toLowerCase().includes(search) ||
      u.role.toLowerCase().includes(search) ||
      (u.teacher && `${u.teacher.name} ${u.teacher.surname}`.toLowerCase().includes(search)) ||
      (u.student && `${u.student.name} ${u.student.surname}`.toLowerCase().includes(search)) ||
      (u.parent && `${u.parent.name} ${u.parent.surname}`.toLowerCase().includes(search))
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "teacher":
        return "bg-blue-500 hover:bg-blue-600";
      case "student":
        return "bg-green-500 hover:bg-green-600";
      case "parent":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getPersonName = (user: User) => {
    if (user.teacher) {
      return `${user.teacher.name} ${user.teacher.surname}`;
    }
    if (user.student) {
      return `${user.student.name} ${user.student.surname}`;
    }
    if (user.parent) {
      return `${user.parent.name} ${user.parent.surname}`;
    }
    return "-";
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all user accounts with their roles
            </p>
          </div>
          <Link href={`/accounts/create?schoolId=${schoolId}`}>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Linked Person</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge className={`text-white ${getRoleBadgeColor(user.role)}`}>
                            {user.role.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getPersonName(user) !== "-" ? (
                            <span className="text-sm">{getPersonName(user)}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}

