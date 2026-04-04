export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private action: (...args: any[]) => Promise<any>,
    private options: {
      failureThreshold: number;
      recoveryTimeout: number;
    },
  ) {}

  async execute(...args: any[]): Promise<any> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime < this.options.recoveryTimeout) {
        throw new Error("Circuit is open. Service unavailable.");
      }
      this.state = "half-open";
    }

    try {
      const result = await this.action(...args);
      this.reset();
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.options.failureThreshold) {
        this.state = "open";
        throw new Error("Circuit is open. Service unavailable.");
      }

      throw error;
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = "closed";
  }
}
