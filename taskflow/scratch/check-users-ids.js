const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function listUsers() {
  const { data, error } = await supabase.from('Users').select('Id, FullName, Email, SystemRole');
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Users found:');
    console.table(data);
  }
}

listUsers();
