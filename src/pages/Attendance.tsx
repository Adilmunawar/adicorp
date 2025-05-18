
import Dashboard from "@/components/layout/Dashboard";
import AttendanceTable from "@/components/attendance/AttendanceTable";

const AttendancePage = () => {
  return (
    <Dashboard title="Daily Attendance">
      <AttendanceTable />
    </Dashboard>
  );
};

export default AttendancePage;
