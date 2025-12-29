import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  default: 'bg-gray-100 text-gray-800 border-gray-200',
};

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
  variant?: StatusVariant;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default', className, ...props }) => {
  return (
    <Badge className={cn(variantStyles[variant], className)} {...props}>
      {status}
    </Badge>
  );
};

export default StatusBadge;

