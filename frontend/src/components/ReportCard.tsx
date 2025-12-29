import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { MapPin } from 'lucide-react';

export interface ReportCardProps {
  id: string;
  location: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Investigating' | 'Resolved';
  description: string;
  reportedBy: string;
  date: string;
}

const severityVariant = {
  Low: 'success',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
} as const;

const statusVariant = {
  'Submitted': 'default',
  'Verified by AI': 'success',
  'Sent to authorities': 'warning',
  'Action in progress': 'info',
  'Action completed': 'success',
  // Legacy support
  'Pending': 'warning',
  'Investigating': 'info',
  'Resolved': 'success',
  'Verified': 'success',
} as const;

const ReportCard: React.FC<ReportCardProps> = ({
  id,
  location,
  type,
  severity,
  status,
  description,
  reportedBy,
  date,
}) => {
  return (
    <Card className="ocean-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">#{id}</CardTitle>
        <StatusBadge status={severity} variant={severityVariant[severity]} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <p className="text-foreground font-semibold text-sm">{type}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Reported by {reportedBy}</span>
          <span>{date}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <StatusBadge status={status} variant={statusVariant[status]} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportCard;

