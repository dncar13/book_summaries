require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  console.log('🔍 בודק אילו טבלאות קיימות...\n');
  
  // Try direct query to check which tables exist
  const { data: summ, error: e1 } = await supabase.from('summaries').select('id').limit(1);
  const { data: stor, error: e2 } = await supabase.from('stories').select('id').limit(1);
  
  console.log('📊 טבלאות קיימות:');
  if (!e1) console.log('  ✅ summaries');
  if (!e2) console.log('  ✅ stories');
  if (e1 && e2) {
    console.log('  ❌ אף אחת מהן לא נמצאה!');
    console.log('\nשגיאה summaries:', e1?.message);
    console.log('שגיאה stories:', e2?.message);
    process.exit(1);
  }
  
  console.log('\n🔍 בודק עמודות audio...\n');
  
  // Check columns in existing tables
  if (!e1) {
    const { data, error } = await supabase.from('summaries').select('id,audio_url,audio_parts').limit(1);
    if (!error) {
      console.log('✅ summaries מכילה:');
      const hasUrl = data?.[0]?.hasOwnProperty('audio_url') || (data && 'audio_url' in (data[0] || {}));
      const hasParts = data?.[0]?.hasOwnProperty('audio_parts') || (data && 'audio_parts' in (data[0] || {}));
      
      console.log('   ' + (hasUrl ? '✓' : '✗') + ' audio_url');
      console.log('   ' + (hasParts ? '✓' : '✗') + ' audio_parts');
      
      if (data?.[0]) {
        console.log('\n📝 שדות זמינים:', Object.keys(data[0]).join(', '));
      }
    } else {
      console.log('❌ summaries - שגיאה:', error.message);
    }
  }
  
  if (!e2) {
    const { data, error } = await supabase.from('stories').select('id,audio_url,audio_parts').limit(1);
    if (!error) {
      console.log('\n✅ stories מכילה:');
      const hasUrl = data?.[0]?.hasOwnProperty('audio_url') || (data && 'audio_url' in (data[0] || {}));
      const hasParts = data?.[0]?.hasOwnProperty('audio_parts') || (data && 'audio_parts' in (data[0] || {}));
      
      console.log('   ' + (hasUrl ? '✓' : '✗') + ' audio_url');
      console.log('   ' + (hasParts ? '✓' : '✗') + ' audio_parts');
      
      if (data?.[0]) {
        console.log('\n📝 שדות זמינים:', Object.keys(data[0]).join(', '));
      }
    } else {
      console.log('❌ stories - שגיאה:', error.message);
    }
  }
})();
