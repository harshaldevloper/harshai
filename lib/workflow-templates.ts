import { Node, Edge } from 'reactflow';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'business' | 'productivity' | 'social';
  icon: string;
  nodes: Node[];
  edges: Edge[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'youtube-to-blog',
    name: 'YouTube → Blog Post',
    description: 'Auto-generate blog posts from YouTube videos',
    category: 'content',
    icon: '🎥',
    estimatedTime: '5 min setup',
    difficulty: 'beginner',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'YouTube Upload', triggerType: 'youtube' },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: { label: 'Transcribe Video', actionType: 'elevenlabs' },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 250, y: 350 },
        data: { label: 'Write Blog Post', actionType: 'chatgpt' },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 500 },
        data: { label: 'Publish to Blog', actionType: 'webhook' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  {
    id: 'content-repurposing',
    name: '1 Video → 10 Social Posts',
    description: 'Repurpose one video into multiple social media posts',
    category: 'social',
    icon: '📱',
    estimatedTime: '10 min setup',
    difficulty: 'intermediate',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'YouTube Upload', triggerType: 'youtube' },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 180 },
        data: { label: 'Extract Transcript', actionType: 'chatgpt' },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 320 },
        data: { label: 'Generate Twitter Thread', actionType: 'chatgpt' },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 320 },
        data: { label: 'Generate LinkedIn Post', actionType: 'chatgpt' },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 400, y: 320 },
        data: { label: 'Generate Instagram Caption', actionType: 'chatgpt' },
      },
      {
        id: '6',
        type: 'action',
        position: { x: 250, y: 450 },
        data: { label: 'Schedule All Posts', actionType: 'slack' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e2-4', source: '2', target: '4', animated: true },
      { id: 'e2-5', source: '2', target: '5', animated: true },
      { id: 'e3-6', source: '3', target: '6', animated: true },
      { id: 'e4-6', source: '4', target: '6', animated: true },
      { id: 'e5-6', source: '5', target: '6', animated: true },
    ],
  },
  {
    id: 'lead-capture',
    name: 'Lead Capture → Email Sequence',
    description: 'Automatically nurture leads with email sequences',
    category: 'business',
    icon: '📧',
    estimatedTime: '15 min setup',
    difficulty: 'intermediate',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'Form Submission', triggerType: 'form' },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 180 },
        data: { label: 'Add to CRM', actionType: 'notion' },
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 250, y: 310 },
        data: { label: 'Lead Score > 50?', conditionType: 'if-else', condition: 'score > 50' },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 100, y: 440 },
        data: { label: 'Send Premium Sequence', actionType: 'gmail' },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 400, y: 440 },
        data: { label: 'Send Basic Sequence', actionType: 'gmail' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true', animated: true },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false', animated: true },
    ],
  },
  {
    id: 'voice-cloning',
    name: 'AI Voiceover Generator',
    description: 'Generate professional voiceovers from scripts',
    category: 'content',
    icon: '🎙️',
    estimatedTime: '5 min setup',
    difficulty: 'beginner',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'Script Upload', triggerType: 'webhook' },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 180 },
        data: { label: 'Generate Voice', actionType: 'elevenlabs' },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 250, y: 310 },
        data: { label: 'Save to Drive', actionType: 'spreadsheet' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },
  {
    id: 'social-monitoring',
    name: 'Brand Mention Monitor',
    description: 'Track and respond to brand mentions automatically',
    category: 'social',
    icon: '🔍',
    estimatedTime: '20 min setup',
    difficulty: 'advanced',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: { label: 'Social Mention', triggerType: 'social' },
      },
      {
        id: '2',
        type: 'condition',
        position: { x: 250, y: 180 },
        data: { label: 'Sentiment Analysis', conditionType: 'if-else', condition: 'sentiment = negative' },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 100, y: 310 },
        data: { label: 'Alert Team', actionType: 'slack' },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 400, y: 310 },
        data: { label: 'Auto-Thank User', actionType: 'chatgpt' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', sourceHandle: 'true', animated: true },
      { id: 'e2-4', source: '2', target: '4', sourceHandle: 'false', animated: true },
    ],
  },
];

export function getTemplateById(id: string): WorkflowTemplate | null {
  return workflowTemplates.find(t => t.id === id) || null;
}

export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return workflowTemplates.filter(t => t.category === category);
}
