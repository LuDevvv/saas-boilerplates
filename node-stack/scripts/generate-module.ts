import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const program = new Command();

program
  .name("generate-module")
  .description("Scaffold a new module for the node-stack monorepo")
  .argument("<name>", "Name of the module (singular, e.g., ticket)")
  .option("-d, --description <description>", "Description of the module", "A new module")
  .action(async (name, options) => {
    try {
      const moduleName = name.toLowerCase();
      const ModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
      const moduleNamePlural = moduleName.endsWith("s") ? moduleName : `${moduleName}s`;
      const moduleNameCamel = moduleName;
      const moduleDescription = options.description;
      const MODULE_NAME = moduleName.toUpperCase();

      logger.info(`Scaffolding module: ${chalk.bold(moduleName)}`);

      const replacements = {
        "{!!moduleName}": moduleName,
        "{!!ModuleName}": ModuleName,
        "{!!moduleNamePlural}": moduleNamePlural,
        "{!!moduleNameCamel}": moduleNameCamel,
        "{!!moduleDescription}": moduleDescription,
        "{MODULE_NAME}": MODULE_NAME,
      };

      const replaceAll = (content: string) => {
        let result = content;
        for (const [key, value] of Object.entries(replacements)) {
          result = result.split(key).join(value);
        }
        return result;
      };

      // 1. Generate DB Schema
      const schemaPath = path.join(ROOT, "packages/db/src/schema", `${moduleNamePlural}.ts`);
      const schemaTemplate = await fs.readFile(path.join(__dirname, "templates/schema.template.ts"), "utf-8");
      await fs.writeFile(schemaPath, replaceAll(schemaTemplate));
      logger.step(`Created schema: ${schemaPath}`);

      // Register schema in index.ts
      const schemaIndexPath = path.join(ROOT, "packages/db/src/schema/index.ts");
      const schemaIndexContent = await fs.readFile(schemaIndexPath, "utf-8");
      if (!schemaIndexContent.includes(`./${moduleNamePlural}.js`)) {
        await fs.appendFile(schemaIndexPath, `export * from './${moduleNamePlural}.js';\n`);
        logger.step(`Registered schema in index.ts`);
      }

      // 2. Generate Repository
      const repoPath = path.join(ROOT, "packages/db/src/repositories", `${moduleName}.repository.ts`);
      const repoTemplate = await fs.readFile(path.join(__dirname, "templates/repository.template.ts"), "utf-8");
      await fs.writeFile(repoPath, replaceAll(repoTemplate));
      logger.step(`Created repository: ${repoPath}`);

      // Register repository in index.ts
      const repoIndexPath = path.join(ROOT, "packages/db/src/repositories/index.ts");
      const repoIndexContent = await fs.readFile(repoIndexPath, "utf-8");
      if (!repoIndexContent.includes(`./${moduleName}.repository.js`)) {
        await fs.appendFile(repoIndexPath, `export * from "./${moduleName}.repository.js";\n`);
        logger.step(`Registered repository in index.ts`);
      }

      // 3. Generate Validators/DTOs
      const validatorPath = path.join(ROOT, "packages/validators/src", `${moduleNamePlural}.ts`);
      const validatorTemplate = await fs.readFile(path.join(__dirname, "templates/validator.template.ts"), "utf-8");
      await fs.writeFile(validatorPath, replaceAll(validatorTemplate));
      logger.step(`Created validators: ${validatorPath}`);

      // Register validator in index.ts
      const validatorIndexPath = path.join(ROOT, "packages/validators/src/index.ts");
      const validatorIndexContent = await fs.readFile(validatorIndexPath, "utf-8");
      if (!validatorIndexContent.includes(`./${moduleNamePlural}.js`)) {
        await fs.appendFile(validatorIndexPath, `export * from './${moduleNamePlural}.js';\n`);
        logger.step(`Registered validators in index.ts`);
      }

      // 4. Generate API Module (Controller + Service)
      const apiModuleDir = path.join(ROOT, "apps/api/src", moduleNamePlural);
      await fs.ensureDir(apiModuleDir);

      const controllerPath = path.join(apiModuleDir, `${moduleNamePlural}.controller.ts`);
      const controllerTemplate = await fs.readFile(path.join(__dirname, "templates/controller.template.ts"), "utf-8");
      await fs.writeFile(controllerPath, replaceAll(controllerTemplate));
      logger.step(`Created controller: ${controllerPath}`);

      const servicePath = path.join(apiModuleDir, `${moduleNamePlural}.service.ts`);
      const serviceTemplate = await fs.readFile(path.join(__dirname, "templates/service.template.ts"), "utf-8");
      await fs.writeFile(servicePath, replaceAll(serviceTemplate));
      logger.step(`Created service: ${servicePath}`);

      // Create NestJS Module file
      const moduleFilePath = path.join(apiModuleDir, `${moduleNamePlural}.module.ts`);
      const moduleContent = `import { Module } from "@nestjs/common";
import { ${ModuleName}Controller } from "./${moduleNamePlural}.controller.js";
import { ${ModuleName}Service } from "./${moduleNamePlural}.service.js";
import { ${ModuleName}Repository } from "@node-stack/db";

@Module({
  controllers: [${ModuleName}Controller],
  providers: [${ModuleName}Service, ${ModuleName}Repository],
  exports: [${ModuleName}Service],
})
export class ${ModuleName}Module {}
`;
      await fs.writeFile(moduleFilePath, moduleContent);
      logger.step(`Created NestJS module: ${moduleFilePath}`);

      logger.success(`Module ${moduleName} scaffolded successfully!`);
      logger.info(`Don't forget to import ${ModuleName}Module in apps/api/src/app.module.ts`);

    } catch (err) {
      logger.error("Failed to generate module", err);
      process.exit(1);
    }
  });

program.parse();
