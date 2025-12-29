import React from 'react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  step: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={item.step} className="relative pl-10">
          {index !== items.length - 1 && (
            <span className="absolute left-4 top-8 h-full w-px bg-border" aria-hidden />
          )}
          <div
            className={cn(
              'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
              'bg-ocean-primary/10 text-ocean-primary font-semibold'
            )}
          >
            {item.icon ?? item.step}
          </div>
          <div className="ocean-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <span className="text-xs text-muted-foreground font-medium">Step {item.step}</span>
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.actions && (
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {item.actions.map((action, actionIndex) => (
                  <li key={actionIndex}>{action}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;

