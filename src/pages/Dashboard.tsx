
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, BarChart, ChartPie } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock statistics
const stats = [
  { id: 1, title: "Total Employees", value: 24, icon: Users, change: 2, color: "bg-adicorp-purple" },
  { id: 2, title: "Present Today", value: 22, icon: Clock, change: -1, color: "bg-green-500" },
  { id: 3, title: "Total Salary", value: "$4,320", icon: BarChart, change: 5, color: "bg-blue-500" },
  { id: 4, title: "Productivity", value: "92%", icon: ChartPie, change: 3, color: "bg-yellow-500" },
];

const DashboardPage = () => {
  return (
    <Dashboard title="Dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <Card key={stat.id} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/70">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <p className={`text-xs mt-2 ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}% from last month
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} className="text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Monthly Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Full Attendance</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2 bg-adicorp-dark" indicatorClassName="bg-adicorp-purple" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Short Leaves</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <Progress value={10} className="h-2 bg-adicorp-dark" indicatorClassName="bg-yellow-500" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Full Leaves</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
                <Progress value={5} className="h-2 bg-adicorp-dark" indicatorClassName="bg-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-start pb-4 border-b border-white/10 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-adicorp-purple mr-3" />
                  <div>
                    <p className="text-sm font-medium">
                      {["New employee added", "Attendance updated", "Salary processed"][i]}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {["2 hours ago", "5 hours ago", "Yesterday"][i]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
};

export default DashboardPage;
