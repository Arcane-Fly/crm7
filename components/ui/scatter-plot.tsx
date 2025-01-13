import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface ScatterPlotProps {
  data: Array<{
    x: number
    y: number
    size?: number
    category?: string
  }>
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  xField: string
  yField: string
  sizeField?: string
  categoryField?: string
  xLabel?: string
  yLabel?: string
  formatter?: (value: number) => string
}

export function ScatterPlot({
  data,
  width = 600,
  height = 400,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  xField,
  yField,
  sizeField,
  categoryField,
  xLabel = xField,
  yLabel = yField,
  formatter = (value: number) => value.toString()
}: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d[xField]) || 0,
        d3.max(data, d => d[xField]) || 0
      ])
      .nice()
      .range([margin.left, width - margin.right])

    const yScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d[yField]) || 0,
        d3.max(data, d => d[yField]) || 0
      ])
      .nice()
      .range([height - margin.bottom, margin.top])

    let sizeScale
    if (sizeField) {
      sizeScale = d3.scaleLinear()
        .domain([
          d3.min(data, d => d[sizeField]) || 0,
          d3.max(data, d => d[sizeField]) || 0
        ])
        .range([4, 20])
    }

    let colorScale
    if (categoryField) {
      const categories = Array.from(new Set(data.map(d => d[categoryField])))
      colorScale = d3.scaleOrdinal()
        .domain(categories)
        .range(d3.schemeCategory10)
    }

    const svg = d3.select(svgRef.current)

    // Add points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d[xField]))
      .attr('cy', d => yScale(d[yField]))
      .attr('r', d => sizeField ? sizeScale(d[sizeField]) : 6)
      .attr('fill', d => categoryField ? colorScale(d[categoryField]) : '#1f77b4')
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)

        tooltip
          .style('opacity', 1)
          .html(`
            ${xField}: ${formatter(d[xField])}<br/>
            ${yField}: ${formatter(d[yField])}
            ${sizeField ? `<br/>${sizeField}: ${formatter(d[sizeField])}` : ''}
            ${categoryField ? `<br/>${categoryField}: ${d[categoryField]}` : ''}
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)

        tooltip.style('opacity', 0)
      })

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(formatter)
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(formatter)

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .append('text')
      .attr('x', width - margin.right)
      .attr('y', -6)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'end')
      .text(xLabel)

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      .append('text')
      .attr('x', 6)
      .attr('y', margin.top)
      .attr('fill', 'currentColor')
      .attr('text-anchor', 'start')
      .text(yLabel)

    // Add legend if categories exist
    if (categoryField) {
      const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 20},${margin.top})`)

      const categories = Array.from(new Set(data.map(d => d[categoryField])))

      legend.selectAll('circle')
        .data(categories)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 20)
        .attr('r', 6)
        .attr('fill', d => colorScale(d))

      legend.selectAll('text')
        .data(categories)
        .enter()
        .append('text')
        .attr('x', 15)
        .attr('y', (d, i) => i * 20 + 4)
        .text(d => d)
        .attr('font-size', '12px')
        .attr('alignment-baseline', 'middle')
    }

    // Add tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('padding', '8px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')

    return () => {
      tooltip.remove()
    }
  }, [data, width, height, margin, xField, yField, sizeField, categoryField, xLabel, yLabel, formatter])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    />
  )
}
