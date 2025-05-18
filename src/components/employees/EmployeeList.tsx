
import { useState } from "react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash, 
  UserPlus,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock employee data (will be replaced with Supabase data)
const mockEmployees = [
  {
    id: "1",
    name: "John Doe",
    rank: "Supervisor",
    wageRate: 150,
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    rank: "Data Entry Operator",
    wageRate: 100,
    status: "active",
  },
  {
    id: "3",
    name: "Robert Johnson",
    rank: "Customer Service",
    wageRate: 120,
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Brown",
    rank: "Accountant",
    wageRate: 180,
    status: "active",
  },
  {
    id: "5",
    name: "Michael Wilson",
    rank: "Marketing Specialist",
    wageRate: 160,
    status: "active",
  },
];

interface EmployeeListProps {
  onAddEmployee: () => void;
  onEditEmployee: (id: string) => void;
}

export default function EmployeeList({ onAddEmployee, onEditEmployee }: EmployeeListProps) {
  const [employees] = useState(mockEmployees);

  return (
    <Card className="glass-card w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Employees</CardTitle>
        <Button 
          onClick={onAddEmployee}
          className="bg-adicorp-purple hover:bg-adicorp-purple-dark btn-glow"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Daily Wage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow 
                key={employee.id} 
                className="border-white/10 hover:bg-adicorp-dark/30"
              >
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.rank}</TableCell>
                <TableCell>${employee.wageRate.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={employee.status === "active" ? "default" : "secondary"}
                    className={
                      employee.status === "active" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }
                  >
                    {employee.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditEmployee(employee.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-adicorp-dark-light border-white/10">
                        <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer">
                          <Trash size={16} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
