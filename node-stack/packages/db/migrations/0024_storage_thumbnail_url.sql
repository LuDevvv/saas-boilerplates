-- Add thumbnail_url column to files table
-- Stores the CDN/public URL of a server-generated WebP thumbnail (max 400 px wide).
-- NULL for non-image files or files uploaded before this migration.

ALTER TABLE "files" ADD COLUMN "thumbnail_url" text;
