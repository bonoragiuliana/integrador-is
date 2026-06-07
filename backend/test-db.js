const supabase = require('./src/config/supabase');

async function test() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Usuarios en BD:', data);
  }
}
test();
