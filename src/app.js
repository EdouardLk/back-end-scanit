const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config(); // Charge les variables d'environnement depuis le fichier .env

const app = express();

// Sécurisation de l'application avec Helmet
app.use(helmet());

// Autoriser les requêtes cross-origin (CORS)
app.use(cors({
    origin: [ process.env.AUTH_SERVICE_URL, "http://127.0.0.1:5500", "http://localhost:5500", process.env.FRONTEND_URL ],
    credentials: true
}));

// Logger les requêtes HTTP
app.use(morgan('dev'));

// Middleware pour parser le JSON
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📩 Requête reçue : ${req.method} ${req.url}`);
    next();
});

// 🚏 Importer les routes
const userRoutes = require('./routes/user.routes');
const templateRoutes = require('./routes/template.routes');
const templateUserRoutes = require('./routes/templateUser.routes');
const CvRoutes = require('./routes/cv.routes');


app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/templatesUsers', templateUserRoutes);
app.use('/api/cv', CvRoutes);

app.get("/api/ping", (req, res) => {
    res.json({message :"✅ Serveur Express fonctionne !"});
});
module.exports = app;