const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkLogs() {
  const { data, error } = await supabase.from('ActivityLogs').select('*').limit(1);
  if (error) {
    console.error('Error fetching ActivityLogs:', error);
  } else {
    console.log('Sample Log:', data);
  }
}

checkLogs();
