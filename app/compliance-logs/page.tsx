'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Download } from 'lucide-react'

export default function ComplianceLogsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Fair Work Compliance Logs</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">Recent Compliance Checks</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-md bg-gray-50 p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Timesheet Validation</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Compliant
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Employee: John Smith
                  <br />
                  Timesheet: #TS-2024-001
                  <br />
                  Pay Rate: Manufacturing Level C12
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  All rates and allowances comply with Manufacturing Award MA000010
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Checked on: January 13, 2024 09:15 AM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-md bg-gray-50 p-4">
              <AlertTriangle className="mt-1 h-5 w-5 text-yellow-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Penalty Rate Adjustment</h3>
                  <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    Adjusted
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Employee: Sarah Johnson
                  <br />
                  Timesheet: #TS-2024-002
                  <br />
                  Pay Rate: Clerical Level 2
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Sunday penalty rate adjusted from 1.5x to 2.0x as per latest award update
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Checked on: January 12, 2024 04:30 PM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-md bg-gray-50 p-4">
              <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Public Holiday Check</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Compliant
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Employee: Michael Brown
                  <br />
                  Timesheet: #TS-2024-003
                  <br />
                  Pay Rate: Manufacturing Level C14
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Public holiday rates correctly applied for New Year's Day
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Checked on: January 11, 2024 10:45 AM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
