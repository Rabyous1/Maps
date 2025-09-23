'use client';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList
} from 'recharts';

export default function ApplicantsPerOpportunityChart({ data }) {
  const CircleLabel = (props) => {
    const { x = 0, y = 0, width = 0, index } = props || {};

    const radius = 12;
    const cx = x + width / 2;
    const cy = y - radius - 8; 

    const firstLetter =
      data?.[index]?.opportunityTitle?.charAt(0)?.toUpperCase() ?? '?';

    return (
      <g>
        <circle cx={cx} cy={cy} r={radius} fill="#D0D5F7" stroke="#797EFF" strokeWidth={2} />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#000000ff"
          fontSize={12}
          fontWeight="bold"
        >
          {firstLetter}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 50, right: 35, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="opportunityTitle" hide />
        <YAxis domain={[0, (dataMax) => dataMax + 1]} allowDecimals={false}/>

        <Tooltip />
        <Bar dataKey="applicants" fill="#797EFF">
          <LabelList content={<CircleLabel />} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
