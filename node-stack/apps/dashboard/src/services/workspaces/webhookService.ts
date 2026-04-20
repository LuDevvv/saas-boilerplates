export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  enabled: boolean;
  eventTypes: string[];
  workspaceId: string;
  createdAt: string;
}

const STORAGE_KEY = 'dash_webhooks';

class WebhookService {
  private getStorage(): WebhookEndpoint[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveStorage(data: WebhookEndpoint[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async getWebhooks(workspaceId: string): Promise<WebhookEndpoint[]> {
    const all = this.getStorage();
    return all.filter(w => w.workspaceId === workspaceId);
  }

  async createWebhook(workspaceId: string, url: string, eventTypes: string[]): Promise<WebhookEndpoint> {
    const all = this.getStorage();
    const newWebhook: WebhookEndpoint = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      secret: "whsec_" + Math.random().toString(36).substr(2, 32),
      enabled: true,
      eventTypes,
      workspaceId,
      createdAt: new Date().toISOString()
    };
    this.saveStorage([newWebhook, ...all]);
    return newWebhook;
  }

  async updateWebhook(id: string, updates: Partial<WebhookEndpoint>): Promise<WebhookEndpoint> {
    const all = this.getStorage();
    const updated = all.map(w => w.id === id ? { ...w, ...updates } : w);
    this.saveStorage(updated);
    const result = updated.find(w => w.id === id);
    if (!result) throw new Error("Webhook not found");
    return result;
  }

  async deleteWebhook(id: string): Promise<void> {
    const all = this.getStorage();
    this.saveStorage(all.filter(w => w.id !== id));
  }
}

export const webhookService = new WebhookService();
