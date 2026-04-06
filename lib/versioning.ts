/**
 * Workflow Versioning - Day 39
 * Version control for workflows
 */

import { prisma } from './prisma';
import { diffNodes, diffEdges, generateDiffSummary } from './diff-engine';

export interface CreateVersionInput {
  workflowId: string;
  authorId: string;
  nodes: any;
  edges: any;
  config?: any;
  changeSummary?: string;
}

export interface VersionHistory {
  versions: any[];
  current: number;
  total: number;
}

/**
 * Create a new workflow version
 */
export async function createVersion(input: CreateVersionInput): Promise<any> {
  const { workflowId, authorId, nodes, edges, config, changeSummary } = input;

  // Get current version number
  const currentVersion = await prisma.workflowVersion.findFirst({
    where: { workflowId, isCurrent: true },
    orderBy: { versionNumber: 'desc' }
  });

  const newVersionNumber = (currentVersion?.versionNumber || 0) + 1;

  // Create new version
  const version = await prisma.workflowVersion.create({
    data: {
      workflowId,
      versionNumber: newVersionNumber,
      nodes,
      edges,
      config: config ? JSON.stringify(config) : null,
      changeSummary,
      authorId,
      isCurrent: true,
      parentVersionId: currentVersion?.id || null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  // Mark previous version as not current
  if (currentVersion) {
    await prisma.workflowVersion.update({
      where: { id: currentVersion.id },
      data: { isCurrent: false }
    });

    // Update workflow version number
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { version: newVersionNumber }
    });
  }

  return version;
}

/**
 * Get version history for workflow
 */
export async function getVersionHistory(workflowId: string): Promise<VersionHistory> {
  const versions = await prisma.workflowVersion.findMany({
    where: { workflowId },
    orderBy: { versionNumber: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          executions: true
        }
      }
    }
  });

  const currentVersion = versions.find(v => v.isCurrent);

  return {
    versions,
    current: currentVersion?.versionNumber || 0,
    total: versions.length
  };
}

/**
 * Get specific version
 */
export async function getVersion(workflowId: string, versionNumber: number): Promise<any> {
  const version = await prisma.workflowVersion.findUnique({
    where: {
      workflowId_versionNumber: {
        workflowId,
        versionNumber
      }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          executions: true
        }
      }
    }
  });

  if (!version) {
    throw new Error('Version not found');
  }

  return version;
}

/**
 * Rollback to previous version
 */
export async function rollbackToVersion(
  workflowId: string,
  versionNumber: number,
  authorId: string
): Promise<any> {
  // Get the version to rollback to
  const targetVersion = await getVersion(workflowId, versionNumber);

  if (!targetVersion) {
    throw new Error('Version not found');
  }

  // Create new version as copy of target version
  const newVersion = await createVersion({
    workflowId,
    authorId,
    nodes: targetVersion.nodes,
    edges: targetVersion.edges,
    config: targetVersion.config,
    changeSummary: `Rolled back to version ${versionNumber}`
  });

  // Update workflow with rolled back nodes/edges
  await prisma.workflow.update({
    where: { id: workflowId },
    data: {
      nodes: targetVersion.nodes,
      edges: targetVersion.edges,
      version: newVersion.versionNumber
    }
  });

  return newVersion;
}

/**
 * Compare two versions
 */
export async function compareVersions(
  workflowId: string,
  fromVersion: number,
  toVersion: number
): Promise<any> {
  const [version1, version2] = await Promise.all([
    getVersion(workflowId, fromVersion),
    getVersion(workflowId, toVersion)
  ]);

  if (!version1 || !version2) {
    throw new Error('One or both versions not found');
  }

  const nodeDiff = diffNodes(version1.nodes, version2.nodes);
  const edgeDiff = diffEdges(version1.edges, version2.edges);

  return {
    fromVersion: {
      number: version1.versionNumber,
      createdAt: version1.createdAt,
      author: version1.author.name || version1.author.email
    },
    toVersion: {
      number: version2.versionNumber,
      createdAt: version2.createdAt,
      author: version2.author.name || version2.author.email
    },
    changes: {
      nodesAdded: nodeDiff.added,
      nodesRemoved: nodeDiff.removed,
      nodesModified: nodeDiff.modified,
      edgesAdded: edgeDiff.added,
      edgesRemoved: edgeDiff.removed,
      edgesModified: edgeDiff.modified
    },
    summary: generateDiffSummary(nodeDiff, edgeDiff)
  };
}

/**
 * Get current version number
 */
export async function getCurrentVersion(workflowId: string): Promise<number> {
  const version = await prisma.workflowVersion.findFirst({
    where: { workflowId, isCurrent: true }
  });

  return version?.versionNumber || 1;
}

/**
 * Delete version (only if not current)
 */
export async function deleteVersion(
  workflowId: string,
  versionNumber: number
): Promise<void> {
  const version = await getVersion(workflowId, versionNumber);

  if (!version) {
    throw new Error('Version not found');
  }

  if (version.isCurrent) {
    throw new Error('Cannot delete current version');
  }

  await prisma.workflowVersion.delete({
    where: {
      workflowId_versionNumber: {
        workflowId,
        versionNumber
      }
    }
  });
}

/**
 * Get version diff with previous version
 */
export async function getVersionDiff(
  workflowId: string,
  versionNumber: number
): Promise<any> {
  const version = await getVersion(workflowId, versionNumber);

  if (!version || !version.parentVersionId) {
    return null;
  }

  const parentVersion = await prisma.workflowVersion.findUnique({
    where: { id: version.parentVersionId }
  });

  if (!parentVersion) {
    return null;
  }

  return compareVersions(workflowId, parentVersion.versionNumber, versionNumber);
}
