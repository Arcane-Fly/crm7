interface HeatMapProps {
  data: number[][];
  startColor?: string;
  endColor?: string;
  cellSize?: number;
  gap?: number;
}

export function HeatMap({
  data,
  startColor = '#ffffff',
  endColor = '#ff0000',
  cellSize = 40,
  gap = 4,
}: HeatMapProps): JSX.Element {
  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());

  const getColor = (value: number, maxValue: number): string => {
    const intensity = value / maxValue;
    return `rgb(0, ${Math.round(intensity * 255)}, 0)`;
  };

  const formatTooltip = (value: number): string => {
    return `Value: ${value}`;
  };

  function interpolateColor(start: string, end: string, ratio: number): string {
    const startRGB = hexToRGB(start);
    const endRGB = hexToRGB(end);

    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * ratio);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * ratio);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRGB(hex: string): { r: number; g: number; b: number } {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  return (
    <div className="inline-grid" style={{ gap }}>
      {data.map((row, i) => (
        <div key={i} className="flex" style={{ gap }}>
          {row.map((value, j) => (
            <div
              key={j}
              className="flex items-center justify-center"
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getColor(value, maxValue),
              }}
              title={formatTooltip(value)}
            >
              {value}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
