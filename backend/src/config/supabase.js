const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
