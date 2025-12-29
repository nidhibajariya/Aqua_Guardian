import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ConservationEffectivenessChart: React.FC = () => {
    const data = [
        { year: '2020', effectiveness: 45 },
        { year: '2021', effectiveness: 58 },
        { year: '2022', effectiveness: 65 },
        { year: '2023', effectiveness: 72 },
        { year: '2024', effectiveness: 78 },
        { year: '2025', effectiveness: 85 },
    ];

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorEffectiveness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 12 }} />
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
                <Area
                    type="monotone"
                    dataKey="effectiveness"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorEffectiveness)"
                    name="Conservation Success Rate (%)"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ConservationEffectivenessChart;
