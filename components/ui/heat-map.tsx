import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  x: string | number
  y: string | number
  value: number
}

interface HeatMapProps {
  data: DataPoint[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  colors = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const xValues = Array.from(new Set(data.map(d => d.x)))
    const yValues = Array.from(new Set(data.map(d => d.y)))

    const xScale = d3.scaleBand()
      .domain(xValues.map(String))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleBand()
      .domain(yValues.map(String))
      .range([innerHeight, 0])
      .padding(0.1)

    const colorScale = d3.scaleQuantile<string>()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range(colors)

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create cells
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(String(d.x)) || 0)
      .attr('y', d => yScale(String(d.y)) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .on('mouseover', function(event: MouseEvent, d: DataPoint) {
        const tooltip = d3.select(this.parentNode as SVGElement)
          .append('text')
          .attr('class', 'tooltip')
          .attr('x', xScale(String(d.x)) || 0)
          .attr('y', yScale(String(d.y)) || 0)
          .attr('dy', '-0.5em')
          .text(`${d.x}, ${d.y}: ${d.value.toFixed(2)}`)
      })
      .on('mouseout', function() {
        d3.select(this.parentNode as SVGElement)
          .selectAll('.tooltip')
          .remove()
      })

    // Add x-axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    // Add y-axis
    g.append('g')
      .call(d3.axisLeft(yScale))

    // Add legend
    const legendWidth = 20
    const legendHeight = 200
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20},${margin.top})`)

    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([legendHeight, 0])

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)

    legend.selectAll('rect')
      .data(d3.range(legendHeight))
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i)
      .attr('width', legendWidth)
      .attr('height', 1)
      .attr('fill', d => colorScale(legendScale.invert(d)))

    legend.append('g')
      .attr('transform', `translate(${legendWidth},0)`)
      .call(legendAxis)
  }, [data, width, height, margin, colors])

  return (
    <svg ref={svgRef} width={width} height={height} />
  )
}
