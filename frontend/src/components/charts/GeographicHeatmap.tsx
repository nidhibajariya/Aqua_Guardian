import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';

interface GeographicHeatmapProps {
    data: Array<{
        location: string;
        lat: number;
        lng: number;
        severity: number;
        reports: number;
    }>;
}

const GeographicHeatmap: React.FC<GeographicHeatmapProps> = ({ data }) => {
    const getColor = (severity: number) => {
        if (severity >= 80) return '#ef4444'; // Red
        if (severity >= 60) return '#f59e0b'; // Orange
        if (severity >= 40) return '#eab308'; // Yellow
        return '#10b981'; // Green
    };

    return (
        <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis
                    type="number"
                    dataKey="lng"
                    name="Longitude"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Longitude', position: 'insideBottom', offset: -10, fill: '#64748b' }}
                />
                <YAxis
                    type="number"
                    dataKey="lat"
                    name="Latitude"
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Latitude', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                />
                <ZAxis type="number" dataKey="reports" range={[100, 1000]} name="Reports" />
                <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        color: '#e2e8f0'
                    }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-card p-3 rounded-lg border border-border">
                                    <p className="font-semibold text-foreground">{data.location}</p>
                                    <p className="text-sm text-muted-foreground">Severity: {data.severity}%</p>
                                    <p className="text-sm text-muted-foreground">Reports: {data.reports}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {data.lat.toFixed(2)}°, {data.lng.toFixed(2)}°
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Scatter name="Pollution Hotspots" data={data}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColor(entry.severity)} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
};

export default GeographicHeatmap;
