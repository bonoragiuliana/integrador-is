const jwt = require('jsonwebtoken');
const { validateLogin } = require('./user.controller');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await validateLogin(email, password);
    
    if (user) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
      return res.json({ token, role: user.role, name: user.name });
    }

    return res.status(401).json({ message: 'Credenciales inválidas' });
  } catch (error) {
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
