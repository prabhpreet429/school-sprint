"use client";

import { useSearchParams } from "next/navigation";
import Dashboard from "@/app/dashboard/page";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  
  // Require schoolId - no fallback
  if (!schoolIdParam) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 text-center text-lg font-semibold">
              Access Denied
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  
  if (isNaN(schoolId)) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 text-center text-lg font-semibold">
              Access Denied
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Dashboard />;
}
