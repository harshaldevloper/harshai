'use client';

export default function NodePanel() {
  const nodeTypes = [
    {
      category: 'Triggers',
      icon: '⚡',
      items: [
        { name: 'Webhook', description: 'When webhook received' },
        { name: 'Schedule', description: 'At scheduled time' },
        { name: 'YouTube', description: 'New video uploaded' },
        { name: 'Form', description: 'Form submission' },
        { name: 'Email', description: 'New email received' },
      ],
    },
    {
      category: 'AI Actions',
      icon: '🤖',
      items: [
        { name: 'ChatGPT', description: 'Generate text' },
        { name: 'Claude', description: 'AI analysis' },
        { name: 'ElevenLabs', description: 'Generate voice' },
        { name: 'Midjourney', description: 'Generate image' },
        { name: 'Jasper', description: 'Write content' },
      ],
    },
    {
      category: 'Logic',
      icon: '🔀',
      items: [
        { name: 'Condition', description: 'If/Then logic' },
        { name: 'Filter', description: 'Filter data' },
        { name: 'Router', description: 'Split paths' },
      ],
    },
    {
      category: 'Actions',
      icon: '✅',
      items: [
        { name: 'Email', description: 'Send email' },
        { name: 'Slack', description: 'Send message' },
        { name: 'CRM', description: 'Add to CRM' },
        { name: 'Database', description: 'Save data' },
      ],
    },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-purple-900/50 to-indigo-900/50 border-r border-white/10 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-white font-bold text-lg mb-4">Nodes</h2>
        <p className="text-indigo-300 text-sm mb-6">
          Drag nodes to the canvas
        </p>

        {nodeTypes.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <span>{group.icon}</span>
              {group.category}
            </h3>
            
            <div className="space-y-2">
              {group.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  draggable
                  className="bg-white/5 border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="text-white font-medium text-sm">
                    {item.name}
                  </div>
                  <div className="text-indigo-400 text-xs mt-1">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
