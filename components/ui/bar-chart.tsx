import * as d3 from 'd3';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: { name: string; value: number }[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const BarChart: FC<BarChartProps> = ({
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
      .scaleBand()
      .domain(data.map((d: unknown) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data: unknown, (d: unknown) => d.value) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const xAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(0: unknown,${height - margin.bottom})`).call(d3.axisBottom(x: unknown));

    const yAxis = (g: d3.Selection<SVGGElement, unknown, null, undefined>) =>
      g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y: unknown));

    svg.append('g').call(xAxis: unknown);
    svg.append('g').call(yAxis: unknown);

    svg
      .append('g')
      .selectAll('rect')
      .data(data: unknown)
      .join('rect')
      .attr('x', (d: unknown) => x(d.name) || 0)
      .attr('y', (d: unknown) => y(d.value))
      .attr('height', (d: unknown) => y(0: unknown) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', 'steelblue');
  }, [data, width, height, margin]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
    />
  );
};

export default BarChart;
