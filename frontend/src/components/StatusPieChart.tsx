import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ReportData } from '../types';

interface StatusPieChartProps {
  reports: ReportData[];
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ reports }) => {
  // Define helper functions first
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'submitted': return '#3b82f6';
      case 'initial-review': return '#8b5cf6';
      case 'review-process': return '#06b6d4';
      case 'final-review': return '#84cc16';
      case 'supplier-sample': return '#f97316';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'submitted': return 'Submitted';
      case 'initial-review': return 'Initial Review';
      case 'review-process': return 'Review Process';
      case 'final-review': return 'Final Review';
      case 'supplier-sample': return 'Supplier Sample';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  // Count reports by status
  const statusCounts = reports.reduce((acc, report) => {
    const status = report.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to chart data format using the helper function
  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: getStatusLabel(status),
    value: count,
    status: status
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-semibold">
              {((data.value / reports.length) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data, show empty state
  if (reports.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No reports available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[192px] flex items-center">
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={192} minHeight={192}>
          <PieChart>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            innerRadius={20}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getStatusColor(entry.status)}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="middle" 
            align="right"
            layout="vertical"
            iconType="circle"
            wrapperStyle={{ 
              fontSize: '11px', 
              paddingLeft: '20px',
              lineHeight: '18px'
            }}
          />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};