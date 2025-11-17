require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 מחפש את כל הטבלאות הציבוריות...\n');
  
  // List all tables using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
  });
  
  if (error) {
    console.log('⚠️  לא יכול להריץ RPC, מנסה אחרת...\n');
    
    // Try listing common tables
    const tables = ['summaries', 'stories', 'events', 'agent_runs', 'users', 'profiles'];
    
    console.log('📊 בודק טבלאות נפוצות:\n');
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (!error) {
        console.log(`  ✅ ${table}`);
      }
    }
  } else {
    console.log('📊 טבלאות שנמצאו:');
    if (data && data.length > 0) {
      data.forEach(row => console.log(`  ✅ ${row.table_name}`));
    } else {
      console.log('  ❌ לא נמצאו טבלאות!');
    }
  }
})();
