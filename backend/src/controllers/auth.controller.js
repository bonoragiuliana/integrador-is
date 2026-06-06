const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Mock authentication logic
  if (email === 'admin@mantechqr.com' && password === 'admin123') {
    const token = jwt.sign({ id: 1, role: 'Administrador' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    return res.json({ token, role: 'Administrador', name: 'Admin Principal' });
  }
  
  if (email === 'tecnico@mantechqr.com' && password === 'tecnico123') {
    const token = jwt.sign({ id: 2, role: 'Técnico' }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
    return res.json({ token, role: 'Técnico', name: 'Técnico Juan' });
  }

  return res.status(401).json({ message: 'Credenciales inválidas' });
};
