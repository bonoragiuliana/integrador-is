const supabase = require('../config/supabase');
const crypto = require('crypto');

exports.getAll = async (req, res) => {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.create = async (req, res) => {
  const { name, sector, status, risk, maintenance_frequency, next_maintenance } = req.body;

  if (!name || !sector) {
    return res.status(400).json({ message: 'Nombre y sector son campos obligatorios.' });
  }

  // Generamos un código QR único (MQR-XXXXXXXX)
  const qr_code = `MQR-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  const { data, error } = await supabase.from('machines').insert([{
    name,
    sector,
    status: status || 'OPERATIVA',
    risk: risk || 'BAJO',
    maintenance_frequency,
    next_maintenance: next_maintenance || null,
    qr_code
  }]).select();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, sector, status, risk, maintenance_frequency, next_maintenance } = req.body;

  if (!name || !sector) {
    return res.status(400).json({ message: 'Nombre y sector son campos obligatorios.' });
  }

  const { data, error } = await supabase.from('machines').update({
    name,
    sector,
    status,
    risk,
    maintenance_frequency,
    next_maintenance: next_maintenance || null
  }).eq('id', id).select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
};
