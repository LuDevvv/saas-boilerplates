# ADR 0007 — File Storage Strategy

**Status:** Accepted  
**Date:** 2026-05-09

## Context

The platform needs file upload/download capabilities for user avatars, workspace assets, and user-generated content. Requirements:
- Files must not pass through the API server (bandwidth and memory concerns)
- Content must be validated before it's considered "confirmed"
- Files must be scoped to workspaces (no cross-tenant access)
- Large files (up to configurable limit) must be supported

## Decision

### Presigned URL flow (S3-direct upload)

```
Client → POST /storage/presign → API → S3 (presigned PUT URL)
Client → PUT  {presigned URL} → S3 directly (bypasses API)
Client → POST /storage/confirm → API validates → marks file active
```

Benefits:
- API server never handles file bytes
- S3 handles bandwidth, chunking, and retry
- Files are invisible to other clients until confirmed

### Magic-byte validation (Phase 4d)

On confirmation, the API fetches the first 4096 bytes from S3 and validates:
1. Binary files: `file-type@22` detects the actual MIME from magic bytes
2. Text files (csv/plain/json): printable-byte scan (file-type doesn't detect these)

If the detected MIME doesn't match the declared MIME, the file is:
1. Marked as `status: "failed"` in the DB
2. Deleted from S3 (best-effort)
3. An audit row `storage.upload_rejected` is written

This prevents MIME-type spoofing (uploading a PHP webshell with `.png` extension).

### File metadata

Files are stored in the `files` table (RLS-protected by workspace):
```
id, workspaceId, userId, filename, mimeType, size, s3Key, status, createdAt
```

Status lifecycle: `pending → active | failed`

### Path structure in S3

```
{workspaceId}/{year}/{month}/{uuid}.{ext}
```

### Access control

Presigned download URLs expire after 1 hour. No public files by default.
Workspace-scoped access is enforced at the API level before generating download URLs.

## Consequences

- Clients must implement a two-step flow (presign → upload → confirm).
- The 4096-byte magic-byte probe adds a small latency on confirmation.
- Files in `pending` state for > 24h should be cleaned up by a maintenance job.
