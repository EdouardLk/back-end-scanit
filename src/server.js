
const app = require("./app");
const mongoose = require("mongoose");


// Importation de l'application Express
const http = require('http');

const PORT = process.env.PORT || 6000; // Définition du port

// Création du serveur HTTP
const server = app.listen(PORT);


mongoose.connect(process.env.DB_CONNECTION_STRING)
.then(()=>{
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
})
.catch((err)=>{
    console.error("❌ Incapable d'accéder à MongoDB :", err.message);
});


// Gestion des erreurs du serveur
server.on('error', (error) => {
    console.error('❌ Erreur du serveur:', error);
});


