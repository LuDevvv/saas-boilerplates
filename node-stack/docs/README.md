# Node Stack Documentation

Welcome to the definitive documentation for the Node.js SaaS Backend Boilerplate. This directory contains detailed architectural, technical, and operational documentation.

## Core Documentation

*   **[Architecture Whitepaper](whitepaper.md)**: Executive summary of architectural decisions, data model, operational practices, and migration strategies.
*   **[High-Level Architecture](architecture.md)**: Deep dive into the core architectural principles, design patterns (Unit of Work, Transactional Outbox), and component flows (Multi-tenancy, AI Pipeline).
*   **[Database Layer](database.md)**: Detailed overview of the Drizzle ORM setup, schema definitions, indexing strategies, connection pooling, and migration workflows.
*   **[Security Architecture](security.md)**: Comprehensive guide on authentication (JWT/OAuth), RBAC authorization, input validation (Zod), rate limiting, encryption, and audit logging.
*   **[Docker Infrastructure](docker.md)**: Setup instructions for local development and production deployment using Docker Compose, including environment variable configurations and service definitions.
*   **[Observability](observability.md)**: Instructions on tracing, monitoring, and debugging the application using structured logging (Pino), metrics (Prometheus), and OpenTelemetry.

## API Documentation

The API Reference has been moved directly to code, utilizing Swagger/OpenAPI.
To view the API documentation, run the API locally and navigate to:

```text
http://localhost:3000/api/docs
```
