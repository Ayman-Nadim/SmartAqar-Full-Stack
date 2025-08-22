// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const auth = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: 'Access denied. No token provided.'
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.sub);
    
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token. User not found.'
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error('Auth middleware error:', error.message);
    
//     // Gestion spécifique des erreurs JWT
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Invalid token.'
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: 'Token expired.'
//       });
//     }
    
//     // Erreur générique
//     res.status(401).json({
//       success: false,
//       message: 'Authentication failed.'
//     });
//   }
// };

// module.exports = auth;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Vérification du token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération de l'utilisateur depuis la base de données
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // On attache l'utilisateur à la requête pour qu'il soit accessible dans les routes
    req.user = user;

    // Passe à la prochaine étape (route suivante)
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    // Gestion spécifique des erreurs JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    // Erreur générique
    res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

module.exports = auth;
