
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Calendar, Briefcase, Loader2 } from "lucide-react";
import { formatCurrencySync } from "@/utils/salaryCalculations";

interface SalaryStats {
  totalBudgetSalary: number;
  totalCalculatedSalary: number;
  averageDailyRate: number;
  employeeCount: number;
}

interface SalaryStatsProps {
  stats: SalaryStats;
  loading: boolean;
}

export default function SalaryStats({ stats, loading }: SalaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/60">
            Monthly Salary Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-green-400" />
          ) : (
            <>
              <div className="flex items-center">
                <CircleDollarSign className="h-5 w-5 mr-2 text-green-400" />
                <span className="text-2xl font-bold">
                  {formatCurrencySync(stats.totalBudgetSalary)}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                For {stats.employeeCount} active employees
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/60">
            Calculated Salary (Attendance-Based)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          ) : (
            <>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-2xl font-bold">
                  {formatCurrencySync(stats.totalCalculatedSalary)}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Based on actual attendance
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white/60">
            Average Daily Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
          ) : (
            <>
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-purple-400" />
                <span className="text-2xl font-bold">
                  {formatCurrencySync(stats.averageDailyRate)}
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Per employee per working day
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
