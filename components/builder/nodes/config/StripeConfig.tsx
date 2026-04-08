'use client';
import { useState } from 'react';
import { Node } from 'reactflow';
interface Props { node: Node; onUpdate: (id: string, data: any) => void; onClose: () => void; }
export default function StripeConfig({ node, onUpdate, onClose }: Props) {
  const [apiKey, setApiKey] = useState(node.data.apiKey || '');
  const handleSave = () => { onUpdate(node.id, { ...node.data, apiKey, label: 'Stripe Payment' }); onClose(); };
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between"><h2 className="text-white font-bold">💳 Stripe Config</h2><button onClick={onClose}>✕</button></div>
      <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk_test_..." className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"/>
      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3"><p className="text-xs text-blue-300">💡 Test Mode: No real charges</p></div>
      <div className="flex gap-2"><button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 rounded text-white">Save</button><button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-white">Cancel</button></div>
    </div>
  );
}
