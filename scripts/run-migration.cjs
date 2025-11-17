require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🚀 מריץ migration 001_init.sql...\n');
  
  const sql = fs.readFileSync('./supabase/migrations/001_init.sql', 'utf8');
  
  // Split by semicolons and run each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`📝 ${statements.length} statements למריצה...\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (stmt.length < 10) continue;
    
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 50)}...`);
    
    try {
      // Use REST API to execute SQL
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({ query: stmt })
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.log(`   ⚠️  Status ${response.status}:`, text.substring(0, 100));
      } else {
        console.log(`   ✅ הצליח`);
      }
    } catch (error) {
      console.log(`   ❌ שגיאה:`, error.message);
    }
  }
  
  console.log('\n✅ סיימתי! בודק שהטבלאות נוצרו...\n');
  
  const { error: e1 } = await supabase.from('summaries').select('id').limit(1);
  const { error: e2 } = await supabase.from('events').select('id').limit(1);
  
  if (!e1) console.log('✅ summaries נוצרה');
  else console.log('❌ summaries לא נוצרה:', e1.message);
  
  if (!e2) console.log('✅ events נוצרה');
  else console.log('❌ events לא נוצרה:', e2.message);
})();
