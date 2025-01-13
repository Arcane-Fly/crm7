import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { HeatMap } from '@/components/ui/heat-map'
import { ScatterPlot } from '@/components/ui/scatter-plot'
import { DataTable } from '@/components/ui/data-table'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import type { MLPrediction } from '@/lib/services/rates-ml'

export function RateAnalytics() {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [mlPredictions, setMLPredictions] = useState<MLPrediction[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [optimizations, setOptimizations] = useState<any[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [startDate, endDate])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // Load standard analytics
      const { data: analytics } = await fetch('/api/rate-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          org_id: 1,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          dimensions: ['template_type', 'employee_type']
        })
      })

      setAnalyticsData(analytics)

      // Load ML predictions
      const predictions = await fetch('/api/rate-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: analytics.most_used_template,
          employee_id: analytics.most_common_employee,
          calculation_date: new Date(),
          features: analytics.current_features
        })
      })

      setMLPredictions([await predictions.json()])

      // Detect anomalies
      const { anomalies: detectedAnomalies } = await fetch('/api/anomaly-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          org_id: 1,
          start_date: startDate,
          end_date: endDate,
          threshold: 0.95
        })
      })

      setAnomalies(detectedAnomalies)

      // Get rate optimizations
      const optimization = await fetch('/api/rate-optimizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: analytics.most_used_template,
          target_margin: analytics.target_margin,
          constraints: analytics.rate_constraints
        })
      })

      setOptimizations([await optimization.json()])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const renderCostTrends = () => {
    if (!analyticsData?.cost_trends) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Cost Trends</h3>
        <div className="h-[400px]">
          {/* <LineChart
            data={analyticsData.cost_trends}
            xField="date"
            yField="cost"
            groupField="cost_type"
            formatter={(value) => formatCurrency(value)}
          /> */}
        </div>
      </div>
    )
  }

  const renderMarginAnalysis = () => {
    if (!analyticsData?.margin_analysis) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Margin Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* <div className="h-[300px]">
            <BarChart
              data={analyticsData.margin_analysis.distribution}
              xField="range"
              yField="count"
              formatter={(value) => value.toString()}
            />
          </div> */}
          <div className="h-[300px]">
            <HeatMap
              data={analyticsData.margin_analysis.correlation}
              xField="factor"
              yField="impact"
              colorField="correlation"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderPredictions = () => {
    if (!mlPredictions.length) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Rate Predictions</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-[300px]">
            <ScatterPlot
              data={mlPredictions.map(p => ({
                actual: p.metadata.actual_value,
                predicted: p.predicted_value,
                confidence: p.confidence_score
              }))}
              xField="actual"
              yField="predicted"
              sizeField="confidence"
              formatter={(value) => formatCurrency(value)}
            />
          </div>
          <DataTable
            columns={[
              {
                header: 'Factor',
                accessorKey: 'factor'
              },
              {
                header: 'Impact',
                accessorKey: 'impact',
                cell: ({ row }) => formatPercent(row.original.impact)
              }
            ]}
            data={Object.entries(mlPredictions[0].factors).map(([factor, impact]) => ({
              factor,
              impact
            }))}
          />
        </div>
      </div>
    )
  }

  const renderAnomalies = () => {
    if (!anomalies.length) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Detected Anomalies</h3>
        <DataTable
          columns={[
            {
              header: 'Date',
              accessorKey: 'calculation_date',
              cell: ({ row }) => formatDate(row.original.calculation_date)
            },
            {
              header: 'Template',
              accessorKey: 'template_name'
            },
            {
              header: 'Expected Rate',
              accessorKey: 'expected_rate',
              cell: ({ row }) => formatCurrency(row.original.expected_rate)
            },
            {
              header: 'Actual Rate',
              accessorKey: 'final_rate',
              cell: ({ row }) => formatCurrency(row.original.final_rate)
            },
            {
              header: 'Deviation',
              accessorKey: 'deviation',
              cell: ({ row }) => formatPercent(row.original.deviation)
            }
          ]}
          data={anomalies}
        />
      </div>
    )
  }

  const renderOptimizations = () => {
    if (!optimizations.length) return null

    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Rate Optimizations</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Expected Margin</span>
                  <span className="font-semibold">
                    {formatPercent(optimizations[0].expected_margin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence Score</span>
                  <span className="font-semibold">
                    {formatPercent(optimizations[0].confidence_score)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card> */}
          <DataTable
            columns={[
              {
                header: 'Component',
                accessorKey: 'component'
              },
              {
                header: 'Optimized Rate',
                accessorKey: 'rate',
                cell: ({ row }) => formatCurrency(row.original.rate)
              }
            ]}
            data={Object.entries(optimizations[0].optimized_rates).map(([component, rate]) => ({
              component,
              rate
            }))}
          />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Rate Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-end space-x-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center space-x-2">
                {/* <DatePicker
                  date={startDate}
                  onSelect={setStartDate}
                />
                <span>to</span>
                <DatePicker
                  date={endDate}
                  onSelect={setEndDate}
                /> */}
              </div>
            </div>

            <Button
              onClick={loadAnalytics}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Update'}
            </Button>
          </div>

          {/* <Tabs defaultValue="trends">
            <TabsList>
              <TabsTrigger value="trends">Cost Trends</TabsTrigger>
              <TabsTrigger value="margins">Margin Analysis</TabsTrigger>
              <TabsTrigger value="predictions">ML Predictions</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              {renderCostTrends()}
            </TabsContent>

            <TabsContent value="margins">
              {renderMarginAnalysis()}
            </TabsContent>

            <TabsContent value="predictions">
              {renderPredictions()}
            </TabsContent>

            <TabsContent value="anomalies">
              {renderAnomalies()}
            </TabsContent>

            <TabsContent value="optimizations">
              {renderOptimizations()}
            </TabsContent>
          </Tabs> */}
        </div>
      </CardContent>
    </Card>
  )
}
