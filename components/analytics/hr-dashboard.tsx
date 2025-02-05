import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type Employee, type Attendance, type AttendanceStats } from '@/lib/types';

const supabase = createClient();

export function HRDashboard(): React.ReactElement {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, _setStats] = useState<AttendanceStats>({
    attendanceRate: 0,
  });

  useEffect((): void => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('*');

        if (typeof employeeError !== "undefined" && employeeError !== null) {
          console.error('Error fetching employees:', employeeError);
          return;
        }

        setEmployees(employeeData || []);

        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .select('*');

        if (typeof attendanceError !== "undefined" && attendanceError !== null) {
          console.error('Error fetching attendance:', attendanceError);
          return;
        }

        setAttendance(attendanceData || []);
        calculateStats(attendanceData);
      } catch (error) {
        console.error('Failed to fetch HR data:', error);
      }
    };

    void fetchData();
  }, []);

  const sortEmployeesByAttendance = (a: Employee, b: Employee): number => {
    const aAttendance = attendance.filter(record => record.employeeId === a.id);
    const bAttendance = attendance.filter(record => record.employeeId === b.id);
    return bAttendance.length - aAttendance.length;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium">Attendance Rate</h3>
          <p className="text-2xl">{stats.attendanceRate.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-medium mb-4">Employee Attendance</h3>
        <div className="space-y-4">
          {employees.sort(sortEmployeesByAttendance).map((employee) => {
            const employeeAttendance = attendance.filter(a => a.employeeId === employee.id);
            const presentDays = employeeAttendance.filter(a => a.status === 'present').length;
            const absentDays = employeeAttendance.filter(a => a.status === 'absent').length;
            const attendanceRate = employeeAttendance.length > 0
              ? (presentDays / employeeAttendance.length) * 100
              : 0;

            return (
              <div
                key={employee.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-500">
                    Present: {presentDays} | Absent: {absentDays}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {attendanceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
