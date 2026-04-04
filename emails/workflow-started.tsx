/**
 * Workflow Started Email Template
 * React Email component for workflow start notifications
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

interface WorkflowStartedEmailProps {
  workflowName?: string;
  workflowId?: string;
  userName?: string;
  startedAt?: string;
  dashboardUrl?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const WorkflowStartedEmail = ({
  workflowName = 'Your Workflow',
  workflowId = 'unknown',
  userName,
  startedAt = new Date().toISOString(),
  dashboardUrl = `${baseUrl}/dashboard`,
}: WorkflowStartedEmailProps) => {
  const previewText = `Your workflow "${workflowName}" has started running`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🚀 Workflow Started</Heading>
          
          <Text style={text}>
            Hi{userName ? ` ${userName}` : ''},
          </Text>
          
          <Text style={text}>
            Your workflow <strong style={strong}>"{workflowName}"</strong> has started running.
          </Text>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Workflow ID:</strong> {workflowId}<br />
              <strong>Started at:</strong> {new Date(startedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
            </Text>
          </Section>
          
          <Text style={text}>
            We'll send you another email when the workflow completes.
          </Text>
          
          <Hr style={hr} />
          
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Dashboard
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

export default WorkflowStartedEmail;

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
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 24px 0',
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

const infoBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #3b82f6',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
};

const infoText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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
