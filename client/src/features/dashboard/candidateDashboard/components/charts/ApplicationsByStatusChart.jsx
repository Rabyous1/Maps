'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';

const STATUS_COLORS = {
  Pending: '#EED600',
  Accepted: '#28a745',
  Rejected: '#dc3545',
};

export default function SimpleStatusBarChart({ data }) {
  const filteredData = data.filter(d =>
    ['Pending', 'Accepted', 'Rejected'].includes(d.status)
  );

  return (
    <div style={{ 
      width: '100%',
      height: '250px',
      padding: '0',
      margin: '0'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ 
            top: 20, 
            right: 30, 
            left: 20, 
            bottom: 5 
          }}
        >
          <CartesianGrid 
            horizontal={true} 
            vertical={false} 
            strokeDasharray="3 3" 
          />
          <XAxis 
            type="number" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            dataKey="status"
            type="category"
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
          >
            {filteredData.map((entry) => (
              <Cell 
                key={`cell-${entry.status}`} 
                fill={STATUS_COLORS[entry.status]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}