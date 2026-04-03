/**
 * Workflow Template System
 * Pre-built workflow templates for common automation scenarios
 */

export interface TemplateNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  position: { x: number; y: number };
  data: {
    label: string;
    triggerType?: string;
    actionType?: string;
    conditionType?: string;
    config?: Record<string, any>;
  };
}

export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  type?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social-media' | 'email' | 'content' | 'ecommerce' | 'support' | 'data';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string; // e.g., "10 minutes"
  nodes: TemplateNode[];
  edges: TemplateEdge[];
  thumbnail?: string;
  tags: string[];
}

/**
 * Pre-built Workflow Templates
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'youtube-to-blog',
    name: 'YouTube → Blog Post',
    description: 'Automatically generate blog posts from YouTube video transcripts',
    category: 'content',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    tags: ['YouTube', 'Blog', 'Content', 'AI'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'YouTube Upload',
          triggerType: 'youtube',
          config: { channel: 'your-channel' }
        }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
          label: 'Extract Transcript',
          actionType: 'youtube-transcript',
          config: { language: 'en' }
        }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 250, y: 350 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: { 
            prompt: 'Convert this transcript into a blog post with introduction, body, and conclusion',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 500 },
        data: {
          label: 'Notion',
          actionType: 'notion',
          config: { database: 'blog-posts', action: 'create' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', animated: true, type: 'smoothstep' }
    ]
  },
  {
    id: 'lead-capture-email',
    name: 'Lead Capture → Email Follow-up',
    description: 'Capture leads from forms and send automated personalized follow-ups',
    category: 'email',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    tags: ['Lead Gen', 'Email', 'CRM', 'Automation'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Form Submission',
          triggerType: 'form',
          config: { formId: 'lead-capture-form' }
        }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
          label: 'Spreadsheet',
          actionType: 'spreadsheet',
          config: { action: 'append', sheet: 'leads' }
        }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 250, y: 350 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Write a personalized follow-up email based on this lead info',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 500 },
        data: {
          label: 'Gmail',
          actionType: 'gmail',
          config: { action: 'send', template: 'follow-up' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', animated: true, type: 'smoothstep' }
    ]
  },
  {
    id: 'social-cross-post',
    name: 'Social Media Cross-Post',
    description: 'Post content to multiple social platforms simultaneously',
    category: 'social-media',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    tags: ['Social Media', 'Twitter', 'LinkedIn', 'Automation'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Schedule',
          triggerType: 'schedule',
          config: { frequency: 'daily', time: '09:00' }
        }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Generate 5 engaging social media posts about AI automation',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 50, y: 350 },
        data: {
          label: 'Twitter/X',
          actionType: 'twitter',
          config: { action: 'post' }
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 350 },
        data: {
          label: 'LinkedIn',
          actionType: 'linkedin',
          config: { action: 'post' }
        }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 450, y: 350 },
        data: {
          label: 'Bluesky',
          actionType: 'bluesky',
          config: { action: 'post' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
      { id: 'e2-4', source: '2', target: '4', animated: true, type: 'smoothstep' },
      { id: 'e2-5', source: '2', target: '5', animated: true, type: 'smoothstep' }
    ]
  },
  {
    id: 'content-repurposing',
    name: 'Content Repurposing Engine',
    description: 'Turn one blog post into tweets, LinkedIn posts, and email newsletter',
    category: 'content',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    tags: ['Content', 'Blog', 'Social Media', 'Email'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Webhook',
          triggerType: 'webhook',
          config: { webhookUrl: 'your-webhook-url' }
        }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Extract 10 key points from this blog post',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '3',
        type: 'action',
        position: { x: 50, y: 350 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Create a Twitter thread from these key points',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 250, y: 350 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Create a LinkedIn post from these key points',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 450, y: 350 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Create an email newsletter from these key points',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '6',
        type: 'action',
        position: { x: 50, y: 500 },
        data: {
          label: 'Twitter/X',
          actionType: 'twitter',
          config: { action: 'post-thread' }
        }
      },
      {
        id: '7',
        type: 'action',
        position: { x: 250, y: 500 },
        data: {
          label: 'LinkedIn',
          actionType: 'linkedin',
          config: { action: 'post' }
        }
      },
      {
        id: '8',
        type: 'action',
        position: { x: 450, y: 500 },
        data: {
          label: 'Gmail',
          actionType: 'gmail',
          config: { action: 'send-newsletter' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
      { id: 'e2-4', source: '2', target: '4', animated: true, type: 'smoothstep' },
      { id: 'e2-5', source: '2', target: '5', animated: true, type: 'smoothstep' },
      { id: 'e3-6', source: '3', target: '6', animated: true, type: 'smoothstep' },
      { id: 'e4-7', source: '4', target: '7', animated: true, type: 'smoothstep' },
      { id: 'e5-8', source: '5', target: '8', animated: true, type: 'smoothstep' }
    ]
  },
  {
    id: 'support-triage',
    name: 'Customer Support Triage',
    description: 'Auto-categorize support tickets and route to the right team',
    category: 'support',
    difficulty: 'advanced',
    estimatedTime: '25 minutes',
    tags: ['Support', 'Email', 'AI', 'Routing'],
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 50 },
        data: {
          label: 'Email',
          triggerType: 'email',
          config: { inbox: 'support@company.com' }
        }
      },
      {
        id: '2',
        type: 'action',
        position: { x: 250, y: 200 },
        data: {
          label: 'ChatGPT',
          actionType: 'chatgpt',
          config: {
            prompt: 'Analyze sentiment and categorize this support ticket',
            model: 'gpt-4'
          }
        }
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 250, y: 350 },
        data: {
          label: 'If/Else',
          conditionType: 'if-else',
          config: {
            condition: 'category',
            operator: 'equals'
          }
        }
      },
      {
        id: '4',
        type: 'action',
        position: { x: 50, y: 500 },
        data: {
          label: 'Slack',
          actionType: 'slack',
          config: { channel: '#support-technical', action: 'send' }
        }
      },
      {
        id: '5',
        type: 'action',
        position: { x: 250, y: 500 },
        data: {
          label: 'Slack',
          actionType: 'slack',
          config: { channel: '#support-billing', action: 'send' }
        }
      },
      {
        id: '6',
        type: 'action',
        position: { x: 450, y: 500 },
        data: {
          label: 'Slack',
          actionType: 'slack',
          config: { channel: '#support-general', action: 'send' }
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, type: 'smoothstep' },
      { id: 'e2-3', source: '2', target: '3', animated: true, type: 'smoothstep' },
      { id: 'e3-4', source: '3', target: '4', animated: true, type: 'smoothstep' },
      { id: 'e3-5', source: '3', target: '5', animated: true, type: 'smoothstep' },
      { id: 'e3-6', source: '3', target: '6', animated: true, type: 'smoothstep' }
    ]
  }
];

/**
 * Get all templates
 */
export function getAllTemplates(): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter(t => t.category === category);
}

/**
 * Search templates
 */
export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  const categories = new Set(WORKFLOW_TEMPLATES.map(t => t.category));
  return Array.from(categories);
}
