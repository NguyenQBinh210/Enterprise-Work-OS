const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seedLogs() {
  const logs = [
    { ActorId: 'adm_a1b2', Action: 'Đăng nhập hệ thống', Details: 'IP: 192.168.1.1', CreatedAt: new Date().toISOString() },
    { ActorId: 'adm_a1b2', Action: 'Truy cập quản trị', Details: 'Xem danh sách nhân sự', CreatedAt: new Date(Date.now() - 3600000).toISOString() },
    { ActorId: 'adm_a1b2', Action: 'Thay đổi cấu hình', Details: 'Cập nhật logo công ty', CreatedAt: new Date(Date.now() - 7200000).toISOString() },
    { ActorId: 'usr_ha81', Action: 'Tạo dự án mới', Details: 'Dự án: App Mobile', CreatedAt: new Date().toISOString() },
  ];

  const { error } = await supabase.from('ActivityLogs').insert(logs);
  if (error) {
    console.error('Error seeding logs:', error);
  } else {
    console.log('Successfully seeded logs!');
  }
}

seedLogs();
