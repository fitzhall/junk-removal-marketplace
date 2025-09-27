const { Client } = require('pg');

async function testConnection() {
  // Test pooler connection (AWS-1 US East)
  const poolerUrl = 'postgres://postgres.oqifdixuxnabkpdqjjrh:Wegonshine1*@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
  const poolerClient = new Client({
    connectionString: poolerUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Testing pooler connection US East (port 6543)...');
  try {
    await poolerClient.connect();
    const res = await poolerClient.query('SELECT NOW()');
    console.log('✅ Pooler connection successful:', res.rows[0]);
    await poolerClient.end();
  } catch (err) {
    console.error('❌ Pooler connection failed:', err.message);
  }

  // Test direct connection
  const directUrl = 'postgres://postgres:Wegonshine1*@db.oqifdixuxnabkpdqjjrh.supabase.co:5432/postgres';
  const directClient = new Client({
    connectionString: directUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\nTesting direct connection (port 5432)...');
  try {
    await directClient.connect();
    const res = await directClient.query('SELECT NOW()');
    console.log('✅ Direct connection successful:', res.rows[0]);
    await directClient.end();
  } catch (err) {
    console.error('❌ Direct connection failed:', err.message);
  }
}

async function testSimpleFormat() {
  // Test with the format you provided
  const simpleUrl = 'postgres://postgres:Wegonshine1*@db.oqifdixuxnabkpdqjjrh.supabase.co:6543/postgres';
  const client = new Client({
    connectionString: simpleUrl,
    ssl: { rejectUnauthorized: false }
  });

  console.log('\nTesting with your provided format (port 6543)...');
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ Connection successful:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection().then(() => testSimpleFormat());