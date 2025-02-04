'use client';

import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-react';
import type { ReactElement } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: 'warning' | 'info';
}

interface AlertsSectionProps {
  alerts: DashboardAlert[];
}

export function AlertsSection({ alerts }: AlertsSectionProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircleIcon className="h-4 w-4" />
          Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            variant={alert.type === 'warning' ? 'destructive' : 'default'}
          >
            {alert.type === 'warning' ? (
              <AlertTriangleIcon className="h-4 w-4" />
            ) : (
              <AlertCircleIcon className="h-4 w-4" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        ))}
        {alerts.length === 0 && (
          <p className="text-sm text-muted-foreground">No active alerts</p>
        )}
      </CardContent>
    </Card>
  );
}
