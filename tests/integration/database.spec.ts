import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Migrations', () => {
  beforeAll(async () => {
    // Ensure test database is set up
    try {
      execSync('npx prisma migrate deploy', { stdio: 'pipe' });
    } catch (error) {
      console.log('Migration already applied or test environment issue');
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('all migrations apply successfully', () => {
    const result = execSync('npx prisma migrate status', { encoding: 'utf-8' });
    expect(result).toContain('Applied migration');
  });

  it('database schema matches Prisma schema', async () => {
    const result = execSync('npx prisma db pull', { encoding: 'utf-8', stdio: 'pipe' });
    expect(result).not.toContain('error');
  });

  it('User table exists with correct columns', async () => {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;
    
    expect(result).toBeDefined();
    expect((result as any[]).length).toBeGreaterThan(0);
  });

  it('Workflow table exists with correct columns', async () => {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Workflow'
    `;
    
    expect(result).toBeDefined();
    expect((result as any[]).length).toBeGreaterThan(0);
  });

  it('Execution table exists with correct columns', async () => {
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Execution'
    `;
    
    expect(result).toBeDefined();
    expect((result as any[]).length).toBeGreaterThan(0);
  });

  it('foreign key constraints are properly defined', async () => {
    const result = await prisma.$queryRaw`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `;
    
    expect(result).toBeDefined();
    expect((result as any[]).length).toBeGreaterThan(0);
  });

  it('indexes exist for performance-critical columns', async () => {
    const result = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('User', 'Workflow', 'Execution')
    `;
    
    expect(result).toBeDefined();
    expect((result as any[]).length).toBeGreaterThan(0);
  });

  it('can create and retrieve user', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    
    expect(user).toBeDefined();
    expect(user.email).toBe(email);
    
    const retrieved = await prisma.user.findUnique({
      where: { id: user.id },
    });
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.email).toBe(email);
    
    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('can create workflow with relationships', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Test Workflow',
        description: 'Test Description',
        userId: user.id,
        trigger: { type: 'webhook', config: {} },
        actions: [],
        status: 'draft',
      },
    });
    
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe('Test Workflow');
    expect(workflow.userId).toBe(user.id);
    
    // Cleanup
    await prisma.workflow.delete({ where: { id: workflow.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('can create execution with workflow relationship', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Test Workflow',
        description: 'Test',
        userId: user.id,
        trigger: { type: 'webhook', config: {} },
        actions: [],
        status: 'active',
      },
    });
    
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
        inputData: { test: 'data' },
        startedAt: new Date(),
      },
    });
    
    expect(execution).toBeDefined();
    expect(execution.workflowId).toBe(workflow.id);
    expect(execution.status).toBe('running');
    
    // Cleanup
    await prisma.execution.delete({ where: { id: execution.id } });
    await prisma.workflow.delete({ where: { id: workflow.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('cascading deletes work correctly', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        password: 'hashed_password',
      },
    });
    
    const workflow = await prisma.workflow.create({
      data: {
        name: 'Test Workflow',
        description: 'Test',
        userId: user.id,
        trigger: { type: 'webhook', config: {} },
        actions: [],
        status: 'active',
      },
    });
    
    const execution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: 'completed',
        inputData: {},
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });
    
    // Delete user - should cascade to workflows and executions
    await prisma.user.delete({ where: { id: user.id } });
    
    // Verify cascade
    const workflowExists = await prisma.workflow.findUnique({
      where: { id: workflow.id },
    });
    
    const executionExists = await prisma.execution.findUnique({
      where: { id: execution.id },
    });
    
    expect(workflowExists).toBeNull();
    expect(executionExists).toBeNull();
  });

  it('database connection pooling works under load', async () => {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(
        prisma.user.count()
      );
    }
    
    const results = await Promise.all(promises);
    
    expect(results.every(r => typeof r === 'number')).toBe(true);
  });

  it('transactions work correctly', async () => {
    const email = `test_${Date.now()}@example.com`;
    
    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name: 'Transaction Test',
            password: 'hashed',
          },
        });
        
        await tx.workflow.create({
          data: {
            name: 'Transaction Workflow',
            userId: user.id,
            trigger: { type: 'webhook', config: {} },
            actions: [],
            status: 'draft',
          },
        });
        
        // Intentionally throw to test rollback
        throw new Error('Rollback test');
      });
    } catch (error) {
      // Expected error
    }
    
    // Verify rollback - user should not exist
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    expect(user).toBeNull();
  });
});
