'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Rectangle } from 'recharts';

export default function OpportunitiesByTypeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 35, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        
        <XAxis 
          dataKey="type" 
          angle={0} 
          textAnchor="end"
          tickFormatter={(value) => value.charAt(0)}
        />
        
        <YAxis />
        
        <Tooltip />
        <Bar 
          dataKey="count" 
          fill="#797EFF" 
          activeBar={<Rectangle fill="#a0a0ebff" />} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
