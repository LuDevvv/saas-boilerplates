/**
 * Module Scaffolding CLI
 * 
 * Generate complete module boilerplate across the monorepo.
 * Creates schema, repository, validator, controller, and service files.
 * 
 * Usage:
 *   pnpm gen:module tickets
 *   pnpm gen:module tickets --dry-run
 *   pnpm gen:module tickets --tenant-aware
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync, statSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { parseArgs } from "util";

// Local imports
const { logger } = await import("./logger.js") as any;

// ============================================
// CLI Arguments Parsing
// ============================================

interface GenerateOptions {
  moduleName: string;
  dryRun: boolean;
  tenantAware: boolean;
  force: boolean;
  list: boolean;
}

function parseArguments(): GenerateOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "dry-run": { type: "boolean", default: false },
      "tenant-aware": { type: "boolean", default: true },
      force: { type: "boolean", default: false },
      list: { type: "boolean", default: false },
    },
    allowPositionals: true,
  });

  const positionalArgs = values._ ?? [];
  
  return {
    moduleName: positionalArgs[0] ?? "",
    dryRun: values["dry-run"],
    tenantAware: values["tenant-aware"],
    force: values.force,
    list: values.list,
  };
}

// ============================================
// Template Engine
// ============================================

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str.replace(/[- ]/g, "_").toLowerCase();
}

function toPlural(str: string): string {
  if (str.endsWith("y")) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("z") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

interface TemplateVariables {
  moduleName: string;
  ModuleName: string;
  moduleNameCamel: string;
  moduleNamePlural: string;
  ModuleNamePlural: string;
  moduleNameSnake: string;
  moduleDescription: string;
  tenantAware: boolean;
}

function loadTemplate(templateName: string): string {
  const templatePath = join(import.meta.dirname, "templates", `${templateName}.template.ts`);
  if (!existsSync(templatePath)) {
    throw new Error(`Template not found: ${templateName}`);
  }
  return readFileSync(templatePath, "utf-8");
}

function processTemplate(template: string, vars: TemplateVariables): string {
  return template
    .replace(/\{\{moduleName\}\}/g, vars.moduleName)
    .replace(/\{\{ModuleName\}\}/g, vars.ModuleName)
    .replace(/\{\{moduleNameCamel\}\}/g, vars.moduleNameCamel)
    .replace(/\{\{moduleNamePlural\}\}/g, vars.moduleNamePlural)
    .replace(/\{\{ModuleNamePlural\}\}/g, vars.ModuleNamePlural)
    .replace(/\{\{moduleNameSnake\}\}/g, vars.moduleNameSnake)
    .replace(/\{\{moduleDescription\}\}/g, vars.moduleDescription)
    .replace(/\{\{tenantAware\}\}/g, vars.tenantAware ? "yes" : "no");
}

// ============================================
// File Generation
// ============================================

interface GeneratedFile {
  path: string;
  action: "create" | "skip" | "overwrite";
  content?: string;
}

function getOutputPath(templateName: string, vars: TemplateVariables): string {
  const root = findMonorepoRoot();
  
  switch (templateName) {
    case "schema":
      return join(root, "packages/db/src/schema", `${vars.moduleNameSnake}.ts`);
    case "repository":
      return join(root, "packages/db/src/repositories", `${vars.moduleNameSnake}.repository.ts`);
    case "validator":
      return join(root, "packages/validators/src", `${vars.moduleNameSnake}.ts`);
    case "controller":
      return join(root, "apps/api/src", vars.moduleNameSnake, `${vars.moduleNameSnake}.controller.ts`);
    case "service":
      return join(root, "apps/api/src", vars.moduleNameSnake, `${vars.moduleNameSnake}.service.ts`);
    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}

function findMonorepoRoot(): string {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "package.json"))) {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
      if (pkg.workspaces || pkg.packages) {
        return dir;
      }
    }
    dir = dirname(dir);
  }
  throw new Error("Could not find monorepo root");
}

async function generateModule(options: GenerateOptions): Promise<void> {
  if (!options.moduleName) {
    logger.error("Module name is required");
    console.log("\nUsage: pnpm gen:module <name> [options]");
    console.log("\nOptions:");
    console.log("  --dry-run        Show what would be created without creating files");
    console.log("  --no-tenant-aware   Disable tenant isolation (single-tenant module)");
    console.log("  --force          Overwrite existing files");
    console.log("  --list           List available templates");
    process.exit(1);
  }

  // Validate module name
  if (!/^[a-z][a-z0-9-]*$/.test(options.moduleName)) {
    logger.error("Invalid module name. Use lowercase, numbers, and hyphens only.");
    process.exit(1);
  }

  const vars: TemplateVariables = {
    moduleName: options.moduleName,
    ModuleName: toPascalCase(options.moduleName),
    moduleNameCamel: toCamelCase(options.moduleName),
    moduleNamePlural: toPlural(options.moduleName),
    ModuleNamePlural: toPascalCase(toPlural(options.moduleName)),
    moduleNameSnake: toSnakeCase(options.moduleName),
    moduleDescription: `${toPascalCase(options.moduleName)} module`,
    tenantAware: options.tenantAware,
  };

  logger.section(`Generating ${vars.ModuleName} Module`);

  if (options.dryRun) {
    logger.info("DRY RUN - No files will be created");
  }

  const files: GeneratedFile[] = [];
  const templates = ["schema", "repository", "validator", "controller", "service"];

  for (const template of templates) {
    try {
      const templateContent = loadTemplate(template);
      const processedContent = processTemplate(templateContent, vars);
      const outputPath = getOutputPath(template, vars);

      // Check if file exists
      if (existsSync(outputPath) && !options.force) {
        files.push({ path: outputPath, action: "skip" });
        logger.file("skip", outputPath);
        continue;
      }

      files.push({ path: outputPath, action: existsSync(outputPath) ? "overwrite" : "create", content: processedContent });

      if (!options.dryRun) {
        // Ensure directory exists
        const dir = dirname(outputPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        writeFileSync(outputPath, processedContent, "utf-8");
      }

      logger.file(existsSync(outputPath) ? "update" : "create", outputPath);
    } catch (error) {
      logger.error(`Failed to generate ${template}`, error);
      files.push({ path: getOutputPath(template, vars), action: "skip" });
    }
  }

  // Update barrel exports
  if (!options.dryRun) {
    await updateBarrelExports(vars, options.force);
  }

  // Summary
  const created = files.filter(f => f.action === "create").length;
  const updated = files.filter(f => f.action === "overwrite").length;
  const skipped = files.filter(f => f.action === "skip").length;

  console.log();
  logger.success(`Module "${vars.ModuleName}" generated successfully!`);
  console.log(`  Created: ${chalk.green(created)} | Updated: ${chalk.yellow(updated)} | Skipped: ${chalk.gray(skipped)}`);
  console.log();
  logger.info(`Next steps:`);
  console.log(`  1. Review generated files in ${chalk.cyan(vars.moduleNameSnake)}/ folder`);
  console.log(`  2. Add the module to AppModule imports`);
  console.log(`  3. Run ${chalk.cyan("pnpm db:push")} to create the table`);
  console.log(`  4. Run ${chalk.cyan("pnpm test")} to verify`);
}

// ============================================
// Barrel Export Updates
// ============================================

async function updateBarrelExports(vars: TemplateVariables, force: boolean): Promise<void> {
  const root = findMonorepoRoot();

  // Update schema/index.ts
  const schemaIndexPath = join(root, "packages/db/src/schema/index.ts");
  const schemaExport = `export * from './${vars.moduleNameSnake}.js';`;
  
  if (existsSync(schemaIndexPath)) {
    let content = readFileSync(schemaIndexPath, "utf-8");
    if (!content.includes(vars.moduleNameSnake)) {
      content += `\n${schemaExport}\n`;
      writeFileSync(schemaIndexPath, content, "utf-8");
      logger.info(`Updated ${chalk.gray("packages/db/src/schema/index.ts")}`);
    }
  }

  // Update repositories/index.ts
  const repoIndexPath = join(root, "packages/db/src/repositories/index.ts");
  const repoExport = `export * from './${vars.moduleNameSnake}.repository.js';`;

  if (existsSync(repoIndexPath)) {
    let content = readFileSync(repoIndexPath, "utf-8");
    if (!content.includes(`${vars.moduleNameSnake}.repository`)) {
      content += `\n${repoExport}\n`;
      writeFileSync(repoIndexPath, content, "utf-8");
      logger.info(`Updated ${chalk.gray("packages/db/src/repositories/index.ts")}`);
    }
  }

  // Update validators/index.ts
  const validatorIndexPath = join(root, "packages/validators/src/index.ts");
  const validatorExport = `export * from './${vars.moduleNameSnake}.js';`;

  if (existsSync(validatorIndexPath)) {
    let content = readFileSync(validatorIndexPath, "utf-8");
    if (!content.includes(vars.moduleNameSnake)) {
      content += `\n${validatorExport}\n`;
      writeFileSync(validatorIndexPath, content, "utf-8");
      logger.info(`Updated ${chalk.gray("packages/validators/src/index.ts")}`);
    }
  }
}

// ============================================
// Main Entry Point
// ============================================

const options = parseArguments();

if (options.list) {
  console.log("Available templates:");
  console.log("  schema       - Drizzle database schema");
  console.log("  repository   - Repository pattern implementation");
  console.log("  validator    - Zod DTOs with Swagger decorators");
  console.log("  controller  - NestJS Controller with endpoints");
  console.log("  service     - Business logic service layer");
  console.log("\nAll templates are generated together via `pnpm gen:module <name>`");
} else {
  await generateModule(options);
}

// Import chalk for colored output
import chalk from "chalk";