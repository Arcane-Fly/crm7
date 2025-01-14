import { FC, useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface BarChartProps {
  data: { name: string; value: number }[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
}

export const BarChart: FC<BarChartProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 }
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([height - margin.bottom, margin.top])

    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))

    svg.append('g').call(xAxis)
    svg.append('g').call(yAxis)

    svg.append('g')
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', d => x(d.name) || 0)
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', 'steelblue')

  }, [data, width, height, margin])

  return <svg ref={svgRef} width={width} height={height} />
}

export default BarChart
