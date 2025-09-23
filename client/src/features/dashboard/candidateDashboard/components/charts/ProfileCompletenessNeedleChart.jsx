'use client';
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

export default function ProfileCompletenessNeedleChart({ value, styles }) {
  const data = [
    { name: 'Incomplete', value: 100 - value },
    { name: 'Complete',   value },
  ];
  const COLORS = ['#d4d6fa', '#797EFF'];

  const centerX = 200;
  const centerY = 150;
  const iR = 70;
  const oR = 100;

  const RADIAN = Math.PI / 180;
  const angle = 180 * (value / 100);
  const radians = -angle * RADIAN;
  const length = (iR + oR) / 2;

  const x = centerX + length * Math.cos(radians);
  const y = centerY + length * Math.sin(radians);

  return (
    <div className={styles.chartContainer}>
          
      <PieChart width={400} height={200}>
        <Pie
          data={data}
          cx={centerX}
          cy={centerY}
          startAngle={180}
          endAngle={0}
          innerRadius={iR}
          outerRadius={oR}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
          
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx]} />
          ))}
        </Pie>

        {/* Needle */}
        <g>
          <line
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="#343C70"
            strokeWidth={5}
          />
          <circle cx={centerX} cy={centerY} r={5} fill="#343C70" />
        </g>

        {/* Centered Text */}
        <text
          x={centerX}
          y={centerY + 20}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={24}
          fontWeight="bold"
          fill="#343C70"
        >
          {value}%
        </text>

        <Tooltip
          formatter={(v, name) => [`${v}%`, name]}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
          }}
        />
      </PieChart>
    </div>
  );
}
