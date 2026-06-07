const supabase = require('../config/supabase');

exports.create = async (req, res) => {
  const { machine_id, user_id, type, date, description, observations, final_machine_status, checklist_completed } = req.body;

  if (!machine_id || !user_id || !type || !description || !final_machine_status) {
    return res.status(400).json({ message: 'Campos obligatorios faltantes.' });
  }

  // Insertamos el mantenimiento
  const { data: maintenanceData, error: maintenanceError } = await supabase.from('maintenance_history').insert([{
    machine_id,
    user_id,
    type,
    date: date || new Date().toISOString(),
    description,
    observations,
    final_machine_status,
    checklist_completed: checklist_completed || [],
    is_validated: false
  }]).select();

  if (maintenanceError) {
    return res.status(500).json({ error: maintenanceError.message });
  }

  // Actualizamos el estado de la máquina en Supabase
  const { error: machineError } = await supabase.from('machines').update({
    status: final_machine_status
  }).eq('id', machine_id);

  if (machineError) {
    console.error('Error actualizando el estado de la máquina:', machineError);
    // Si falla esto devolvemos un 207 Multi-Status o 500 según diseño, opto por dejarlo pasar con log
    // ya que la historia clínica del mantenimiento quedó asentada.
  }

  res.status(201).json(maintenanceData[0]);
};

exports.getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('maintenance_history')
    .select(`
      *,
      machine:machines (name, sector),
      user:users (name)
    `)
    .order('is_validated', { ascending: true }) // false (pendientes) primero
    .order('date', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

exports.validate = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('maintenance_history')
    .update({ is_validated: true })
    .eq('id', id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data[0]);
};

