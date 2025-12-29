import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface ReportStatusChartProps {
    data: Array<{ status: string; count: number }>;
}

const ReportStatusChart: React.FC<ReportStatusChartProps> = ({ data }) => {
    const getBarColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return '#f59e0b';
            case 'Investigating':
                return '#0ea5e9';
            case 'Resolved':
            case 'Verified':
                return '#10b981';
            default:
                return '#64748b';
        }
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="status" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                    }}
                />
                <Legend />
                <Bar
                    dataKey="count"
                    fill="#0ea5e9"
                    radius={[8, 8, 0, 0]}
                    name="Number of Reports"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ReportStatusChart;
