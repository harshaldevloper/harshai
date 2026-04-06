import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getWebhookAnalytics(workflowId: string, days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const logs = await prisma.webhookLog.findMany({
    where: {
      workflowId,
      receivedAt: { gte: startDate },
    },
    include: {
      deliveries: {
        select: {
          status: true,
          httpStatus: true,
          responseTime: true,
          attemptNumber: true,
          createdAt: true,
        },
      },
    },
    orderBy: { receivedAt: 'desc' },
  });
  
  const total = logs.length;
  const successful = logs.filter(l => l.status === 'completed').length;
  const failed = logs.filter(l => l.status === 'failed').length;
  const successRate = total > 0 ? (successful / total) * 100 : 0;
  
  const allResponseTimes = logs.flatMap(l => 
    l.deliveries.map(d => d.responseTime).filter((t): t is number => t !== null)
  );
  
  const avgExecutionTime = allResponseTimes.length > 0
    ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
    : 0;
  
  const withRetries = logs.filter(l => l.retryCount > 0).length;
  const retryRate = total > 0 ? (withRetries / total) * 100 : 0;
  
  // Calculate health score
  const deliveryScore = Math.min(successRate, 100) * 0.4;
  const timeScore = avgExecutionTime < 100 ? 30 : avgExecutionTime < 500 ? 20 : avgExecutionTime < 1000 ? 10 : 0;
  const retryScore = (100 - Math.min(retryRate, 100)) * 0.2;
  const errorScore = (100 - Math.min((failed / total) * 100, 100)) * 0.1;
  const healthScore = Math.round(deliveryScore + timeScore + retryScore + errorScore);
  
  return {
    total,
    successful,
    failed,
    successRate: Math.round(successRate * 100) / 100,
    avgExecutionTime: Math.round(avgExecutionTime),
    retryRate: Math.round(retryRate * 100) / 100,
    healthScore,
    logs,
  };
}
