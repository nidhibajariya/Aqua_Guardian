import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendComparisonChartProps {
    data: Array<{ month: string; reports: number; resolved: number; avgResponseTime: number }>;
}

const TrendComparisonChart: React.FC<TrendComparisonChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                    }}
                />
                <Legend />
                <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="reports"
                    fill="url(#colorReports)"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    name="Total Reports"
                />
                <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="resolved"
                    fill="url(#colorResolved)"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Resolved Reports"
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgResponseTime"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5 }}
                    name="Avg Response Time (days)"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default TrendComparisonChart;
