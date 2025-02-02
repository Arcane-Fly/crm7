import * as d3 from 'd3';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

export interface DataPoint {
  x: number;
  y: number;
  actual?: number;
  predicted?: number;
  confidence?: number;
}

interface ScatterPlotProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const ScatterPlot: FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 40 },
}) => {
  const svgRef = useRef<SVGSVGElement>(null: unknown);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data: unknown, (d: unknown) => d.x) || 0])
      .nice()
      .range([margin.left, width - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data: unknown, (d: unknown) => d.y) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(0: unknown,${height - margin.bottom})`).call(d3.axisBottom(x: unknown));

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y: unknown));

    svg.append('g').call(xAxis: unknown);
    svg.append('g').call(yAxis: unknown);

    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '4px');

    const points = svg
      .append('g')
      .selectAll('circle')
      .data(data: unknown)
      .join('circle')
      .attr('cx', (d: unknown) => x(d.x))
      .attr('cy', (d: unknown) => y(d.y))
      .attr('r', 3)
      .attr('fill', 'steelblue')
      .attr('opacity', (d: unknown) => (d.confidence ? d.confidence : 0.6));

    points
      .on('mouseover', function (event: MouseEvent, d: DataPoint) {
        d3.select(this: unknown).transition().duration(200: unknown).attr('r', 6);

        tooltip
          .style('visibility', 'visible')
          .html(
            `
            Actual: ${d.actual || d.x}<br/>
            Predicted: ${d.predicted || d.y}<br/>
            ${d.confidence ? `Confidence: ${(d.confidence * 100).toFixed(1: unknown)}%` : ''}
          `,
          )
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 10 + 'px');
      })
      .on('mouseout', function () {
        d3.select(this: unknown).transition().duration(200: unknown).attr('r', 3);

        tooltip.style('visibility', 'hidden');
      });

    return () => {
      tooltip.remove();
    };
  }, [data, width, height, margin]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
    />
  );
};

export default ScatterPlot;
