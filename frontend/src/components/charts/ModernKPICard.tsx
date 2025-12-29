import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ModernKPICardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
    color?: string;
    subtitle?: string;
}

const ModernKPICard: React.FC<ModernKPICardProps> = ({
    title,
    value,
    change,
    changeLabel = 'vs last month',
    icon,
    color = '#0ea5e9',
    subtitle
}) => {
    const getTrendIcon = () => {
        if (change === undefined) return null;
        if (change > 0) return <TrendingUp className="h-4 w-4" />;
        if (change < 0) return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (change === undefined) return 'text-muted-foreground';
        if (change > 0) return 'text-success';
        if (change < 0) return 'text-destructive';
        return 'text-muted-foreground';
    };

    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 p-6 border border-border hover:shadow-lg transition-all duration-300">
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
                style={{ backgroundColor: color }}
            />

            <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    {icon && (
                        <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${color}20` }}
                        >
                            <div style={{ color }}>{icon}</div>
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className="space-y-1">
                    <h3
                        className="text-4xl font-bold tracking-tight"
                        style={{ color }}
                    >
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    )}
                </div>

                {/* Trend */}
                {change !== undefined && (
                    <div className={`flex items-center space-x-1 text-sm ${getTrendColor()}`}>
                        {getTrendIcon()}
                        <span className="font-medium">
                            {change > 0 ? '+' : ''}{change}%
                        </span>
                        <span className="text-muted-foreground text-xs">{changeLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernKPICard;
