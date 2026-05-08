export class AIError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIInsufficientQuotaError extends AIError {
  constructor(provider: string, originalError?: unknown) {
    super(`Insufficient quota from ${provider} AI provider`, provider, originalError);
    this.name = 'AIInsufficientQuotaError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(provider: string, originalError?: unknown) {
    super(`Rate limit reached for ${provider} AI provider`, provider, originalError);
    this.name = 'AIRateLimitError';
  }
}

export class AIAuthenticationError extends AIError {
  constructor(provider: string, originalError?: unknown) {
    super(`Authentication failed for ${provider} AI provider`, provider, originalError);
    this.name = 'AIAuthenticationError';
  }
}
