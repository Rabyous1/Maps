'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
} from 'recharts';

const COLORS = ['#FFF9C4', '#EED600']; 

function renderActiveShape(props) {
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontWeight="bold">
        {`${payload.name}: ${value}%`}
      </text>
    </g>
  );
}

export default function CommunicationEngagementChart({ engagementLevel, styles }) {
  const [activeIndex, setActiveIndex] = useState(1);

  const engagementData = [
    { name: 'Unfilled', value: 100 - engagementLevel },
    { name: 'Engagement', value: engagementLevel },
  ];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className={styles.commEngagementChartContainer}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            activeIndex={activeIndex}
             activeShape={true}
            data={engagementData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {engagementData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{}}
            wrapperStyle={{}}
            className={styles.commEngagementChartTooltipContent}
            formatter={(val, name) => [`${val}%`, name]}
          />
          <text
            className={styles.chartCenteredText}
            x="50%"
            y="50%"
          >
            {engagementLevel}%
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
