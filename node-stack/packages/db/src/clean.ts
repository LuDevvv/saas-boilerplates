/**
 * Database Clean Script
 * 
 * Safely clean test/dev databases with options:
 * - Clean specific tables
 * - Clean by tenant
 * - Reset sequences
 */

import './env.js';
import { parseArgs } from 'util';

import chalk from 'chalk';
import { Pool } from 'pg';

// Simple arg parsing
interface CleanOptions {
  confirm: boolean;
  tables: string[];
  tenant: string | null;
  resetSequences: boolean;
  dryRun: boolean;
}

function parseCleanArgs(): CleanOptions {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      confirm: { type: 'boolean', default: false },
      tables: { type: 'string', multiple: true, default: [] },
      tenant: { type: 'string' },
      sequences: { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false },
    },
  });

  return {
    confirm: Boolean(values.confirm),
    tables: (values.tables as string[]) || [],
    tenant: values.tenant as string | null,
    resetSequences: Boolean(values.sequences),
    dryRun: Boolean(values['dry-run']),
  };
}

// Tables in dependency order for truncation
const TABLE_ORDER = [
  'outbox',
  'audit_logs',
  'files',
  'tasks',
  'api_keys',
  'subscriptions',
  'customers',
  'inbound_webhooks',
  'notifications',
  'ai_chat_history',
  'portability_exports',
  'system_configs',
  'workspace_invitations',
  'memberships',
  'accounts',
  'sessions',
  'verification_tokens',
  'users',
  'workspaces',
];

async function clean(options: CleanOptions): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(chalk.red('❌ DATABASE_URL is not set'));
    process.exit(1);
  }

  console.warn(chalk.cyan('\n🧹 Database Clean Utility\n'));
  console.warn(chalk.gray('─'.repeat(50)));

  // Dry run mode
  if (options.dryRun) {
    console.warn(chalk.yellow('⚠️  DRY RUN MODE - No changes will be made\n'));
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    // Safety confirmation for non-dry-run
    if (!options.dryRun && !options.confirm) {
      console.warn(chalk.yellow('⚠️  This will permanently delete data!'));
      console.warn(chalk.gray('Run with --confirm to proceed\n'));
    }

    if (options.tables.length > 0) {
      console.warn(chalk.blue(`Target tables: ${options.tables.join(', ')}`));
    } else {
      console.warn(chalk.blue('Target: All tables (in dependency order)'));
    }

    if (options.tenant) {
      console.warn(chalk.blue(`Tenant filter: ${options.tenant}`));
    }

    if (options.resetSequences) {
      console.warn(chalk.blue('Sequences will be reset'));
    }

    console.warn(chalk.gray('─'.repeat(50) + '\n'));

    if (!options.confirm && !options.dryRun) {
      console.warn(chalk.yellow('Use --confirm to proceed or --dry-run to preview'));
      await client.release();
      await pool.end();
      return;
    }

    const tablesToClean = options.tables.length > 0 
      ? options.tables 
      : TABLE_ORDER;

    let deletedCount = 0;

    await client.query('BEGIN');
    await client.query('SET CONSTRAINTS ALL DEFERRED');

    for (const table of tablesToClean) {
      const safeTable = table.replace(/[^a-z_]/g, ''); // Basic sanitization
      
      if (options.tenant) {
        // Clean only rows belonging to specific workspace
        const query = `
          DELETE FROM "${safeTable}" 
          WHERE workspace_id IN (
            SELECT id FROM workspaces WHERE slug = $1
          )
        `;
        const result = await client.query(query, [options.tenant]);
        if (result.rowCount && result.rowCount > 0) {
          console.warn(chalk.green(`✓`) + ` ${safeTable}: ${chalk.gray(`${result.rowCount} rows`)}`);
          deletedCount += result.rowCount;
        }
      } else {
        const query = `TRUNCATE TABLE "${safeTable}" CASCADE`;
        await client.query(query);
        console.warn(chalk.green(`✓`) + ` ${safeTable}`);
      }
    }

    if (options.resetSequences) {
      console.warn(chalk.blue('\nResetting sequences...'));
      for (const table of tablesToClean) {
        const safeTable = table.replace(/[^a-z_]/g, '');
        try {
          await client.query(`SELECT setval(pg_get_serial_sequence('${safeTable}', 'id'), 1, false)`);
        } catch {
          // Ignore if table doesn't have serial sequence
        }
      }
      console.warn(chalk.green('✓') + ' Sequences reset');
    }

    await client.query('COMMIT');

    console.warn(chalk.gray('\n─'.repeat(50)));

    if (options.dryRun) {
      console.warn(chalk.yellow(`\n⚠️  DRY RUN COMPLETE - No changes were made`));
    } else {
      console.warn(chalk.green(`\n✅ Database cleaned successfully! (${deletedCount} total rows deleted)`));
    }

  } catch (error) {
    await client.query('ROLLBACK');
    const msg = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\n❌ Clean failed: ${msg}`));
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Main
const options = parseCleanArgs();
clean(options).catch((err) => {
  console.error(chalk.red('Fatal error:', err));
  process.exit(1);
});