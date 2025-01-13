"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

const barData = [
  { program: "AAIP-2023", claimed: 250000, available: 500000 },
  { program: "NSW-AWS-2023", claimed: 180000, available: 300000 },
  { program: "QLD-ATB-2023", claimed: 120000, available: 250000 },
  { program: "VIC-JSI-2023", claimed: 200000, available: 400000 },
  { program: "RRSSI-2023", claimed: 150000, available: 350000 },
]

const pieData = [
  { name: "Federal", value: 400000 },
  { name: "NSW", value: 180000 },
  { name: "QLD", value: 120000 },
  { name: "VIC", value: 200000 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function FundingOverview() {
  return (
    <Tabs defaultValue="programs" className="space-y-4">
      <TabsList>
        <TabsTrigger value="programs">By Program</TabsTrigger>
        <TabsTrigger value="sources">By Source</TabsTrigger>
      </TabsList>
      <TabsContent value="programs">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={barData}>
            <XAxis dataKey="program" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip />
            <Legend />
            <Bar dataKey="claimed" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="available" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value="sources">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  )
}
