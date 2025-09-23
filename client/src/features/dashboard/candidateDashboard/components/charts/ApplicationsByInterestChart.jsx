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

const INTEREST_COLORS = {
  'Interested': '#28a745',
  'Maybe': '#f0ad4e',
  'Not Interested': '#dc3545',
  'Not Mentioned': '#d4d6fa',
};

export default function ApplicationsByInterestChart({ data }) {
  const allStatuses = ['Interested', 'Maybe', 'Not Interested', 'Not Mentioned'];
  const completeData = allStatuses.map(status => {
    const found = data.find(d => d.interest === status);
    return found || { interest: status, count: 0 };
  });

  return (
    <div style={{
      width: '100%',
      height: '250px',
      margin: '0',
      padding: '0',
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={completeData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="interest"
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {completeData.map((entry) => (
              <Cell
                key={`cell-${entry.interest}`}
                fill={INTEREST_COLORS[entry.interest]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
