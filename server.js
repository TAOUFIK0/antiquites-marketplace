const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Database = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration de multer pour l'upload de plusieurs images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max par fichier
    files: 5 // Maximum 5 photos par annonce
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'antiquites-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware d'authentification
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

const requireAdmin = (req, res, next) => {
  if (req.session.userId && req.session.isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
};

// Routes principales
app.get('/', async (req, res) => {
  try {
    const announcements = await Database.getValidatedAnnouncements();
    res.render('index', { 
      announcements, 
      user: req.session.userId ? { id: req.session.userId, isAdmin: req.session.isAdmin } : null 
    });
  } catch (error) {
    console.error('Erreur lors du chargement des annonces:', error);
    res.render('index', { announcements: [], user: null });
  }
});

// Routes d'authentification
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('login', { error: 'Email et mot de passe requis' });
  }

  try {
    const { email, password } = req.body;
    const user = await Database.getUserByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      req.session.isAdmin = user.is_admin;
      res.redirect(user.is_admin ? '/admin' : '/dashboard');
    } else {
      res.render('login', { error: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.render('login', { error: 'Erreur de connexion' });
  }
});

app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

app.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('register', { error: 'Données invalides' });
  }

  try {
    const { email, password, name } = req.body;
    const existingUser = await Database.getUserByEmail(email);
    
    if (existingUser) {
      return res.render('register', { error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await Database.createUser(email, hashedPassword, name);
    
    req.session.userId = userId;
    req.session.isAdmin = false;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    res.render('register', { error: 'Erreur d\'inscription' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Dashboard utilisateur
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await Database.getUserById(req.session.userId);
    const userAnnouncements = await Database.getUserAnnouncements(req.session.userId);
    res.render('dashboard', { 
      user: user,
      announcements: userAnnouncements 
    });
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.render('dashboard', { 
      user: { username: 'Utilisateur' },
      announcements: [] 
    });
  }
});

// Création d'annonce
app.get('/create-announcement', requireAuth, (req, res) => {
  res.render('create-announcement', { error: null });
});

app.post('/create-announcement', requireAuth, upload.array('images', 5), [
  body('title').isLength({ min: 3 }),
  body('description').isLength({ min: 10 }),
  body('phone').matches(/^[0-9\s\-\+\(\)\.]{10,15}$/)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('create-announcement', { error: 'Titre (min 3 car.), description (min 10 car.) et téléphone valide requis' });
  }

  try {
    const { title, description, phone } = req.body;
    // Récupérer les noms de fichiers des images uploadées
    const imagePaths = req.files ? req.files.map(file => file.filename) : [];
    const imagePathsJson = JSON.stringify(imagePaths); // Stocker en JSON
    
    await Database.createAnnouncement(req.session.userId, title, description, phone, imagePathsJson);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Erreur création annonce:', error);
    res.render('create-announcement', { error: 'Erreur lors de la création' });
  }
});

// Route pour voir les détails d'une annonce
app.get('/announcement/:id', async (req, res) => {
  try {
    const announcement = await Database.getAnnouncementById(req.params.id);
    if (!announcement) {
      return res.status(404).send('Annonce non trouvée');
    }
    
    // Vérifier que l'annonce est validée (visible publiquement)
    if (announcement.status !== 'validated' && announcement.status !== 'approved') {
      return res.status(404).send('Annonce non disponible');
    }
    
    // Parser les images JSON
    let images = [];
    if (announcement.image_path) {
      try {
        images = JSON.parse(announcement.image_path);
      } catch (e) {
        // Compatibilité avec l'ancien format (string simple)
        images = [announcement.image_path];
      }
    }
    
    res.render('announcement-details', { 
      announcement: { ...announcement, images },
      user: req.session.userId ? { id: req.session.userId, isAdmin: req.session.isAdmin } : null
    });
  } catch (error) {
    console.error('Erreur récupération annonce:', error);
    res.status(500).send('Erreur serveur');
  }
});

// Panel admin
app.get('/admin', requireAdmin, async (req, res) => {
  try {
    const pendingAnnouncements = await Database.getPendingAnnouncements();
    const validatedAnnouncements = await Database.getApprovedAnnouncements();
    const approvedCount = validatedAnnouncements.length;
    const rejectedCount = await Database.getRejectedCount();
    const totalUsers = await Database.getTotalUsers();
    
    res.render('admin', { 
      pendingAnnouncements,
      validatedAnnouncements,
      approvedCount,
      rejectedCount,
      totalUsers
    });
  } catch (error) {
    console.error('Erreur admin:', error);
    res.render('admin', { 
      pendingAnnouncements: [],
      validatedAnnouncements: [],
      approvedCount: 0,
      rejectedCount: 0,
      totalUsers: 0
    });
  }
});

app.post('/admin/validate/:id', requireAdmin, [
  body('price').isFloat({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/admin');
  }

  try {
    const { price } = req.body;
    await Database.validateAnnouncement(req.params.id, parseFloat(price));
    res.redirect('/admin');
  } catch (error) {
    console.error('Erreur validation:', error);
    res.redirect('/admin');
  }
});

app.post('/admin/reject/:id', requireAdmin, async (req, res) => {
  try {
    await Database.rejectAnnouncement(req.params.id);
    res.redirect('/admin');
  } catch (error) {
    console.error('Erreur rejet:', error);
    res.redirect('/admin');
  }
});

// Route pour supprimer une annonce (admin uniquement)
app.post('/admin/delete/:id', requireAdmin, async (req, res) => {
  try {
    const announcementId = req.params.id;
    
    // Récupérer les infos de l'annonce pour supprimer les images
    const announcement = await Database.getAnnouncementById(announcementId);
    
    if (announcement) {
      // Supprimer les fichiers images s'ils existent
      if (announcement.images && announcement.images.length > 0) {
        const fs = require('fs');
        const path = require('path');
        
        announcement.images.forEach(imageName => {
          const imagePath = path.join(__dirname, 'uploads', imageName);
          if (fs.existsSync(imagePath)) {
            try {
              fs.unlinkSync(imagePath);
            } catch (err) {
              console.error('Erreur suppression image:', err);
            }
          }
        });
      } else if (announcement.image_path) {
        // Support de l'ancien système à image unique
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, 'uploads', announcement.image_path);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (err) {
            console.error('Erreur suppression image:', err);
          }
        }
      }
    }
    
    // Supprimer l'annonce de la base de données
    await Database.deleteAnnouncement(announcementId);
    
    // Rediriger vers la page d'origine
    const referer = req.get('Referer');
    if (referer && referer.includes('/admin')) {
      res.redirect('/admin');
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error('Erreur suppression annonce:', error);
    res.redirect('/');
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Accédez à http://localhost:${PORT}`);
});
