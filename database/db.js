const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'antiquites.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    // Table des utilisateurs
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des annonces
    this.db.run(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        phone TEXT,
        image_path TEXT,
        price DECIMAL(10,2),
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        validated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Ajouter la colonne phone si elle n'existe pas déjà
    this.db.run(`
      ALTER TABLE announcements ADD COLUMN phone TEXT
    `, (err) => {
      // Ignorer l'erreur si la colonne existe déjà
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Erreur lors de l\'ajout de la colonne phone:', err);
      }
    });

    // Créer un admin par défaut
    this.createDefaultAdmin();
  }

  async createDefaultAdmin() {
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('Admin2024!SecurePass', 10);
    
    this.db.run(`
      INSERT OR IGNORE INTO users (email, password, name, is_admin) 
      VALUES ('admin@antiquites.com', ?, 'Administrateur', TRUE)
    `, [adminPassword]);
  }

  // Méthodes utilisateurs
  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  createUser(email, password, name) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
        [email, password, name],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  // Méthodes annonces
  createAnnouncement(userId, title, description, phone, imagePath) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO announcements (user_id, title, description, phone, image_path) VALUES (?, ?, ?, ?, ?)',
        [userId, title, description, phone, imagePath],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getAnnouncementById(announcementId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT a.*, u.name as author_name, u.email as author_email 
        FROM announcements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.id = ?
      `, [announcementId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  getUserAnnouncements(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM announcements WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  getPendingAnnouncements() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT a.*, u.name as user_name, u.email as user_email 
        FROM announcements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'pending' 
        ORDER BY a.created_at ASC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getValidatedAnnouncements() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT a.*, u.name as user_name 
        FROM announcements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'validated' 
        ORDER BY a.validated_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  validateAnnouncement(announcementId, price) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE announcements SET status = ?, price = ?, validated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['validated', price, announcementId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  rejectAnnouncement(announcementId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE announcements SET status = ? WHERE id = ?',
        ['rejected', announcementId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  deleteAnnouncement(announcementId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM announcements WHERE id = ?',
        [announcementId],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  // Méthodes pour les statistiques admin
  getApprovedAnnouncements() {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT a.*, u.name as user_name, u.email as author_email 
        FROM announcements a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'approved' OR a.status = 'validated'
        ORDER BY a.validated_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getRejectedCount() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM announcements WHERE status = ?',
        ['rejected'],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }

  getTotalUsers() {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT COUNT(*) as count FROM users',
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
}

module.exports = new Database();
