/**
 * Workflow Failed Email Template
 * React Email component for workflow failure notifications
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Link,
  Button,
} from '@react-email/components';

interface WorkflowFailedEmailProps {
  workflowName?: string;
  workflowId?: string;
  userName?: string;
  errorMessage?: string;
  failedAt?: string;
  dashboardUrl?: string;
  troubleshootingUrl?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

const defaultTroubleshootingTips = [
  'Check your API keys and credentials in the workflow settings',
  'Verify that all connections are properly configured',
  'Review the error message above for specific details',
  'Try running the workflow manually from the dashboard',
  'Contact support if the issue persists',
];

export const WorkflowFailedEmail = ({
  workflowName = 'Your Workflow',
  workflowId = 'unknown',
  userName,
  errorMessage = 'Unknown error occurred',
  failedAt = new Date().toISOString(),
  dashboardUrl = `${baseUrl}/dashboard`,
  troubleshootingUrl = `${baseUrl}/docs/troubleshooting`,
}: WorkflowFailedEmailProps) => {
  const previewText = `Unfortunately, "${workflowName}" encountered an error`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>❌ Workflow Failed</Heading>
          
          <Text style={text}>
            Hi{userName ? ` ${userName}` : ''},
          </Text>
          
          <Text style={text}>
            Unfortunately, your workflow <strong style={strong}>"{workflowName}"</strong> encountered an error.
          </Text>
          
          <Section style={errorBox}>
            <Heading style={h2}>Error Details</Heading>
            
            <Section style={errorBlock}>
              <Text style={errorText}>{errorMessage}</Text>
            </Section>
            
            <Text style={infoText}>
              <strong>Workflow ID:</strong> {workflowId}<br />
              <strong>Failed at:</strong> {new Date(failedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
            </Text>
          </Section>
          
          <Section style={tipsBox}>
            <Heading style={h3}>💡 Troubleshooting Tips</Heading>
            <ul style={list}>
              {defaultTroubleshootingTips.map((tip, index) => (
                <li key={index} style={listItem}>{tip}</li>
              ))}
            </ul>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Workflow
            </Button>
            <Button style={secondaryButton} href={troubleshootingUrl}>
              Troubleshooting Guide
            </Button>
          </Section>
          
          <Text style={footer}>
            — The HarshAI Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WorkflowFailedEmail;

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px 32px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  maxWidth: '600px',
};

const h1 = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 24px 0',
};

const h2 = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 12px 0',
};

const h3 = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 16px 0',
};

const text = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
};

const strong = {
  color: '#1f2937',
  fontWeight: '600',
};

const errorBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const errorBlock = {
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '4px',
  marginBottom: '16px',
};

const errorText = {
  fontFamily: "'Courier New', monospace",
  fontSize: '13px',
  color: '#dc2626',
  margin: '0',
  wordBreak: 'break-word' as const,
};

const infoText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const tipsBox = {
  backgroundColor: '#f9fafb',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const list = {
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#4b5563',
  marginBottom: '4px',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  flexWrap: 'wrap' as const,
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const secondaryButton = {
  backgroundColor: '#6b7280',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  margin: '24px 0 0 0',
};
