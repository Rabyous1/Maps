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
  Interview: '#6ECFFE',
  Shortlisted: '#6EFF94',
};

export default function ApplicationsByStatusChart({ data,styles }) {
  const filteredData = data.filter(d =>
    Object.keys(STATUS_COLORS).includes(d.applicationStatus)
  );

  return (
    // <div style={{ width: '100%', height: '250px', padding: 0, margin: 0 }}>
      <ResponsiveContainer width="100%" height={300} className={styles.chartmargin}>
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis
            dataKey="applicationStatus"
            type="category"
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {filteredData.map((entry) => (
              <Cell
                key={`cell-${entry.applicationStatus}`}
                fill={STATUS_COLORS[entry.applicationStatus] || '#8884d8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    // </div>
  );
}
