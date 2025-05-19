
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartPie, CalendarDays, Users, FileBarChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// Sample data (in a real app, this would come from your database)
const attendanceData = [
  { month: 'Jan', present: 85, absent: 15 },
  { month: 'Feb', present: 88, absent: 12 },
  { month: 'Mar', present: 90, absent: 10 },
  { month: 'Apr', present: 87, absent: 13 },
  { month: 'May', present: 89, absent: 11 },
  { month: 'Jun', present: 92, absent: 8 },
];

const employeeData = [
  { name: 'Active', value: 12, color: '#6d28d9' },
  { name: 'On Leave', value: 2, color: '#2563eb' },
  { name: 'Inactive', value: 1, color: '#dc2626' },
];

const expensesData = [
  { month: 'Jan', amount: 125000 },
  { month: 'Feb', amount: 130000 },
  { month: 'Mar', amount: 132000 },
  { month: 'Apr', amount: 129000 },
  { month: 'May', amount: 135000 },
  { month: 'Jun', amount: 142000 },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  return (
    <Dashboard title="Analytics & Reports">
      <Tabs defaultValue="attendance" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="glass-card bg-adicorp-dark-light/60 grid grid-cols-3 mb-4">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <CalendarDays className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="employees" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Employees
          </TabsTrigger>
          <TabsTrigger value="expenses" className="data-[state=active]:bg-adicorp-purple data-[state=active]:text-white">
            <FileBarChart className="h-4 w-4 mr-2" />
            Expenses
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-adicorp-purple" />
                Attendance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e2d', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="present" fill="#6d28d9" name="Present %" />
                    <Bar dataKey="absent" fill="#dc2626" name="Absent %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-adicorp-purple" />
                Employee Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {employeeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e2d', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                      formatter={(value) => [`${value} employees`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileBarChart className="h-5 w-5 mr-2 text-adicorp-purple" />
                Monthly Salary Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expensesData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" 
                      tickFormatter={(value) => `PKR ${value.toLocaleString()}`} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e2d', 
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff'
                      }}
                      formatter={(value) => [`PKR ${value.toLocaleString()}`, 'Expenses']}
                    />
                    <Bar dataKey="amount" fill="#2563eb" name="Salary Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Dashboard>
  );
}
