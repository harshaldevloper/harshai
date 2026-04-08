'use client';
import { useState } from 'react';
import { Node } from 'reactflow';

interface Props {
  node: Node;
  integrationName: string;
  onUpdate: (id: string, data: any) => void;
  onClose: () => void;
}

export default function GenericIntegrationConfig({ node, integrationName, onUpdate, onClose }: Props) {
  const [apiKey, setApiKey] = useState(node.data.apiKey || '');
  const [config1, setConfig1] = useState(node.data.config1 || '');
  const [config2, setConfig2] = useState(node.data.config2 || '');
  
  const handleSave = () => {
    onUpdate(node.id, { 
      ...node.data, 
      apiKey, 
      config1, 
      config2, 
      label: node.data.label || `${integrationName} Action` 
    });
    onClose();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-white font-bold">{integrationName} Config</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>
      
      <input 
        type="password" 
        value={apiKey} 
        onChange={(e) => setApiKey(e.target.value)} 
        placeholder="API Key / Token" 
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
      />
      <input 
        type="text" 
        value={config1} 
        onChange={(e) => setConfig1(e.target.value)} 
        placeholder="Config 1 (e.g., Host, URL)" 
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
      />
      <input 
        type="text" 
        value={config2} 
        onChange={(e) => setConfig2(e.target.value)} 
        placeholder="Config 2 (e.g., Database, Channel)" 
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
      />
      
      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
        <p className="text-xs text-blue-300">💡 Test Mode enabled - no API calls made</p>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium">
          Save
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}
