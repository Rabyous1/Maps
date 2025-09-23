'use client';
import { display, margin } from '@mui/system';
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
} from 'recharts';

const COLORS = ['#28a745', '#2f6831ff', '#81C784', '#6EFF94'];

export default function CandidatesByProfileStatusChart({ data, styles }) {
  return (
    <ResponsiveContainer width="100%" height={300} className={styles.chartmargin}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="profileStatus" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
