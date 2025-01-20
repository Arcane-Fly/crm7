import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

export interface DataPoint {
  x: number
  y: number
  actual?: number
  predicted?: number
  confidence?: number
}

interface ScatterPlotProps {
  data: DataPoint[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
}

export const ScatterPlot: FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x) || 0])
      .nice()
      .range([margin.left, width - margin.right])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) || 0])
      .nice()
      .range([height - margin.bottom, margin.top])

    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x))

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y))

    svg.append('g').call(xAxis)
    svg.append('g').call(yAxis)

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '4px')

    const points = svg
      .append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .attr('opacity', (d) => (d.confidence ? d.confidence : 0.6))

    points
      .on('mouseover', function (event: MouseEvent, d: DataPoint) {
        d3.select(this).transition().duration(200).attr('r', 6)

        tooltip
          .style('visibility', 'visible')
          .html(
            `
            Actual: ${d.actual || d.x}<br/>
            Predicted: ${d.predicted || d.y}<br/>
            ${d.confidence ? `Confidence: ${(d.confidence * 100).toFixed(1)}%` : ''}
          `
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px')
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('r', 3)

        tooltip.style('visibility', 'hidden')
      })

    return () => {
      tooltip.remove()
    }
  }, [data, width, height, margin])

  return <svg ref={svgRef} width={width} height={height} />
}

export default ScatterPlot
