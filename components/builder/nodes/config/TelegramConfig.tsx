'use client';
import { useState } from 'react';
import { Node } from 'reactflow';
interface Props { node: Node; onUpdate: (id: string, data: any) => void; onClose: () => void; }
export default function TelegramConfig({ node, onUpdate, onClose }: Props) {
  const [botToken, setBotToken] = useState(node.data.botToken || '');
  const [chatId, setChatId] = useState(node.data.chatId || '');
  const [text, setText] = useState(node.data.text || '');
  const handleSave = () => { onUpdate(node.id, { ...node.data, botToken, chatId, text, label: 'Telegram Message' }); onClose(); };
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between"><h2 className="text-white font-bold">✈️ Telegram Config</h2><button onClick={onClose}>✕</button></div>
      <input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)} placeholder="Bot Token" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"/>
      <input type="text" value={chatId} onChange={(e) => setChatId(e.target.value)} placeholder="Chat ID" className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"/>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" rows={3} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"/>
      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3"><p className="text-xs text-blue-300">💡 Test Mode enabled</p></div>
      <div className="flex gap-2"><button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 rounded text-white">Save</button><button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded text-white">Cancel</button></div>
    </div>
  );
}
