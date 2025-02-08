import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type TableSchema } from '@/lib/types/schema-component';
import * as d3 from 'd3';
import { D3DragEvent, SimulationNodeDatum } from 'd3';
import { useEffect, useRef, useState } from 'react';

interface Node extends SimulationNodeDatum {
  id: string;
  label: string;
  fields: string[];
  type: 'table';
  x?: number;
  y?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  label: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

interface RelationshipGraphProps {
  schema: TableSchema[];
  width?: number;
  height?: number;
  onTableSelect?: (tableId: string) => void;
}

const RelationshipGraph = ({
  schema,
  width = 800,
  height = 600,
  onTableSelect,
}: RelationshipGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [layout, setLayout] = useState<'force' | 'circular' | 'hierarchical'>('force');

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Clear existing content
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Add zoom behavior
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoomBehavior);

    // Create nodes from tables
    const nodes: Node[] = schema.map((table) => ({
      id: table.name,
      label: table.name,
      fields: table.columns.map((col) => col.name),
      type: 'table',
    }));

    // Create links from relationships
    const links: Link[] = schema.flatMap((table) =>
      table.relationships.map((rel) => ({
        source: table.name,
        target: rel.targetTable,
        label: rel.type,
        type: rel.type as 'one-to-one' | 'one-to-many' | 'many-to-many',
      }))
    );

    // Create arrow markers for different relationship types
    const markers = [
      { id: 'one-to-many', path: 'M -10,-5 L 0,0 L -10,5' },
      { id: 'many-to-many', path: 'M -10,-5 L 0,0 L -10,5 M -14,-8 L -4,0 L -14,8' },
      { id: 'one-to-one', path: 'M -10,-5 L 0,0 L -10,5' },
    ];

    const defs = svg.append('defs');
    defs
      .selectAll<SVGMarkerElement, (typeof markers)[number]>('marker')
      .data(markers)
      .join('marker')
      .attr('id', (d) => d.id)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', (d) => d.path)
      .attr('fill', '#999');

    // Create links with proper typing
    const link = g
      .append('g')
      .selectAll<SVGPathElement, Link>('path')
      .data(links)
      .join('path')
      .attr('class', 'link')
      .attr('marker-end', (d) => `url(#${d.type})`);

    // Create nodes with proper typing
    const node = g
      .append('g')
      .selectAll<SVGGElement, Node>('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', (event: D3DragEvent<SVGGElement, Node>) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          })
          .on('drag', (event: D3DragEvent<SVGGElement, Node>) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          })
          .on('end', (event: D3DragEvent<SVGGElement, Node>) => {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          })
      );

    // Add table rectangles
    node
      .append('rect')
      .attr('width', 180)
      .attr('height', (d: Node) => 30 + d.fields.length * 20)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('class', 'node-rect');

    // Add table headers
    node
      .append('text')
      .text((d) => d.label)
      .attr('x', 10)
      .attr('y', 20)
      .attr('class', 'table-header');

    // Add field names
    node
      .selectAll<SVGTextElement, { name: string; index: number }>('text.field')
      .data((d) => d.fields.map((name, index) => ({ name, index })))
      .join('text')
      .attr('class', 'field')
      .text((d) => d.name)
      .attr('x', 10)
      .attr('y', (_d, i) => 40 + i * 20);

    // Add click handler for table selection
    node.on('click', (_event, d) => {
      if (onTableSelect) {
        onTableSelect(d.id);
      }
    });

    // Update simulation
    const simulation = createSimulation(layout, nodes, links, width, height);
    simulation.on('tick', () => {
      link.attr('d', (d) => {
        const sourceNode =
          typeof d.source === 'string' ? nodes.find((n) => n.id === d.source) : (d.source as Node);
        const targetNode =
          typeof d.target === 'string' ? nodes.find((n) => n.id === d.target) : (d.target as Node);
        if (
          !sourceNode ||
          !targetNode ||
          !sourceNode.x ||
          !sourceNode.y ||
          !targetNode.x ||
          !targetNode.y
        )
          return '';

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const offset = 90; // Half of node width

        if (dr === 0) return 'M0,0L0,0';

        const offsetX = (dx * offset) / dr;
        const offsetY = (dy * offset) / dr;

        return `M${sourceNode.x + offsetX},${sourceNode.y + offsetY}L${targetNode.x - offsetX},${targetNode.y - offsetY}`;
      });

      node.attr('transform', (d) => {
        if (!d.x || !d.y) return '';
        return `translate(${d.x},${d.y})`;
      });
    });

    return () => {
      simulation.stop();
    };
  }, [schema, layout, width, height, onTableSelect]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Select
            value={layout}
            onValueChange={(value: 'force' | 'circular' | 'hierarchical') => setLayout(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force-directed</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="relative" style={{ width, height }}>
        <svg ref={svgRef} width={width} height={height} className="bg-background" />
      </div>
    </div>
  );
};

function createSimulation(
  layout: 'force' | 'circular' | 'hierarchical',
  nodes: Node[],
  links: Link[],
  width: number,
  height: number
): d3.Simulation<Node, Link> {
  switch (layout) {
    case 'circular': {
      const simulation = d3
        .forceSimulation<Node>(nodes)
        .force('charge', d3.forceManyBody<Node>().strength(-1000))
        .force('center', d3.forceCenter<Node>(width / 2, height / 2))
        .force('collision', d3.forceCollide<Node>().radius(100))
        .force('radial', d3.forceRadial<Node>(Math.min(width, height) / 3, width / 2, height / 2));
      return simulation;
    }

    case 'hierarchical': {
      const stratify = d3
        .stratify<Node>()
        .id((d) => d.id)
        .parentId((d: Node) => {
          const parent = links.find((l) => {
            const targetId = typeof l.target === 'string' ? l.target : l.target.id;
            return targetId === d.id;
          });
          const sourceId = parent
            ? typeof parent.source === 'string'
              ? parent.source
              : parent.source.id
            : null;
          return sourceId;
        });

      const root = stratify(nodes);
      const treeLayout = d3.tree<Node>().size([width - 200, height - 100]);
      const treeNodes = treeLayout(root);
      return d3
        .forceSimulation<Node>(nodes)
        .force(
          'x',
          d3
            .forceX<Node>((d) => {
              const treeNode = treeNodes.find((n) => n.id === d.id);
              return treeNode ? treeNode.x : width / 2;
            })
            .strength(1)
        )
        .force(
          'y',
          d3
            .forceY<Node>((d) => {
              const treeNode = treeNodes.find((n) => n.id === d.id);
              return treeNode ? treeNode.y : height / 2;
            })
            .strength(1)
        );
    }

    default: {
      const simulation = d3
        .forceSimulation<Node>(nodes)
        .force('charge', d3.forceManyBody<Node>().strength(-1000))
        .force('center', d3.forceCenter<Node>(width / 2, height / 2));

      simulation
        .force(
          'link',
          d3
            .forceLink<Node, Link>(links)
            .id((d: Node): string => {
              return typeof d === 'string' ? d : d.id;
            })
            .distance(200)
        )
        .force('x', d3.forceX<Node>(width / 2))
        .force('y', d3.forceY<Node>(height / 2));

      return simulation;
    }
  }
}

export default RelationshipGraph;
