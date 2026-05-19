const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkColumns() {
  // Try to select a non-existent column to see the error message which might list columns,
  // or just try to get one row and see the keys.
  const { data, error } = await supabase.from('ActivityLogs').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('Table is empty, cannot determine columns easily via anon key.');
  }
}

checkColumns();
