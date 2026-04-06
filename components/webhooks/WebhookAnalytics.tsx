'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WebhookAnalyticsProps {
  workflowId: string;
}

export function WebhookAnalytics({ workflowId }: WebhookAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/webhooks/${workflowId}/analytics/overview?days=30`)
      .then(r => r.json())
      .then(data => { if (data.success) setAnalytics(data); })
      .finally(() => setLoading(false));
  }, [workflowId]);

  if (loading) return <Card><CardHeader><CardTitle>Analytics</CardTitle></CardHeader></Card>;
  if (!analytics) return null;

  const healthColor = analytics.healthScore >= 90 ? 'bg-green-500' : analytics.healthScore >= 70 ? 'bg-yellow-500' : analytics.healthScore >= 50 ? 'bg-orange-500' : 'bg-red-500';
  const healthLabel = analytics.healthScore >= 90 ? 'Excellent' : analytics.healthScore >= 70 ? 'Good' : analytics.healthScore >= 50 ? 'Fair' : 'Poor';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Health Score</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${healthColor}`} />
              <span className="text-2xl font-bold">{analytics.healthScore}</span>
              <Badge variant="secondary">{healthLabel}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Success Rate</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-bold">{analytics.successRate}%</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Execution</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-bold">{analytics.avgExecutionTime}ms</span></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Webhooks</CardTitle></CardHeader>
          <CardContent><span className="text-2xl font-bold">{analytics.total}</span></CardContent>
        </Card>
      </div>
    </div>
  );
}
