import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

const EcosystemHealthRadar = () => {
    const data = [
        { category: 'Water Quality', current: 82, target: 95 },
        { category: 'Biodiversity', current: 75, target: 90 },
        { category: 'Coral Health', current: 62, target: 85 },
        { category: 'Fish Population', current: 78, target: 90 },
        { category: 'Pollution Level', current: 68, target: 80 },
        { category: 'Conservation Effort', current: 91, target: 95 },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Radar
                    name="Current Status"
                    dataKey="current"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.6}
                />
                <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default EcosystemHealthRadar;
