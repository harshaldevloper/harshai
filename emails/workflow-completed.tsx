/**
 * Workflow Completed Email Template
 * React Email component for successful workflow completion notifications
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

interface WorkflowCompletedEmailProps {
  workflowName?: string;
  workflowId?: string;
  userName?: string;
  executionTime?: number; // in milliseconds
  stepsExecuted?: number;
  completedAt?: string;
  dashboardUrl?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const WorkflowCompletedEmail = ({
  workflowName = 'Your Workflow',
  workflowId = 'unknown',
  userName,
  executionTime,
  stepsExecuted,
  completedAt = new Date().toISOString(),
  dashboardUrl = `${baseUrl}/dashboard`,
}: WorkflowCompletedEmailProps) => {
  const previewText = `Great news! "${workflowName}" completed successfully`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✅ Workflow Completed</Heading>
          
          <Text style={text}>
            Hi{userName ? ` ${userName}` : ''},
          </Text>
          
          <Text style={text}>
            Great news! Your workflow <strong style={strong}>"{workflowName}"</strong> has completed successfully.
          </Text>
          
          <Section style={successBox}>
            <Heading style={h2}>Execution Summary</Heading>
            
            <Text style={paragraph}>
              <strong>Execution Time:</strong> {executionTime ? (executionTime / 1000).toFixed(2) + 's' : '-'}
            </Text>
            {stepsExecuted && (
              <Text style={paragraph}>
                <strong>Steps Executed:</strong> {stepsExecuted}
              </Text>
            )}
            <Text style={paragraph}>
              <strong>Workflow ID:</strong> {workflowId}
            </Text>
            <Text style={paragraph}>
              <strong>Completed at:</strong> {new Date(completedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} IST
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              View Results
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

export default WorkflowCompletedEmail;

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
  color: '#059669',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0 0 24px 0',
};

const h2 = {
  color: '#166534',
  fontSize: '18px',
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

const successBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  padding: '20px',
  margin: '24px 0',
  borderRadius: '8px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 8px 0',
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
  backgroundColor: '#059669',
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
