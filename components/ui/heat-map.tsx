import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface HeatMapProps {
  data: Array<{
    x: string | number
    y: string | number
    value: number
  }>
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colorScale?: string[]
  xField: string
  yField: string
  colorField: string
}

export function HeatMap({
  data,
  width = 600,
  height = 400,
  margin = { top: 40, right: 40, bottom: 60, left: 60 },
  colorScale = ['#f7fbff', '#08519c'],
  xField,
  yField,
  colorField
}: HeatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Create scales
    const xValues = Array.from(new Set(data.map(d => d[xField])))
    const yValues = Array.from(new Set(data.map(d => d[yField])))

    const xScale = d3.scaleBand()
      .domain(xValues)
      .range([margin.left, width - margin.right])
      .padding(0.1)

    const yScale = d3.scaleBand()
      .domain(yValues)
      .range([height - margin.bottom, margin.top])
      .padding(0.1)

    const colorScaleFunc = d3.scaleLinear<string>()
      .domain([
        d3.min(data, d => d[colorField]) || 0,
        d3.max(data, d => d[colorField]) || 1
      ])
      .range(colorScale as [string, string])

    const svg = d3.select(svgRef.current)

    // Add cells
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d[xField]) || 0)
      .attr('y', d => yScale(d[yField]) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScaleFunc(d[colorField]))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)

        tooltip
          .style('opacity', 1)
          .html(`
            ${xField}: ${d[xField]}<br/>
            ${yField}: ${d[yField]}<br/>
            ${colorField}: ${d[colorField].toFixed(2)}
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
    const yAxis = d3.axisLeft(yScale)

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)

    // Add color legend
    const legendWidth = 20
    const legendHeight = height - margin.top - margin.bottom
    const legendScale = d3.scaleLinear()
      .domain([
        d3.min(data, d => d[colorField]) || 0,
        d3.max(data, d => d[colorField]) || 1
      ])
      .range([legendHeight, 0])

    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 20},${margin.top})`)

    const legendGradient = legend.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0)
      .attr('y1', legendHeight)
      .attr('x2', 0)
      .attr('y2', 0)

    legendGradient.selectAll('stop')
      .data(colorScale)
      .enter()
      .append('stop')
      .attr('offset', (d, i) => i / (colorScale.length - 1))
      .attr('stop-color', d => d)

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)')

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d => d.toFixed(2))

    legend.append('g')
      .attr('transform', `translate(${legendWidth},0)`)
      .call(legendAxis)

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
  }, [data, width, height, margin, colorScale, xField, yField, colorField])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="overflow-visible"
    />
  )
}
