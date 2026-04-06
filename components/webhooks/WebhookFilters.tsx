'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, TestTube } from 'lucide-react';

interface WebhookFiltersProps {
  workflowId: string;
}

export function WebhookFilters({ workflowId }: WebhookFiltersProps) {
  const [filters, setFilters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFilter, setNewFilter] = useState({ filterType: 'jsonpath', field: '$.event', operator: 'equals', value: '' });

  useEffect(() => {
    fetch(`/api/webhooks/${workflowId}/filters`)
      .then(r => r.json())
      .then(data => { if (data.success) setFilters(data.filters); })
      .finally(() => setLoading(false));
  }, [workflowId]);

  async function handleAdd() {
    const res = await fetch(`/api/webhooks/${workflowId}/filters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFilter),
    });
    const data = await res.json();
    if (data.success) {
      setFilters([...filters, data.filter]);
      setNewFilter({ filterType: 'jsonpath', field: '$.event', operator: 'equals', value: '' });
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/webhooks/${workflowId}/filters/${id}`, { method: 'DELETE' });
    setFilters(filters.filter(f => f.id !== id));
  }

  async function handleTest() {
    const payload = { event: 'test', data: { status: 'active' } };
    const res = await fetch(`/api/webhooks/${workflowId}/filters/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload }),
    });
    const data = await res.json();
    alert(data.matches ? '✓ Payload matches all filters' : `✗ ${data.reason}`);
  }

  if (loading) return <Card><CardHeader><CardTitle>Filters</CardTitle></CardHeader></Card>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Webhook Filters</CardTitle>
          <Button variant="outline" size="sm" onClick={handleTest}><TestTube className="h-4 w-4 mr-2" />Test</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters.length === 0 ? (
          <p className="text-sm text-muted-foreground">No filters configured. All webhooks will trigger this workflow.</p>
        ) : (
          <div className="space-y-2">
            {filters.map((filter) => (
              <div key={filter.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <Badge variant="secondary" className="mr-2">{filter.filterType}</Badge>
                  <span className="font-mono text-sm">{filter.field}</span>
                  <span className="mx-2 text-muted-foreground">{filter.operator}</span>
                  <span className="font-mono text-sm">{JSON.stringify(filter.value)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(filter.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Add Filter</h4>
          <div className="grid grid-cols-4 gap-2">
            <select value={newFilter.filterType} onChange={(e) => setNewFilter({...newFilter, filterType: e.target.value})} className="p-2 border rounded">
              <option value="jsonpath">JSON Path</option>
              <option value="event">Event Type</option>
              <option value="regex">Regex</option>
            </select>
            <Input placeholder="$.field" value={newFilter.field} onChange={(e) => setNewFilter({...newFilter, field: e.target.value})} />
            <select value={newFilter.operator} onChange={(e) => setNewFilter({...newFilter, operator: e.target.value})} className="p-2 border rounded">
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="gt">&gt;</option>
              <option value="lt">&lt;</option>
            </select>
            <div className="flex gap-2">
              <Input placeholder="value" value={newFilter.value} onChange={(e) => setNewFilter({...newFilter, value: e.target.value})} />
              <Button onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
