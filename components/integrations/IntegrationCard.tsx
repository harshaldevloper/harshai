'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IntegrationCardProps {
  name: string;
  displayName: string;
  description: string;
  logo: string;
  authType: 'oauth2' | 'api-key';
  connected?: boolean;
  accountName?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
}

export function IntegrationCard({
  name,
  displayName,
  description,
  logo,
  authType,
  connected,
  accountName,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
          {/* Logo placeholder - replace with actual image */}
          <span className="text-2xl font-bold text-gray-600">
            {displayName[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{displayName}</h3>
          {connected && accountName && (
            <p className="text-sm text-gray-500">{accountName}</p>
          )}
        </div>
        <Badge variant={connected ? 'default' : 'secondary'}>
          {connected ? 'Connected' : 'Not Connected'}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {authType === 'oauth2' ? 'OAuth 2.0' : 'API Key'}
          </Badge>
          {connected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              disabled={isLoading}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
