/**
 * Integration Registry
 * Central registry for all available integrations
 */

import { IIntegration, BaseIntegration } from './base';
import { GmailIntegration } from './gmail';
import { SlackIntegration } from './slack';

class IntegrationRegistry {
  private integrations: Map<string, IIntegration> = new Map();

  constructor() {
    // Register built-in integrations
    this.register(new GmailIntegration());
    this.register(new SlackIntegration());
  }

  /**
   * Register an integration
   */
  register(integration: IIntegration): void {
    this.integrations.set(integration.name.toLowerCase(), integration);
  }

  /**
   * Get integration by name
   */
  getIntegration(name: string): IIntegration | undefined {
    return this.integrations.get(name.toLowerCase());
  }

  /**
   * List all available integrations
   */
  listIntegrations(): string[] {
    return Array.from(this.integrations.keys());
  }

  /**
   * Get all integration instances
   */
  getAll(): IIntegration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Check if integration exists
   */
  hasIntegration(name: string): boolean {
    return this.integrations.has(name.toLowerCase());
  }
}

// Export singleton instance
export const integrationRegistry = new IntegrationRegistry();

// Export for custom registrations
export { IntegrationRegistry };
