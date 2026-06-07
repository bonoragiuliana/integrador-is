const supabase = require('../config/supabase');

exports.create = async (req, res) => {
  const { machine_id, assigned_to, created_by, type, priority, limit_date, description } = req.body;

  if (!machine_id || !assigned_to || !created_by || !type || !priority || !limit_date || !description) {
    return res.status(400).json({ message: 'Campos obligatorios faltantes.' });
  }

  const { data, error } = await supabase
    .from('work_orders')
    .insert([{
      machine_id,
      assigned_to,
      created_by,
      type,
      priority,
      limit_date,
      description,
      status: 'PENDIENTE'
    }])
    .select();

  if (error) {
    return res.status(500).json({ message: 'Error interno de base de datos', error: error.message });
  }

  res.status(201).json(data[0]);
};

exports.getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      machine:machines (name),
      technician:users!work_orders_assigned_to_fkey (name),
      creator:users!work_orders_created_by_fkey (name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
