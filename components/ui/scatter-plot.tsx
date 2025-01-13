import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  x: number
  y: number
  size?: number
  category?: string
}

interface ScatterPlotProps {
  data: DataPoint[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  xLabel?: string
  yLabel?: string
  colors?: string[]
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  xLabel = '',
  yLabel = '',
  colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.x) || 0, d3.max(data, d => d.x) || 0])
      .range([0, innerWidth])
      .nice()

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.y) || 0, d3.max(data, d => d.y) || 0])
      .range([innerHeight, 0])
      .nice()

    const sizeScale = data[0].size !== undefined
      ? d3.scaleLinear()
        .domain([d3.min(data, d => d.size || 0) || 0, d3.max(data, d => d.size || 0) || 0])
        .range([4, 20])
      : undefined

    const colorScale = data[0].category !== undefined
      ? d3.scaleOrdinal()
        .domain(Array.from(new Set(data.map(d => d.category || ''))))
        .range(colors)
      : undefined

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add points
    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => sizeScale ? sizeScale(d.size || 0) : 5)
      .attr('fill', d => colorScale ? colorScale(d.category || '') : colors[0])
      .attr('opacity', 0.7)
      .on('mouseover', function(event: MouseEvent, d: DataPoint) {
        const tooltip = d3.select(this.parentNode as SVGElement)
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(d.x))
          .attr('y', yScale(d.y))
          .attr('dy', '-1em')
          .text(`x: ${d.x}, y: ${d.y}${d.size ? `, size: ${d.size}` : ''}${d.category ? `, category: ${d.category}` : ''}`)
      })
      .on('mouseout', function() {
        d3.select(this.parentNode as SVGElement)
          .selectAll('.tooltip')
          .remove()
      })

    // Add axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text(xLabel)

    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40)
      .attr('x', -innerHeight / 2)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'middle')
      .text(yLabel)

    // Add legend if categories exist
    if (colorScale) {
      const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 10},${margin.top})`)

      const categories = Array.from(new Set(data.map(d => d.category || '')))

      legend.selectAll('circle')
        .data(categories)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 25)
        .attr('r', 5)
        .attr('fill', d => colorScale(d))

      legend.selectAll('text')
        .data(categories)
        .enter()
        .append('text')
        .attr('x', 15)
        .attr('y', (d, i) => i * 25)
        .attr('dy', '0.3em')
        .text(d => d)
    }
  }, [data, width, height, margin, xLabel, yLabel, colors])

  return (
    <svg ref={svgRef} width={width} height={height} />
  )
}
