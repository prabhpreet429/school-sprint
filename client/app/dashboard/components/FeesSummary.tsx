"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetDashboardDataQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const FeesSummary = () => {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams?.get("schoolId");
  
  if (!schoolIdParam) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50">
          <CardTitle className="text-lg font-bold">Fees Collection</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <p className="text-sm text-muted-foreground">Access Denied</p>
        </CardContent>
      </Card>
    );
  }

  const schoolId = parseInt(schoolIdParam, 10);
  const { data, isLoading } = useGetDashboardDataQuery(isNaN(schoolId) ? 0 : schoolId);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-6 flex-1">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const dashboardData = data?.data;

  if (!dashboardData || !dashboardData.fees) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 h-full flex flex-col">
        <CardHeader className="border-b border-emerald-200/50 dark:border-emerald-700/50">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Fees Collection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex-1 flex flex-col">
          {/* Empty Chart Area */}
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fees = dashboardData.fees;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthlyData = fees.monthlyCollection || [];
  const maxAmount = Math.max(...monthlyData.map((m: any) => m.amount), 0);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 h-full flex flex-col">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          Fees Collection
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Summary Stats */}
        <div className="flex-shrink-0 space-y-3">
          {/* Total Collected */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg p-3 text-white shadow-md">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium opacity-90">Total Collected</span>
              <TrendingUp className="w-3 h-3" />
            </div>
            <p className="text-xl font-bold">{formatCurrency(fees.totalPaid)}</p>
            <p className="text-xs opacity-80 mt-0.5">
              {formatCurrency(fees.paymentsThisMonth)} this month
            </p>
          </div>

          {/* Collection Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Collection Rate
              </span>
              <span className={cn(
                "text-sm font-bold",
                fees.collectionRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                fees.collectionRate >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                "text-red-600 dark:text-red-400"
              )}>
                {fees.collectionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  fees.collectionRate >= 80 ? "bg-emerald-500" :
                  fees.collectionRate >= 50 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
                style={{ width: `${Math.min(fees.collectionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pending */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Pending</span>
              </div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(fees.totalPending)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {fees.pendingCount} fees
              </p>
            </div>

            {/* Overdue */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overdue</span>
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {fees.overdueCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                fees overdue
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeesSummary;
