
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

// Mock attendance data
const mockEmployees = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Robert Johnson" },
  { id: "4", name: "Emily Brown" },
  { id: "5", name: "Michael Wilson" },
];

const today = new Date();
const getDayString = (date: Date) => date.toISOString().split('T')[0];

// Generate mock attendance for each employee for today
const mockAttendanceData = mockEmployees.map(employee => ({
  employeeId: employee.id,
  employeeName: employee.name,
  date: getDayString(today),
  status: ["present", "short_leave", "leave"][Math.floor(Math.random() * 3)]
}));

export default function AttendanceTable() {
  const [date, setDate] = useState<Date>(today);
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData);
  
  const handleStatusChange = (employeeId: string, status: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.employeeId === employeeId 
          ? { ...item, status } 
          : item
      )
    );
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'present':
        return <Badge className="bg-green-500/20 text-green-400">Present</Badge>;
      case 'short_leave':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Short Leave</Badge>;
      case 'leave':
        return <Badge className="bg-red-500/20 text-red-400">Leave</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400">Not Set</Badge>;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <Card className="glass-card lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => date && setDate(date)}
            className="rounded-md border border-white/10 bg-adicorp-dark/30 p-3"
          />
        </CardContent>
      </Card>
      
      <Card className="glass-card lg:col-span-3">
        <CardHeader>
          <CardTitle>Daily Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceData.map((record) => (
                <TableRow 
                  key={record.employeeId}
                  className="border-white/10 hover:bg-adicorp-dark/30"
                >
                  <TableCell>{record.employeeName}</TableCell>
                  <TableCell>
                    <Select 
                      value={record.status} 
                      onValueChange={(value) => handleStatusChange(record.employeeId, value)}
                    >
                      <SelectTrigger className="w-[140px] bg-adicorp-dark/60 border-white/10">
                        <SelectValue>
                          {getStatusBadge(record.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-adicorp-dark-light border-white/10">
                        <SelectItem value="present">Present (Full Day)</SelectItem>
                        <SelectItem value="short_leave">Short Leave (Half Day)</SelectItem>
                        <SelectItem value="leave">Leave (Absent)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
