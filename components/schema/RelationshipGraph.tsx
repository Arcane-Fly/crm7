import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type TableSchema } from '@/lib/types/schema-component';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  fields: string[];
  type: 'table';
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  label: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

interface RelationshipGraphProps {
  schema: TableSchema[];
  width?: number;
  height?: number;
  onTableSelect?: (tableName: string) => void;
}

export function RelationshipGraph({
  schema,
  width = 800,
  height = 600,
  onTableSelect,
}: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<'force' | 'circular' | 'hierarchical'>('force');
  const [zoom, setZoom] = useState(1);
  const [highlightedTable, setHighlightedTable] = useState<string | null>(null);
  const [showFields, setShowFields] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Create nodes from tables
    const nodes: Node[] = schema.map(table => ({
      id: table.name,
      label: table.name,
      fields: table.fields.map(f => f.name),
      type: 'table',
    }));

    // Create links from relationships
    const links: Link[] = schema.flatMap(table =>
      table.fields
        .filter(field => field.references)
        .map(field => {
          const targetTable = schema.find(t => t.name === field.references!.table);
          const type = targetTable?.fields.some(f =>
            f.references?.table === table.name
          ) ? 'many-to-many' : 'one-to-many';

          return {
            source: table.name,
            target: field.references!.table,
            label: `${field.name} → ${field.references!.field}`,
            type,
          };
        })
    );

    // Create SVG container with zoom support
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoom as any);

    // Define arrow markers for different relationship types
    const markers = [
      { id: 'one-to-many', path: 'M -10,-5 L 0,0 L -10,5' },
      { id: 'many-to-many', path: 'M -10,-5 L 0,0 L -10,5 M -14,-8 L -4,0 L -14,8' },
    ];

    g.append('defs').selectAll('marker')
      .data(markers)
      .enter()
      .append('marker')
      .attr('id', d => d.id)
      .attr('viewBox', '-10 -8 20 16')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 12)
      .attr('markerHeight', 12)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', d => d.path)
      .attr('fill', '#999');

    // Create simulation based on selected layout
    const simulation = createSimulation(layout, nodes, links, width, height);

    // Create links
    const link = g.append('g')
      .selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'link')
      .style('opacity', d =>
        !highlightedTable ||
        d.source === highlightedTable ||
        d.target === highlightedTable ? 1 : 0.2
      );

    link.append('path')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('marker-end', d => `url(#${d.type})`);

    link.append('text')
      .attr('class', 'link-label')
      .attr('text-anchor', 'middle')
      .attr('dy', -5)
      .attr('fill', '#666')
      .style('font-size', '10px')
      .text(d => d.label);

    // Create nodes
    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('opacity', d =>
        !highlightedTable ||
        d.id === highlightedTable ||
        links.some(l =>
          (l.source === highlightedTable && l.target === d.id) ||
          (l.target === highlightedTable && l.source === d.id)
        ) ? 1 : 0.2
      )
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add table rectangles with hover effect
    node.append('rect')
      .attr('width', 180)
      .attr('height', d => 30 + (showFields ? d.fields.length * 20 : 0))
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', 'white')
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        setHighlightedTable(d.id);
      })
      .on('mouseout', () => {
        setHighlightedTable(null);
      })
      .on('click', (event, d) => {
        onTableSelect?.(d.id);
      });

    // Add table names
    node.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#333')
      .style('font-weight', 'bold')
      .text(d => d.label);

    // Add field names
    if (showFields) {
      node.each(function(d) {
        d3.select(this)
          .selectAll('.field')
          .data(d.fields)
          .enter()
          .append('text')
          .attr('x', 15)
          .attr('y', (_, i) => 45 + i * 20)
          .attr('fill', '#666')
          .style('font-size', '12px')
          .text(field => field);
      });
    }

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link.select('path')
        .attr('d', d => {
          const dx = (d.target as any).x - (d.source as any).x;
          const dy = (d.target as any).y - (d.source as any).y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          const offset = 90; // Half of node width

          if (dr === 0) return 'M0,0L0,0';

          const offsetX = (dx * offset) / dr;
          const offsetY = (dy * offset) / dr;

          return `M${(d.source as any).x + offsetX},${(d.source as any).y + offsetY}L${(d.target as any).x - offsetX},${(d.target as any).y - offsetY}`;
        });

      link.select('text')
        .attr('transform', d => {
          const x1 = (d.source as any).x;
          const y1 = (d.source as any).y;
          const x2 = (d.target as any).x;
          const y2 = (d.target as any).y;
          const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          return `translate(${midX},${midY}) rotate(${angle})`;
        });

      node.attr('transform', d => `translate(${d.x! - 90},${d.y! - 20})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [schema, width, height, layout, showFields, highlightedTable, onTableSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Select value={layout} onValueChange={(value: any) => setLayout(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force-Directed</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFields(!showFields)}
          >
            {showFields ? 'Hide Fields' : 'Show Fields'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              const transform = d3.zoomTransform(svg.node()!);
              svg.transition()
                .duration(750)
                .call(
                  (d3.zoom() as any).transform,
                  d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k * 1.2)
                );
            }}
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              const transform = d3.zoomTransform(svg.node()!);
              svg.transition()
                .duration(750)
                .call(
                  (d3.zoom() as any).transform,
                  d3.zoomIdentity.translate(transform.x, transform.y).scale(transform.k * 0.8)
                );
            }}
          >
            -
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const svg = d3.select(svgRef.current);
              svg.transition()
                .duration(750)
                .call(
                  (d3.zoom() as any).transform,
                  d3.zoomIdentity
                );
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      <div className="overflow-auto bg-white rounded-lg">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minWidth: width, minHeight: height }}
        />
      </div>
    </div>
  );
}

function createSimulation(
  layout: 'force' | 'circular' | 'hierarchical',
  nodes: Node[],
  links: Link[],
  width: number,
  height: number
): d3.Simulation<Node, Link> {
  switch (layout) {
    case 'circular':
      return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(200))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(100))
        .force('radial', d3.forceRadial(Math.min(width, height) / 3, width / 2, height / 2));

    case 'hierarchical':
      const stratify = d3.stratify<Node>()
        .id(d => d.id)
        .parentId(d => {
          const parent = links.find(l => l.target === d.id);
          return parent ? parent.source : '';
        });

      const root = stratify(nodes);
      const treeLayout = d3.tree<Node>().size([width - 200, height - 100]);
      const treeNodes = treeLayout(root);

      nodes.forEach((node, i) => {
        const treeNode = treeNodes.descendants()[i];
        node.x = treeNode.x;
        node.y = treeNode.y;
      });

      return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id))
        .force('collision', d3.forceCollide().radius(100))
        .alphaDecay(0.1);

    default: // force
      return d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(200))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(100));
  }
}
