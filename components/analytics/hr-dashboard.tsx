import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import type { ReactElement } from 'react';

import type { Employee, Attendance, AttendanceStats } from '../../lib/types/hr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface HRDashboardProps {
  orgId: string;
}

export default function HRDashboard({ orgId }: HRDashboardProps): ReactElement {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase.from('employees').select('*').eq('org_id', orgId);

      if (error) {
        console.error('Error fetching employees:', error);
        return;
      }

      setEmployees(data || []);
    }

    async function fetchAttendance() {
      const { data, error } = await supabase.from('attendance').select('*').eq('org_id', orgId);

      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }

      setAttendance(data || []);
    }

    void fetchEmployees();
    void fetchAttendance();
  }, [orgId]);

  useEffect(() => {
    if (attendance.length > 0) {
      const presentCount = attendance.filter((a) => a.status === 'present').length;
      const absentCount = attendance.filter((a) => a.status === 'absent').length;

      setStats({
        totalDays: attendance.length,
        presentDays: presentCount,
        absentDays: absentCount,
        lateDays: attendance.filter((a) => a.status === 'late').length,
        attendanceRate: (presentCount / attendance.length) * 100,
      });
    }
  }, [attendance]);

  const sortEmployeesByAttendance = (a: Employee, b: Employee) => {
    const aAttendance = attendance.filter((att) => att.employeeId === a.id);
    const bAttendance = attendance.filter((att) => att.employeeId === b.id);
    return bAttendance.length - aAttendance.length;
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-medium text-gray-900'>Total Days</h3>
          <p className='text-2xl'>{stats?.totalDays || 0}</p>
        </div>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-medium text-gray-900'>Present Days</h3>
          <p className='text-2xl'>{stats?.presentDays || 0}</p>
        </div>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-medium text-gray-900'>Absent Days</h3>
          <p className='text-2xl'>{stats?.absentDays || 0}</p>
        </div>
        <div className='rounded-lg bg-white p-6 shadow'>
          <h3 className='text-lg font-medium text-gray-900'>Attendance Rate</h3>
          <p className='text-2xl'>{stats?.attendanceRate.toFixed(1) || 0}%</p>
        </div>
      </div>

      <div className='mt-8'>
        <h3 className='text-lg font-medium text-gray-900'>Employee Attendance</h3>
        <div className='mt-4 overflow-hidden rounded-lg shadow'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Employee
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Present Days
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Absent Days
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {employees.sort(sortEmployeesByAttendance).map((employee) => {
                const employeeAttendance = attendance.filter((a) => a.employeeId === employee.id);
                const presentDays = employeeAttendance.filter((a) => a.status === 'present').length;
                const absentDays = employeeAttendance.filter((a) => a.status === 'absent').length;
                const attendanceRate =
                  employeeAttendance.length > 0
                    ? (presentDays / employeeAttendance.length) * 100
                    : 0;

                return (
                  <tr key={employee.id}>
                    <td className='whitespace-nowrap px-6 py-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {employee.firstName} {employee.lastName}
                      </div>
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {presentDays}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {absentDays}
                    </td>
                    <td className='whitespace-nowrap px-6 py-4 text-sm text-gray-500'>
                      {attendanceRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
