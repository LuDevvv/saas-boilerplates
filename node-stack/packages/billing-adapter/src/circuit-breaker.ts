type AnyArgs = readonly unknown[];

export class CircuitBreaker<TArgs extends AnyArgs = AnyArgs, TResult = unknown> {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private action: (...args: TArgs) => Promise<TResult>,
    private options: {
      failureThreshold: number;
      recoveryTimeout: number;
    },
  ) {}

  async execute(...args: TArgs): Promise<TResult> {
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

  private reset(): void {
    this.failureCount = 0;
    this.state = "closed";
  }
}
