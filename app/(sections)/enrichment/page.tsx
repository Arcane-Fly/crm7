'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DataTable } from '@/components/ui/data-table'
import { enrichmentLogColumns } from './columns'
import { useAdminAccess } from '@/lib/hooks/useAdminAccess'
import { Loader2 } from 'lucide-react'

export default function EnrichmentDashboard() {
  const { isAdmin } = useAdminAccess()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch enrichment logs
      const { data: logsData } = await supabase
        .from('enrichment_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      // Fetch statistics
      const { data: statsData } = await supabase
        .from('enrichment_statistics')
        .select('*')

      setLogs(logsData || [])
      setStats(statsData || {})
    } catch (error) {
      console.error('Error fetching enrichment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) return null
  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
          <BreadcrumbItem>Enrichment Dashboard</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Enrichments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_enrichments || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.success_rate ? `${Math.round(stats.success_rate * 100)}%` : '0%'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="p-4">
            <CardTitle>Enrichment Activity</CardTitle>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.activity_data || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Enrichment Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={enrichmentLogColumns}
                data={logs}
                searchPlaceholder="Search logs..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Enrichments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Calendar
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Scheduled Tasks</h3>
                  <Button>Schedule New Task</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
