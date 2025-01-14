import React from 'react'

interface HeatMapProps {
  data: { x: string; y: string; value: number }[]
  width?: number
  height?: number
  colorRange?: string[]
}

export function HeatMap({
  data,
  width = 800,
  height = 400,
  colorRange = ['#f7fbff', '#08519c'],
}: HeatMapProps) {
  const xValues = [...new Set(data.map((d) => d.x))]
  const yValues = [...new Set(data.map((d) => d.y))]
  const cellWidth = width / xValues.length
  const cellHeight = height / yValues.length

  const minValue = Math.min(...data.map((d) => d.value))
  const maxValue = Math.max(...data.map((d) => d.value))

  const getColor = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue)
    const [startColor, endColor] = colorRange
    return interpolateColor(startColor, endColor, normalizedValue)
  }

  const interpolateColor = (start: string, end: string, ratio: number) => {
    const startRGB = hexToRGB(start)
    const endRGB = hexToRGB(end)
    const result = startRGB.map((channel, i) => {
      return Math.round(channel + (endRGB[i] - channel) * ratio)
    })
    return `rgb(${result.join(',')})`
  }

  const hexToRGB = (hex: string): number[] => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  return (
    <svg width={width} height={height}>
      {data.map((d, i) => {
        const x = xValues.indexOf(d.x) * cellWidth
        const y = yValues.indexOf(d.y) * cellHeight
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cellWidth}
              height={cellHeight}
              fill={getColor(d.value)}
              stroke='#fff'
              strokeWidth={1}
            />
            <text
              x={x + cellWidth / 2}
              y={y + cellHeight / 2}
              textAnchor='middle'
              dominantBaseline='middle'
              fill='#000'
              fontSize={12}
            >
              {d.value}
            </text>
          </g>
        )
      })}
      <g>
        {xValues.map((value, i) => (
          <text
            key={`x-${i}`}
            x={i * cellWidth + cellWidth / 2}
            y={height + 20}
            textAnchor='middle'
            fontSize={12}
          >
            {value}
          </text>
        ))}
        {yValues.map((value, i) => (
          <text
            key={`y-${i}`}
            x={-10}
            y={i * cellHeight + cellHeight / 2}
            textAnchor='end'
            dominantBaseline='middle'
            fontSize={12}
          >
            {value}
          </text>
        ))}
      </g>
    </svg>
  )
}
