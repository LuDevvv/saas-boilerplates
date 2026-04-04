import { Pool } from "pg";

async function testConnection() {
  console.log("Testing database connection...");

  const pool = new Pool({
    connectionString: "postgresql://app_user:changeme@localhost:5432/app",
    max: 1,
  });

  try {
    const client = await pool.connect();
    console.log("✅ Connected to database successfully!");

    const result = await client.query("SELECT NOW()");
    console.log("Current time:", result.rows[0].now);

    // Check outbox table
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'outbox'
      ) as exists
    `);
    console.log("Outbox table exists:", tableCheck.rows[0].exists);

    // Insert test event
    const insertResult = await client.query(`
      INSERT INTO outbox (id, event_type, payload, processed, retry_count, last_error)
      VALUES (gen_random_uuid(), 'test.event', '{"test": true}', false, 0, NULL)
      RETURNING id
    `);
    console.log("✅ Test event inserted:", insertResult.rows[0].id);

    // Count events
    const countResult = await client.query("SELECT COUNT(*) FROM outbox");
    console.log(`Total events in outbox: ${countResult.rows[0].count}`);

    client.release();
    await pool.end();

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Database test failed:", error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
