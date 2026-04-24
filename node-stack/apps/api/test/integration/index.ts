/**
 * Integration Test Index
 * 
 * Integration tests use real PostgreSQL and Redis via testcontainers
 * to verify end-to-end behavior including:
 * - RLS (Row-Level Security) tenant isolation
 * - Transaction atomicity and rollback
 * - Outbox pattern reliability
 * - HTTP API flows with real NestJS application
 * 
 * Test Structure:
 * - auth.spec.ts - Authentication and session flows
 * - workspaces.spec.ts - Workspace CRUD and basic operations
 * - multi-tenancy.spec.ts - RLS verification for cross-tenant isolation
 * - transactions.spec.ts - Transaction rollback and outbox pattern tests
 */

export * from './helpers/index.js';
export * from './setup.integration.js';