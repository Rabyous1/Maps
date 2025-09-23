'use client';
import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Rectangle } from 'recharts';

export default function OpportunitiesByContractTypeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 35, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
         <XAxis 
                  dataKey="contractType" 
                  angle={0} 
                  textAnchor="end"
                  tickFormatter={(value) => value.charAt(0)}
                />
        <YAxis domain={[0, (dataMax) => dataMax + 1]}/>
        <Tooltip />
        <Bar dataKey="count" fill="#343C70" activeBar={<Rectangle fill="#798BA3" />} />
      </BarChart>
    </ResponsiveContainer>
  );
}
