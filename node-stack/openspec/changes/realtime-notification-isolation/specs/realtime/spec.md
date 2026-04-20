# Realtime Specification

## Purpose
Ensures secure, isolated, and scalable realtime communication via WebSockets (Socket.IO) and internal Redis-based event synchronization.

## Requirements

### Requirement: Cross-Project Redis Isolation
The system MUST isolate all Redis-based communication (WebSockets and Event Bridge) using a configurable prefix. This prevents different projects or environments sharing the same Redis instance from interfering with each other.

#### Scenario: Isolated Socket.IO Instance
- GIVEN two instances of the application (API_A and API_B) sharing the same Redis instance
- AND API_A is configured with `REDIS_PREFIX=app_a`
- AND API_B is configured with `REDIS_PREFIX=app_b`
- WHEN an event is emitted in API_A
- THEN API_B MUST NOT receive this event via the Redis adapter
- AND only connected clients on API_A instances SHALL receive the event

#### Scenario: Missing Redis Prefix
- GIVEN the application is started
- WHEN the `REDIS_PREFIX` is not provided in environment variables
- THEN the system SHOULD default to a stable prefix (e.g. `node_stack_dev`)
- AND log a warning about missing configuration

### Requirement: Tenant-Isolated WebSocket Rooms
The system MUST ensure that users can only join and receive events from rooms associated with their authorized workspaces and their own user ID.

#### Scenario: Authorized Workspace Join
- GIVEN an authenticated user belonging to Workspace_123
- WHEN the user attempts to join room `workspace:123`
- THEN the system MUST allow the join and start delivering events

#### Scenario: Unauthorized Workspace Join Attempt
- GIVEN an authenticated user who is NOT a member of Workspace_456
- WHEN the user attempts to join room `workspace:456`
- THEN the system MUST reject the join request
- AND log a security warning

### Requirement: Multi-Tenant Notification Delivery
The system MUST handle notification delivery to the correct channels (In-App, Realtime) ensuring strict isolation between user and workspace contexts.

#### Scenario: In-App Notification Trigger
- GIVEN an event `ai_job.completed` for User_A in Workspace_B
- WHEN the Notification handler processes the event
- THEN it MUST persist the notification associated with User_A and Workspace_B
- AND it MUST emit a realtime event only to User_A's personal room or Workspace_B's room
