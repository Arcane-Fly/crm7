import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService } from '@/lib/services/rates'
import { BarChart } from '@/components/ui/bar-chart'
import { LineChart } from '@/components/ui/line-chart'
import { DataTable } from '@/components/ui/data-table'
import { Label } from "@/components/ui/label"
import { PieChart } from "@/components/ui/pie-chart"
import { formatCurrency, formatDate } from '@/lib/utils'

export function RateDashboard() {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [analysisType, setAnalysisType] = useState('cost_distribution')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [forecastData, setForecastData] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    if (user?.org_id) {
      loadDashboardData()
    }
  }, [user?.org_id, startDate, endDate, analysisType])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load analytics
      const { data: analytics } = await ratesService.supabase
        .rpc('generate_rate_analytics', {
          org_id: user!.org_id,
          analysis_type: analysisType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })

      setAnalyticsData(analytics)

      // Load forecasts
      const { data: forecasts } = await ratesService.supabase
        .from('rate_forecasts')
        .select(`
          *,
          results:rate_forecast_results(*)
        `)
        .eq('org_id', user!.org_id)
        .gte('end_date', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      setForecastData(forecasts)

      // Load reports
      const { data: reports } = await ratesService.supabase
        .from('rate_reports')
        .select('*')
        .eq('org_id', user!.org_id)
        .order('created_at', { ascending: false })
        .limit(5)

      setReportData(reports)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const renderCostDistribution = () => {
    if (!analyticsData?.metrics?.cost_breakdown) return null

    const data = Object.entries(analyticsData.metrics.cost_breakdown).map(([key, value]) => ({
      name: key,
      value: Number(value)
    }))

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Cost Distribution</h3>
        <div className="h-[300px]">
          <BarChart
            data={data}
            xField="name"
            yField="value"
            formatter={(value) => formatCurrency(value)}
          />
        </div>
      </div>
    )
  }

  const renderMarginAnalysis = () => {
    if (!analyticsData?.metrics?.margin_distribution) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Margin Distribution</h3>
        <div className="h-[300px]">
          <PieChart
            data={Object.entries(analyticsData.metrics.margin_distribution).map(([range, count]) => ({
              name: range,
              value: Number(count)
            }))}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Average Margin: {formatCurrency(analyticsData.metrics.average_margin)}
        </div>
      </div>
    )
  }

  const renderForecasts = () => {
    if (!forecastData?.length) return null

    const data = forecastData.flatMap(forecast => 
      forecast.results.map(result => ({
        date: new Date(result.forecast_date),
        rate: result.final_rate,
        name: forecast.forecast_name
      }))
    )

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Rate Forecasts</h3>
        <div className="h-[300px]">
          <LineChart
            data={data}
            xField="date"
            yField="rate"
            groupField="name"
            formatter={(value) => formatCurrency(value)}
          />
        </div>
      </div>
    )
  }

  const renderReports = () => {
    if (!reportData?.length) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Recent Reports</h3>
        <DataTable
          columns={[
            {
              header: 'Report Name',
              accessorKey: 'report_name'
            },
            {
              header: 'Type',
              accessorKey: 'report_type'
            },
            {
              header: 'Last Run',
              accessorKey: 'last_run_at',
              cell: ({ row }) => formatDate(row.original.last_run_at)
            },
            {
              header: 'Next Run',
              accessorKey: 'next_run_at',
              cell: ({ row }) => formatDate(row.original.next_run_at)
            },
            {
              header: 'Actions',
              cell: ({ row }) => (
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Handle report action
                  }}
                >
                  View
                </Button>
              )
            }
          ]}
          data={reportData}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label>Analysis Type</Label>
              <Select
                value={analysisType}
                onValueChange={setAnalysisType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cost_distribution">Cost Distribution</SelectItem>
                  <SelectItem value="margin_analysis">Margin Analysis</SelectItem>
                  <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                  <SelectItem value="variance_analysis">Variance Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center space-x-2">
                <DatePicker
                  date={startDate}
                  onSelect={setStartDate}
                />
                <span>to</span>
                <DatePicker
                  date={endDate}
                  onSelect={setEndDate}
                />
              </div>
            </div>

            <Button
              onClick={loadDashboardData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>

          <Tabs defaultValue="analytics">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {analysisType === 'cost_distribution' && renderCostDistribution()}
              {analysisType === 'margin_analysis' && renderMarginAnalysis()}
            </TabsContent>

            <TabsContent value="forecasts">
              {renderForecasts()}
            </TabsContent>

            <TabsContent value="reports">
              {renderReports()}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
