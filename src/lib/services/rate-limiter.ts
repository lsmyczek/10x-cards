export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimiterOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  public async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove expired timestamps
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  public getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;

    const now = Date.now();
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }

  public getRemainingRequests(): number {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }
}
