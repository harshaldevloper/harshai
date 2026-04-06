'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConnectionModalProps {
  integrationName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (connection: any) => void;
}

export function ConnectionModal({
  integrationName,
  isOpen,
  onClose,
  onSuccess,
}: ConnectionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get OAuth URL
      const response = await fetch(`/api/integrations/${integrationName}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redirectUri: `${window.location.origin}/api/integrations/${integrationName}/callback`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to start OAuth flow');
      }
      
      const { authUrl } = await response.json();
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'oauth-popup',
        'width=600,height=700'
      );
      
      // Listen for OAuth completion
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup);
          // Refresh connections list
          onSuccess({});
          onClose();
        }
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect {integrationName}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            You will be redirected to {integrationName} to authorize HarshAI to access your account.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
