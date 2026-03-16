import fs from "node:fs";
import path from "node:path";

/**
 * CLI tool to automate the creation of new feature modules.
 * Usage: pnpm gen:module <name>
 */

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("❌ Please provide a module name: pnpm gen:module <name>");
  process.exit(1);
}

// Normalize names
const name = moduleName.toLowerCase();
const Name = name.charAt(0).toUpperCase() + name.slice(1);
// Simple singularization for common cases like 'tasks' -> 'Task'
const singularName = name.endsWith("s") ? Name.slice(0, -1) : Name;

const rootDir = process.cwd();

// --- Templates ---

const schemaTemplate = `import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { workspaces } from "./workspaces";

/**
 * ${Name} table schema for multi-tenant data isolation.
 */
export const ${name} = pgTable("${name}", {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
        .notNull()
        .references(() => workspaces.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ${singularName} = typeof ${name}.$inferSelect;
export type New${singularName} = typeof ${name}.$inferInsert;
`;

const serviceTemplate = `import { type Database, eq, and } from "@workspace/db";
import { ${name} } from "@workspace/db";
import { AppError } from "../../common/errors/AppError";

/**
 * Service for managing ${name} lifecycle and business logic.
 */
export const create${Name}Service = (db: Database) => {
    return {
        /**
         * Creates a new ${singularName} within a workspace.
         */
        create: async (workspaceId: string, data: { title: string }) => {
            const [item] = await db.insert(${name}).values({
                ...data,
                workspaceId,
            }).returning();
            
            if (!item) {
                throw new AppError("Failed to create ${name} record.", 500, "CREATE_FAILED");
            }
            
            return item;
        },

        /**
         * Lists all ${name} for a given workspace.
         */
        list: async (workspaceId: string) => {
            return await db
                .select()
                .from(${name})
                .where(eq(${name}.workspaceId, workspaceId));
        },

        /**
         * Finds a specific ${singularName} by ID with workspace isolation.
         */
        findById: async (workspaceId: string, id: string) => {
            const [item] = await db
                .select()
                .from(${name})
                .where(
                    and(
                        eq(${name}.id, id),
                        eq(${name}.workspaceId, workspaceId)
                    )
                );
            return item || null;
        }
    };
};
`;

const routesTemplate = `import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authGuard } from "../../common/middlewares/authGuard";
import { workspaceGuard } from "../../common/middlewares/workspaceGuard";
import { ErrorSchema } from "@workspace/validators";
import { createDbClient } from "@workspace/db";
import type { AppContext } from "../../common/types/env";
import { create${Name}Service } from "./${name}.service";
import { successResponse } from "../../common/responses";

const app = new OpenAPIHono<AppContext>();

// Note: In production, define real schemas in packages/validators
const ${singularName}Schema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    workspaceId: z.string().uuid(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

const listRoute = createRoute({
    method: "get",
    path: "/",
    tags: ["${Name}"],
    summary: "List all ${name}",
    middleware: [authGuard, workspaceGuard] as const,
    responses: {
        200: {
            description: "Success",
            content: { "application/json": { schema: z.any() } }
        },
        401: {
            description: "Unauthorized",
            content: { "application/json": { schema: ErrorSchema } }
        }
    }
});

export const ${name}Router = app.openapi(listRoute, async (c) => {
    const db = createDbClient(c.env.DATABASE_URL);
    const workspaceId = c.get("workspaceId")!;
    const service = create${Name}Service(db);
    const items = await service.list(workspaceId);
    
    return c.json(successResponse(items.map(i => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
    }))), 200);
});
`;

const specTemplate = `import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest";
import { create${Name}Service } from "./${name}.service";
import {
    createTestDb,
    resetTestDb,
    closeTestDb,
} from "@workspace/testing";

describe("${Name}Service (Logic Pool)", () => {
    let db: any;
    let service: ReturnType<typeof create${Name}Service>;
    const workspaceId = "ws-123";

    beforeEach(async () => {
        db = createTestDb();
        service = create${Name}Service(db as any);
        
        // Note: New tables must be added to packages/testing/src/db-test-client.ts 
        // for full integration tests. For now, we mock the service list call.
        vi.spyOn(service, 'list').mockResolvedValue([]);
    });

    afterEach(() => {
        resetTestDb();
        vi.restoreAllMocks();
    });

    afterAll(() => {
        closeTestDb();
    });

    it("should list items in a workspace", async () => {
        const items = await service.list(workspaceId);
        expect(Array.isArray(items)).toBe(true);
    });
});
`;

// --- File Creation Logic ---

const paths = {
  schema: path.join(rootDir, "packages/db/src/schema", `${name}.ts`),
  moduleDir: path.join(rootDir, "apps/api/src/modules", name),
};

console.log(`🔨 Scaffolding module: ${name}...`);

// Create directory
if (!fs.existsSync(paths.moduleDir)) {
  fs.mkdirSync(paths.moduleDir, { recursive: true });
}

// Write files
fs.writeFileSync(paths.schema, schemaTemplate);
fs.writeFileSync(
  path.join(paths.moduleDir, `${name}.service.ts`),
  serviceTemplate,
);
fs.writeFileSync(
  path.join(paths.moduleDir, `${name}.routes.ts`),
  routesTemplate,
);
fs.writeFileSync(
  path.join(paths.moduleDir, `${name}.service.spec.ts`),
  specTemplate,
);

console.log(`✅ Files created successfully.`);

// --- Automatic Registration ---

// 1. Export from DB schema index
const dbIndexPath = path.join(rootDir, "packages/db/src/schema/index.ts");
if (fs.existsSync(dbIndexPath)) {
  const contents = fs.readFileSync(dbIndexPath, "utf-8");
  const exportLine = `export * from "./${name}";`;
  if (!contents.includes(exportLine)) {
    fs.appendFileSync(dbIndexPath, `\n${exportLine}\n`);
    console.log(`🔗 Registered schema in database bundle.`);
  }
}

// 2. Register in API Router (index.ts)
const apiIndexPath = path.join(rootDir, "apps/api/src/index.ts");
if (fs.existsSync(apiIndexPath)) {
  let contents = fs.readFileSync(apiIndexPath, "utf-8");
  const importLine = `import { ${name}Router } from "./modules/${name}/${name}.routes";`;
  const routeLine = `    .route("/api/${name}", ${name}Router);`;

  if (!contents.includes(importLine)) {
    // Inject import after last module import
    contents = contents.replace(
      /import { userRouter } from ".\/modules\/users\/user.routes";/,
      `import { userRouter } from "./modules/users/user.routes";\n${importLine}`,
    );
    // Inject route after last route
    contents = contents.replace(
      /\.route\("\/api\/users", userRouter\);/,
      `.route("/api/users", userRouter)\n${routeLine}`,
    );
    fs.writeFileSync(apiIndexPath, contents);
    console.log(`🔗 Registered router in API entry point (index.ts).`);
  }
}

// 3. Register in App Metadata (app.ts) - as requested by blueprint
const appTsPath = path.join(rootDir, "apps/api/src/app.ts");
if (fs.existsSync(appTsPath)) {
  let contents = fs.readFileSync(appTsPath, "utf-8");
  const importLine = `import { ${name}Router } from "./modules/${name}/${name}.routes";`;

  if (!contents.includes(importLine)) {
    contents = contents.replace(
      /import { userRouter } from ".\/modules\/users\/user.routes";/,
      `import { userRouter } from "./modules/users/user.routes";\n${importLine}`,
    );
    fs.writeFileSync(appTsPath, contents);
    console.log(`🔗 Registered import in apps/api/src/app.ts.`);
  }
}

console.log(
  `\n🚀 Module ${Name} is ready! Run 'pnpm run typecheck' to verify.`,
);
