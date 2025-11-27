const { verifyAccessToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    const decoded = verifyAccessToken(token);
    req.userId = decoded.id;
    req.userPerfil = decoded.perfil;
    
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const isAgente = (req, res, next) => {
  if (req.userPerfil !== 'agente') {
    return res.status(403).json({ error: 'Acesso negado. Apenas agentes podem acessar este recurso.' });
  }
  next();
};

module.exports = { authMiddleware, isAgente };
