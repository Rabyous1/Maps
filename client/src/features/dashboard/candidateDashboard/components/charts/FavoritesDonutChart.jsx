'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

  const COLORS = ['#dc3545','#FCC4C3'];


const FavoritesDonutChart = ({ favoritesCount, totalApplications , styles}) => {
  const remaining = Math.max(totalApplications - favoritesCount, 0);
  const data = [
    { name: 'Saved Applications', value: favoritesCount },
    { name: 'Unsaved Applications', value: remaining },
  ];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          labelLine={false} 
          label={false}  
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 10 }} />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.chartCenteredText}

        >
          {favoritesCount}/{totalApplications}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FavoritesDonutChart;
