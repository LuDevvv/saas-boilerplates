/**
 * Zod to TypeScript Type Generator
 * 
 * Utility to extract TypeScript types from Zod schemas.
 * Keeps packages/types in sync with packages/validators.
 * 
 * Usage:
 *   pnpm zod:types
 *   pnpm zod:types --watch
 */

import { readFileSync, writeFileSync, existsSync, watchFile, unwatchFile } from "fs";
import { join, dirname, basename, relative } from "path";
import { parseArgs } from "util";
import ts from "typescript";

// ============================================
// Zod Schema Parser
// ============================================

interface ParsedSchema {
  name: string;
  type: string;
  optional: boolean;
  nullable: boolean;
  default?: string;
  description?: string;
}

interface SchemaInfo {
  name: string;
  schemas: ParsedSchema[];
  exports: string[];
}

/**
 * Parse a Zod schema file and extract type information
 */
function parseZodFile(filePath: string): SchemaInfo {
  const content = readFileSync(filePath, "utf-8");
  const fileName = basename(filePath, ".ts");
  
  const schemas: ParsedSchema[] = [];
  const exports: string[] = [];

  // Find all exported schemas
  const exportMatches = content.matchAll(/export\s+(?:const|let|var)\s+(\w+)\s*=/g);
  for (const match of exportMatches) {
    exports.push(match[1]);
  }

  // Parse schema definitions
  const schemaMatches = content.matchAll(
    /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*z\.\w+(?:<[^>]+>)?\(\{?\s*([^}]*)\}?\)/g
  );

  for (const match of schemaMatches) {
    const [, name, body] = match;
    
    // Extract field definitions
    const fieldMatches = body.matchAll(
      /(\w+):\s*z\.\w+(?:<[^>]+>)?\([^)]*\)(?:\s*\.optional\(\))?(?:\s*\.nullable\(\))?(?:\s*\.describe\([^)]*\))?(?:\s*\.default\([^)]*\))?/g
    );

    const fields: ParsedSchema[] = [];
    for (const field of fieldMatches) {
      const fieldName = field[1];
      const fieldDef = field[0];
      
      schemas.push({
        name: fieldName,
        type: inferType(fieldDef),
        optional: fieldDef.includes(".optional()"),
        nullable: fieldDef.includes(".nullable()"),
        default: extractDefault(fieldDef),
        description: extractDescription(fieldDef),
      });
    }
  }

  return { name: fileName, schemas, exports };
}

/**
 * Infer TypeScript type from Zod chain
 */
function inferType(zodChain: string): string {
  if (zodChain.includes("z.string")) return "string";
  if (zodChain.includes("z.number")) return "number";
  if (zodChain.includes("z.boolean")) return "boolean";
  if (zodChain.includes("z.bigint")) return "bigint";
  if (zodChain.includes("z.date")) return "Date";
  if (zodChain.includes("z.enum")) return "enum";
  if (zodChain.includes("z.array")) return "array";
  if (zodChain.includes("z.record")) return "Record<string, any>";
  if (zodChain.includes("z.object")) return "object";
  if (zodChain.includes("z.passthrough")) return "object";
  if (zodChain.includes("uuid")) return "string";
  if (zodChain.includes("cuid")) return "string";
  if (zodChain.includes("email")) return "string";
  if (zodChain.includes(".min(") && zodChain.includes("z.string")) return "string";
  if (zodChain.includes(".min(") && !zodChain.includes("z.string")) return "number";
  if (zodChain.includes("Coerce")) return "number | string";
  return "unknown";
}

function extractDefault(zodChain: string): string | undefined {
  const match = zodChain.match(/\.default\(([^)]+)\)/);
  return match ? match[1] : undefined;
}

function extractDescription(zodChain: string): string | undefined {
  const match = zodChain.match(/\.describe\(['"]([^'"]+)['"]\)/);
  return match ? match[1] : undefined;
}

// ============================================
// TypeScript Type Generator
// ============================================

/**
 * Generate TypeScript interface from parsed Zod schema
 */
function generateTypeScriptInterface(schema: SchemaInfo): string {
  const lines: string[] = [];
  
  lines.push(`// Auto-generated from ${schema.name}.ts`);
  lines.push(`// DO NOT EDIT - Changes should be made in the Zod schema`);
  lines.push();
  lines.push("/**");

  for (const field of schema.schemas) {
    const nullable = field.nullable ? " | null" : "";
    const optional = field.optional ? "?" : "";
    const typeStr = `${field.type}${nullable}${optional}`;
    
    lines.push(` * @property ${field.name} - ${typeStr}${field.description ? ` - ${field.description}` : ""}`);
  }
  
  lines.push(" */");

  for (const exportName of schema.exports) {
    const schemaData = schema.schemas.length > 0 ? schema.schemas : [];
    
    lines.push(`export interface ${exportName} {`);
    for (const field of schemaData) {
      const optional = field.optional ? "?" : "";
      const nullable = field.nullable ? " | null" : "";
      const comment = field.description ? ` // ${field.description}` : "";
      lines.push(`  ${field.name}${optional}: ${field.type}${nullable};${comment}`);
    }
    lines.push("}");
    lines.push();
  }

  return lines.join("\n");
}

// ============================================
// Main Generation Logic
// ============================================

interface GenerateOptions {
  watch: boolean;
  output: string | null;
  clean: boolean;
}

function parseGenArgs(): GenerateOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      watch: { type: "boolean", default: false },
      output: { type: "string", default: null },
      clean: { type: "boolean", default: false },
    },
  });

  return {
    watch: values.watch,
    output: values.output,
    clean: values.clean,
  };
}

function findValidatorFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = existsSync(dir) ? require("fs").readdirSync(dir) : [];
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = require("fs").statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findValidatorFiles(fullPath));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function generateTypes(options: GenerateOptions): Promise<void> {
  const root = findMonorepoRoot();
  const validatorsDir = join(root, "packages/validators/src");
  const outputDir = options.output ?? join(root, "packages/types/src/generated");
  
  console.log("🔄 Zod to TypeScript Type Generator\n");
  console.log(`Input: ${validatorsDir}`);
  console.log(`Output: ${outputDir}`);

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    require("fs").mkdirSync(outputDir, { recursive: true });
  }

  // Clean output directory if requested
  if (options.clean) {
    console.log("\n🧹 Cleaning output directory...");
    const files = require("fs").readdirSync(outputDir);
    for (const file of files) {
      require("fs").unlinkSync(join(outputDir, file));
    }
    console.log("✓ Output cleaned");
  }

  // Find and parse all validator files
  const validatorFiles = findValidatorFiles(validatorsDir);
  console.log(`\nFound ${validatorFiles.length} validator files`);

  const allTypes: string[] = [];
  allTypes.push("// @ts-nocheck");
  allTypes.push("// Auto-generated file - DO NOT EDIT");
  allTypes.push(`// Generated at: ${new Date().toISOString()}`);
  allTypes.push();

  for (const file of validatorFiles) {
    const relPath = relative(validatorsDir, file);
    console.log(`📄 Processing: ${relPath}`);

    try {
      const parsed = parseZodFile(file);
      const types = generateTypeScriptInterface(parsed);
      allTypes.push(types);
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${relPath}: ${error.message}`);
    }
  }

  // Write output
  const outputFile = join(outputDir, "from-validators.ts");
  writeFileSync(outputFile, allTypes.join("\n"), "utf-8");
  console.log(`\n✅ Generated: ${outputFile}`);

  // Setup watch mode
  if (options.watch) {
    console.log("\n👀 Watching for changes (Ctrl+C to stop)...");
    
    for (const file of validatorFiles) {
      watchFile(file, () => {
        console.log(`\n📝 Detected change in ${basename(file)}`);
        generateTypes(options).catch(console.error);
      });
    }
  }
}

function findMonorepoRoot(): string {
  let dir = process.cwd();
  const maxDepth = 10;
  let depth = 0;
  
  while (depth < maxDepth) {
    if (existsSync(join(dir, "package.json"))) {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
      if (pkg.workspaces || pkg.packages) {
        return dir;
      }
    }
    dir = join(dir, "..");
    depth++;
  }
  
  return process.cwd();
}

// Main
const options = parseGenArgs();
generateTypes(options).catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});