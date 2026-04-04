export class AIError extends Error {
  constructor(message: string, public readonly provider: string, public readonly originalError?: any) {
    super(message);
    this.name = 'AIError';
  }
}

export class AIInsufficientQuotaError extends AIError {
  constructor(provider: string, originalError?: any) {
    super(`Insufficient quota from ${provider} AI provider`, provider, originalError);
    this.name = 'AIInsufficientQuotaError';
  }
}

export class AIRateLimitError extends AIError {
  constructor(provider: string, originalError?: any) {
    super(`Rate limit reached for ${provider} AI provider`, provider, originalError);
    this.name = 'AIRateLimitError';
  }
}

export class AIAuthenticationError extends AIError {
  constructor(provider: string, originalError?: any) {
    super(`Authentication failed for ${provider} AI provider`, provider, originalError);
    this.name = 'AIAuthenticationError';
  }
}
