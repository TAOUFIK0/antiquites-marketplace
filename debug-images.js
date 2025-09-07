const Database = require('./database/db');

async function debugImages() {
    try {
        // Récupérer les annonces en attente
        const pendingAnnouncements = await Database.getPendingAnnouncements();
        console.log('=== ANNONCES EN ATTENTE ===');
        pendingAnnouncements.forEach(announcement => {
            console.log(`\nAnnonce ID: ${announcement.id}`);
            console.log(`Titre: ${announcement.title}`);
            console.log(`Statut: ${announcement.status}`);
            console.log(`Image path brut: ${announcement.image_path}`);
            
            // Test du parsing JSON
            if (announcement.image_path) {
                try {
                    const images = JSON.parse(announcement.image_path);
                    console.log(`Images parsées: ${JSON.stringify(images)}`);
                    console.log(`Nombre d'images: ${Array.isArray(images) ? images.length : 1}`);
                } catch (e) {
                    console.log(`Parsing JSON échoué, ancienne annonce: ${announcement.image_path}`);
                }
            } else {
                console.log('Aucune image');
            }
        });

        // Récupérer les annonces validées
        const approvedAnnouncements = await Database.getApprovedAnnouncements();
        console.log('\n=== ANNONCES VALIDÉES ===');
        approvedAnnouncements.forEach(announcement => {
            console.log(`\nAnnonce ID: ${announcement.id}`);
            console.log(`Titre: ${announcement.title}`);
            console.log(`Statut: ${announcement.status}`);
            console.log(`Image path brut: ${announcement.image_path}`);
            
            // Test du parsing JSON
            if (announcement.image_path) {
                try {
                    const images = JSON.parse(announcement.image_path);
                    console.log(`Images parsées: ${JSON.stringify(images)}`);
                    console.log(`Nombre d'images: ${Array.isArray(images) ? images.length : 1}`);
                } catch (e) {
                    console.log(`Parsing JSON échoué, ancienne annonce: ${announcement.image_path}`);
                }
            } else {
                console.log('Aucune image');
            }
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

debugImages();
