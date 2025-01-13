interface OvertimeResult {
  overtimeHours: number;
  overtimePay: number;
  doubleTimeHours: number;
  doubleTimePay: number;
}

const STANDARD_HOURS = 38;
const OVERTIME_RATE = 1.5;
const DOUBLE_TIME_RATE = 2.0;
const DOUBLE_TIME_THRESHOLD = 48;

export function calculateOvertime(
  baseRate: number,
  totalHours: number
): OvertimeResult {
  const overtimeHours = Math.max(0, totalHours - STANDARD_HOURS);
  const doubleTimeHours = Math.max(0, totalHours - DOUBLE_TIME_THRESHOLD);
  const standardOvertimeHours = overtimeHours - doubleTimeHours;
  
  const overtimePay = standardOvertimeHours * baseRate * OVERTIME_RATE;
  const doubleTimePay = doubleTimeHours * baseRate * DOUBLE_TIME_RATE;

  return {
    overtimeHours: standardOvertimeHours,
    overtimePay,
    doubleTimeHours,
    doubleTimePay,
  };
}
