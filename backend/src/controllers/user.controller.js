const supabase = require('../config/supabase');

exports.getAll = async (req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

exports.create = async (req, res) => {
  const { name, email, password, role } = req.body;
  const { data, error } = await supabase.from('users').insert([{ name, email, password, role }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data[0]);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ name, email, password, role })
    .eq('id', id)
    .select();
    
  if (error) return res.status(400).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(data[0]);
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
};

exports.validateLogin = async (email, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();
    
  if (error || !data) return null;
  return data;
};
