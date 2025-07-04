const jwt = require('jsonwebtoken');
require('dotenv').config();

//Autentificar Token
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    req.user = user; 
    next();
  });
}

module.exports = autenticarToken;
