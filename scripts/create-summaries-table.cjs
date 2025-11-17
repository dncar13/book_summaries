require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSummariesTable() {
  console.log('🔄 Attempting to create summaries table...\n');

  // First, check if table already exists
  const { data: checkData, error: checkError } = await supabase
    .from('summaries')
    .select('id')
    .limit(1);

  if (!checkError) {
    console.log('✅ Summaries table already exists!');

    // Check for audio columns
    const { data: cols, error: colError } = await supabase
      .from('summaries')
      .select('audio_url, audio_parts')
      .limit(1);

    if (!colError) {
      console.log('✅ Audio columns (audio_url, audio_parts) are present!');
    } else {
      console.log('⚠️ Audio columns might be missing:', colError.message);
    }
    return;
  }

  console.log('❌ Summaries table does not exist:', checkError.message);
  console.log('\n📋 Unfortunately, Supabase JS client cannot execute raw DDL statements.');
  console.log('\n🔧 Alternative solutions:');
  console.log('\n1. **Supabase Dashboard (Recommended)**:');
  console.log('   - Go to: https://llyunioulzfbgqvmeaxq.supabase.co/project/llyunioulzfbgqvmeaxq/sql');
  console.log('   - Paste the SQL from: supabase/migrations/20250125_create_summaries.sql');
  console.log('   - Click RUN');

  console.log('\n2. **Using psql directly**:');
  console.log('   You need the database password. If you have it, run:');
  console.log('   psql "postgresql://postgres:[PASSWORD]@db.llyunioulzfbgqvmeaxq.supabase.co:5432/postgres" < supabase/migrations/20250125_create_summaries.sql');

  console.log('\n3. **Supabase CLI with API Token**:');
  console.log('   If you have a Supabase Access Token:');
  console.log('   export SUPABASE_ACCESS_TOKEN=your-token-here');
  console.log('   supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.llyunioulzfbgqvmeaxq.supabase.co:5432/postgres"');

  // Display the SQL that needs to be run
  console.log('\n📄 SQL to execute:');
  console.log('─'.repeat(50));
  const sqlFile = path.join(__dirname, '..', 'supabase', 'migrations', '20250125_create_summaries.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  console.log(sql);
  console.log('─'.repeat(50));
}

createSummariesTable().catch(console.error);