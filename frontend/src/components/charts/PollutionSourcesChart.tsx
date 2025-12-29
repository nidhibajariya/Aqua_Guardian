import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PollutionSourcesChartProps {
    data: Array<{ source: string; impact: number; trend: string }>;
}

const PollutionSourcesChart: React.FC<PollutionSourcesChartProps> = ({ data }) => {
    const getBarColor = (trend: string) => {
        switch (trend) {
            case 'Increasing':
                return '#ef4444';
            case 'Decreasing':
                return '#10b981';
            case 'Stable':
                return '#f59e0b';
            default:
                return '#64748b';
        }
    };

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis dataKey="source" type="category" stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                    }}
                />
                <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PollutionSourcesChart;
