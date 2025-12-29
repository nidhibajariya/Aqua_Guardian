import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { fetchWaterQualityHistory } from '../services/api';

interface WaterQualityData {
    time: string;
    pH: number;
    oxygen: number;
    turbidity: number;
    temperature: number;
    salinity: number;
}

const LiveWaterQualityChart = () => {
    const [data, setData] = useState<WaterQualityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setError(null);
            const historyData = await fetchWaterQualityHistory(20);

            if (historyData && historyData.length > 0) {
                setData(historyData);
            } else {
                // Fallback to mock data if no readings exist
                setData([
                    { time: '00:00', pH: 7.2, oxygen: 8.5, turbidity: 2.1, temperature: 25.0, salinity: 0.5 },
                    { time: '04:00', pH: 7.1, oxygen: 8.3, turbidity: 2.3, temperature: 24.5, salinity: 0.4 },
                    { time: '08:00', pH: 7.3, oxygen: 8.7, turbidity: 1.9, temperature: 26.0, salinity: 0.6 },
                    { time: '12:00', pH: 7.0, oxygen: 8.1, turbidity: 2.5, temperature: 27.0, salinity: 0.5 },
                    { time: '16:00', pH: 7.2, oxygen: 8.6, turbidity: 2.0, temperature: 26.5, salinity: 0.5 },
                    { time: '20:00', pH: 7.4, oxygen: 8.8, turbidity: 1.8, temperature: 25.5, salinity: 0.4 },
                    { time: '23:59', pH: 7.3, oxygen: 8.4, turbidity: 2.2, temperature: 25.0, salinity: 0.5 },
                ]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error loading water quality data:', err);
            setError('Failed to load water quality data');
            setLoading(false);

            // Use fallback data on error
            setData([
                { time: '00:00', pH: 7.2, oxygen: 8.5, turbidity: 2.1, temperature: 25.0, salinity: 0.5 },
                { time: '04:00', pH: 7.1, oxygen: 8.3, turbidity: 2.3, temperature: 24.5, salinity: 0.4 },
                { time: '08:00', pH: 7.3, oxygen: 8.7, turbidity: 1.9, temperature: 26.0, salinity: 0.6 },
                { time: '12:00', pH: 7.0, oxygen: 8.1, turbidity: 2.5, temperature: 27.0, salinity: 0.5 },
                { time: '16:00', pH: 7.2, oxygen: 8.6, turbidity: 2.0, temperature: 26.5, salinity: 0.5 },
                { time: '20:00', pH: 7.4, oxygen: 8.8, turbidity: 1.8, temperature: 25.5, salinity: 0.4 },
                { time: '23:59', pH: 7.3, oxygen: 8.4, turbidity: 2.2, temperature: 25.0, salinity: 0.5 },
            ]);
        }
    };

    useEffect(() => {
        loadData();

        // Refresh data every 30 seconds
        const interval = setInterval(loadData, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="w-full h-[300px] bg-card rounded-lg p-4 flex items-center justify-center">
                <div className="text-muted-foreground">Loading water quality data...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-[300px] bg-card rounded-lg p-4">
            {error && (
                <div className="text-xs text-yellow-500 mb-2">
                    ⚠️ {error} - Showing fallback data
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '0.5rem',
                            color: '#f3f4f6'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="pH"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                        name="pH Level"
                    />
                    <Line
                        type="monotone"
                        dataKey="oxygen"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Dissolved Oxygen (mg/L)"
                    />
                    <Line
                        type="monotone"
                        dataKey="turbidity"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Turbidity (NTU)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default LiveWaterQualityChart;
