import React from 'react';

interface CircularKPIProps {
    value: number;
    max: number;
    label: string;
    color?: string;
    size?: number;
}

const CircularKPI: React.FC<CircularKPIProps> = ({
    value,
    max,
    label,
    color = '#0ea5e9',
    size = 120
}) => {
    // Ensure valid numbers to prevent NaN
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    const safeMax = typeof max === 'number' && !isNaN(max) && max > 0 ? max : 1;

    const percentage = (safeValue / safeMax) * 100;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center space-y-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r="45"
                        fill="none"
                        stroke="#334155"
                        strokeWidth="8"
                        opacity="0.2"
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r="45"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color }}>{safeValue}</span>
                    <span className="text-xs text-muted-foreground">of {safeMax}</span>
                </div>
            </div>
            <p className="text-sm font-medium text-foreground text-center">{label}</p>
        </div>
    );
};

export default CircularKPI;
