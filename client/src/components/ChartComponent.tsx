import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartProps {
  type: "line" | "area" | "bar" | "pie" | "radar" | "scatter";
  data: ChartData[];
  width?: number;
  height?: number;
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  className?: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

const ChartComponent: React.FC<ChartProps> = ({
  type,
  data,
  width = 400,
  height = 300,
  title,
  xAxisKey = "name",
  yAxisKey = "value",
  dataKey = "value",
  colors = COLORS,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  className = "",
}) => {
  const renderChart = () => {
    const commonProps = {
      width,
      height,
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yAxisKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={yAxisKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={yAxisKey} fill={colors[0]} />
          </BarChart>
        );

      case "pie":
        return (
          <PieChart width={width} height={height}>
            <Pie
              data={data}
              cx={width / 2}
              cy={height / 2}
              labelLine={false}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </PieChart>
        );

      case "radar":
        return (
          <RadarChart width={width} height={height} data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxisKey} />
            <PolarRadiusAxis />
            <Radar
              name={title || "Value"}
              dataKey={yAxisKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
          </RadarChart>
        );

      case "scatter":
        return (
          <ScatterChart width={width} height={height} data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Scatter dataKey={yAxisKey} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
