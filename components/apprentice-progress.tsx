'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const data = [
  { name: 'Year 1', 'In Progress': 450, Completed: 200 },
  { name: 'Year 2', 'In Progress': 380, Completed: 240 },
  { name: 'Year 3', 'In Progress': 300, Completed: 280 },
  { name: 'Year 4', 'In Progress': 200, Completed: 320 },
];

const qualificationData = [
  { name: 'Certificate III in Electrical', value: 30 },
  { name: 'Certificate III in Plumbing', value: 25 },
  { name: 'Certificate III in Carpentry', value: 20 },
  { name: 'Certificate IV in Building and Construction', value: 15 },
  { name: 'Diploma of Engineering', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ApprenticeProgress(): void {
  return (
    <Tabs
      defaultValue='progress'
      className='space-y-4'
    >
      <TabsList>
        <TabsTrigger value='progress'>Progress by Year</TabsTrigger>
        <TabsTrigger value='qualifications'>Top Qualifications</TabsTrigger>
      </TabsList>
      <TabsContent value='progress'>
        <ResponsiveContainer
          width='100%'
          height={350}
        >
          <BarChart data={data}>
            <XAxis
              dataKey='name'
              stroke='#888888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke='#888888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: unknown) => `${value}`}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey='In Progress'
              stackId='a'
              fill='#adfa1d'
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey='Completed'
              stackId='a'
              fill='#2563eb'
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
      <TabsContent value='qualifications'>
        <ResponsiveContainer
          width='100%'
          height={350}
        >
          <BarChart
            data={qualificationData}
            layout='vertical'
          >
            <XAxis
              type='number'
              stroke='#888888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey='name'
              type='category'
              stroke='#888888'
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={150}
            />
            <Tooltip />
            <Bar
              dataKey='value'
              radius={[0, 4, 4, 0]}
            >
              {qualificationData.map((_: unknown, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    </Tabs>
  );
}
