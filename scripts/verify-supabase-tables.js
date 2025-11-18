const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTables() {
  console.log('🔍 Verifying Supabase Tables...\n');

  const tablesToCheck = [
    'User',
    'Provider',
    'Company',
    'Quote',
    'QuoteItem',
    'Booking',
    'Bid',
    'Job',
    'LeadDistribution',
    'ServiceArea',
    'PricingRule',
    'AnalyticsEvent'
  ];

  let allTablesExist = true;

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log(`❌ Table "${table}" does not exist`);
        allTablesExist = false;
      } else if (error) {
        console.log(`⚠️  Table "${table}" exists but has an issue: ${error.message}`);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    } catch (err) {
      console.log(`❌ Error checking table "${table}": ${err.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  if (allTablesExist) {
    console.log('✅ All tables verified successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/provider/login-supabase');
  } else {
    console.log('❌ Some tables are missing. Please run the SQL script in Supabase.');
  }
}

verifyTables().catch(console.error);