import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReportsTimelineChartProps {
    data: Array<{ date: string; count: number }>;
}

const ReportsTimelineChart: React.FC<ReportsTimelineChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                    }}
                    labelFormatter={(value) => `Date: ${value}`}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: '#0ea5e9', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Reports Submitted"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default ReportsTimelineChart;
