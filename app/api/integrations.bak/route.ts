/**
 * GET /api/integrations
 * List all available integrations
 */

import { NextResponse } from 'next/server';
import { integrationRegistry } from '@/lib/integrations/registry';

const integrationDetails: Record<string, {
  name: string;
  displayName: string;
  description: string;
  logo: string;
  authType: 'oauth2' | 'api-key';
  docs: string;
}> = {
  gmail: {
    name: 'gmail',
    displayName: 'Gmail',
    description: 'Send and receive emails via Gmail',
    logo: '/logos/gmail.svg',
    authType: 'oauth2',
    docs: 'https://developers.google.com/gmail/api',
  },
  slack: {
    name: 'slack',
    displayName: 'Slack',
    description: 'Send messages to Slack channels',
    logo: '/logos/slack.svg',
    authType: 'oauth2',
    docs: 'https://api.slack.com/',
  },
  notion: {
    name: 'notion',
    displayName: 'Notion',
    description: 'Create and manage Notion pages',
    logo: '/logos/notion.svg',
    authType: 'oauth2',
    docs: 'https://developers.notion.com/',
  },
  twitter: {
    name: 'twitter',
    displayName: 'Twitter/X',
    description: 'Post tweets and interact with Twitter',
    logo: '/logos/twitter.svg',
    authType: 'oauth2',
    docs: 'https://developer.twitter.com/en/docs',
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    description: 'Manage GitHub issues, PRs, and repos',
    logo: '/logos/github.svg',
    authType: 'oauth2',
    docs: 'https://docs.github.com/en/rest',
  },
};

export async function GET() {
  const integrations = integrationRegistry.getAll().map(integration => ({
    ...integrationDetails[integration.name],
    available: true,
  }));
  
  return NextResponse.json({ integrations });
}
