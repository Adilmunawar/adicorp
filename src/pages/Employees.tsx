
import { useState } from "react";
import Dashboard from "@/components/layout/Dashboard";
import EmployeeList from "@/components/employees/EmployeeList";
import EmployeeForm from "@/components/employees/EmployeeForm";

const EmployeesPage = () => {
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editEmployeeId, setEditEmployeeId] = useState<string | undefined>(undefined);
  
  const handleAddEmployee = () => {
    setEditEmployeeId(undefined);
    setShowEmployeeForm(true);
  };
  
  const handleEditEmployee = (id: string) => {
    setEditEmployeeId(id);
    setShowEmployeeForm(true);
  };
  
  const handleCloseForm = () => {
    setShowEmployeeForm(false);
  };
  
  return (
    <Dashboard title="Employees Management">
      <EmployeeList 
        onAddEmployee={handleAddEmployee}
        onEditEmployee={handleEditEmployee}
      />
      
      <EmployeeForm 
        isOpen={showEmployeeForm}
        onClose={handleCloseForm}
        employeeId={editEmployeeId}
      />
    </Dashboard>
  );
};

export default EmployeesPage;
