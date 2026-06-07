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

exports.getByUser = async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('work_orders')
    .select(`
      *,
      machine:machines (name),
      creator:users!work_orders_created_by_fkey (name)
    `)
    .eq('assigned_to', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Aceptamos EN_PROCESO como estándar nuevo
  if (!['PENDIENTE', 'EN_PROCESO', 'COMPLETADA'].includes(status)) {
    return res.status(400).json({ message: 'Estado inválido' });
  }

  // Obtener estado actual para validar unidireccionalidad
  const { data: currentData } = await supabase
    .from('work_orders')
    .select('status')
    .eq('id', id)
    .single();

  if (!currentData) return res.status(404).json({ message: 'Orden no encontrada' });

  const currentStatus = currentData.status;
  
  // Validar dirección (no volver atrás)
  if (currentStatus === 'COMPLETADA') {
    return res.status(400).json({ message: 'La orden ya está completada y no puede modificarse' });
  }
  if (currentStatus === 'EN_PROCESO' && status === 'PENDIENTE') {
    return res.status(400).json({ message: 'No se puede volver a PENDIENTE una orden EN_PROCESO' });
  }

  let updates = { status };
  if (status === 'EN_PROCESO' && currentStatus === 'PENDIENTE') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'COMPLETADA') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('work_orders')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
};
