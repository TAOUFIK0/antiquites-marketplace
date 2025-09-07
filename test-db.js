const Database = require('./database/db');

async function testDatabase() {
    console.log('🔍 Test de la base de données...');
    
    try {
        // Tester les annonces validées
        console.log('\n📊 Annonces validées:');
        const validatedAnnouncements = await Database.getValidatedAnnouncements();
        console.log(`Nombre d'annonces validées: ${validatedAnnouncements.length}`);
        
        validatedAnnouncements.forEach((announcement, index) => {
            console.log(`\n--- Annonce ${index + 1} ---`);
            console.log(`ID: ${announcement.id}`);
            console.log(`Titre: ${announcement.title}`);
            console.log(`Image_path: ${announcement.image_path}`);
            console.log(`Status: ${announcement.status}`);
            
            // Test de parsing des images
            if (announcement.image_path) {
                try {
                    const images = JSON.parse(announcement.image_path);
                    console.log(`Images (JSON parsé): ${JSON.stringify(images)}`);
                } catch (e) {
                    console.log(`Images (string simple): ${announcement.image_path}`);
                }
            } else {
                console.log('Aucune image');
            }
        });
        
        // Tester les annonces en attente
        console.log('\n📊 Annonces en attente:');
        const pendingAnnouncements = await Database.getPendingAnnouncements();
        console.log(`Nombre d'annonces en attente: ${pendingAnnouncements.length}`);
        
        pendingAnnouncements.forEach((announcement, index) => {
            console.log(`\n--- Annonce en attente ${index + 1} ---`);
            console.log(`ID: ${announcement.id}`);
            console.log(`Titre: ${announcement.title}`);
            console.log(`Image_path: ${announcement.image_path}`);
            console.log(`Phone: ${announcement.phone}`);
            
            if (announcement.image_path) {
                try {
                    const images = JSON.parse(announcement.image_path);
                    console.log(`Images (JSON parsé): ${JSON.stringify(images)}`);
                } catch (e) {
                    console.log(`Images (string simple): ${announcement.image_path}`);
                }
            } else {
                console.log('Aucune image');
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

testDatabase();
