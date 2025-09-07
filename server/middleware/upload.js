// middleware/upload.js - Nouveau fichier
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../uploads/properties');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/properties/');
  },
  filename: (req, file, cb) => {
    // Créer un nom unique pour chaque fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `property-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour les types de fichiers
const fileFilter = (req, file, cb) => {
  // Vérifier le type MIME
  if (file.mimetype.startsWith('image/')) {
    // Types d'images autorisés
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF and WebP images are allowed'), false);
    }
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB par fichier
    files: 3 // Maximum 3 fichiers
  },
  fileFilter: fileFilter
});

// Middleware pour gérer les uploads de propriétés
const uploadPropertyImages = upload.array('images', 3);

// Wrapper pour gérer les erreurs multer
const handleUpload = (req, res, next) => {
  uploadPropertyImages(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB per image.'
        });
      }
      
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 3 images allowed.'
        });
      }
      
      if (err.message.includes('Only')) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    
    next();
  });
};

module.exports = {
  handleUpload,
  uploadPropertyImages
};