import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

interface PollutionSeverityGaugeProps {
    data: Array<{ name: string; value: number; fill: string }>;
}

const PollutionSeverityGauge: React.FC<PollutionSeverityGaugeProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="10%"
                outerRadius="80%"
                barSize={15}
                data={data}
                startAngle={180}
                endAngle={0}
            >
                <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                />
                <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{
                        fontSize: '12px'
                    }}
                />
            </RadialBarChart>
        </ResponsiveContainer>
    );
};

export default PollutionSeverityGauge;
