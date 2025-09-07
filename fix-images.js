const Database = require('./database/db');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixImagePaths() {
    console.log('🔧 Nettoyage des chemins d\'images...');
    
    const dbPath = path.join(__dirname, 'database', 'antiquites.db');
    const db = new sqlite3.Database(dbPath);
    
    try {
        // Récupérer toutes les annonces avec image_path
        db.all('SELECT id, image_path FROM announcements WHERE image_path IS NOT NULL', [], (err, rows) => {
            if (err) {
                console.error('Erreur:', err);
                return;
            }
            
            console.log(`Traitement de ${rows.length} annonces...`);
            
            rows.forEach((row) => {
                console.log(`\nAnnonce ID ${row.id}:`);
                console.log(`Avant: ${JSON.stringify(row.image_path)}`);
                
                let cleanedImagePath;
                try {
                    // Tenter de parser le JSON
                    let images = JSON.parse(row.image_path);
                    if (Array.isArray(images)) {
                        // Nettoyer chaque nom de fichier (enlever les sauts de ligne)
                        images = images.map(img => img.trim());
                        cleanedImagePath = JSON.stringify(images);
                    } else {
                        cleanedImagePath = row.image_path.trim();
                    }
                } catch (e) {
                    // Si ce n'est pas du JSON, nettoyer directement
                    cleanedImagePath = row.image_path.trim();
                }
                
                console.log(`Après: ${JSON.stringify(cleanedImagePath)}`);
                
                // Mettre à jour la base de données
                db.run('UPDATE announcements SET image_path = ? WHERE id = ?', [cleanedImagePath, row.id], (err) => {
                    if (err) {
                        console.error(`Erreur mise à jour annonce ${row.id}:`, err);
                    } else {
                        console.log(`✅ Annonce ${row.id} mise à jour`);
                    }
                });
            });
            
            setTimeout(() => {
                db.close();
                console.log('\n🎉 Nettoyage terminé !');
            }, 1000);
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        db.close();
    }
}

fixImagePaths();
