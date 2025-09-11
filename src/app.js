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
    origin: [
        process.env.AUTH_SERVICE_URL,
        process.env.AUTH_SERVICE_URL.replace('http://', 'http://127.0.0.1:'),
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL.replace('http://', 'http://127.0.0.1:'),
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        "https://scanitynov.grafana.net"
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logger les requêtes HTTP
app.use(morgan('dev'));

// Middleware pour parser le JSON
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📩 Requête reçue : ${req.method} ${req.url}`);

    // Middleware pour mesurer chaque requête
    const end = httpRequestDurationSeconds.startTimer();
    res.on('finish', () => {
      httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
      end({ method: req.method, route: req.path, status: res.statusCode });
    });

    next();
});


// 🚏 Importer les routes
const userRoutes = require('./routes/user.routes');
const templateRoutes = require('./routes/template.routes');
const templateUserRoutes = require('./routes/templateUser.routes');
const cvRoutes = require('./routes/cv.routes');
const applicationRoutes = require('./routes/application.routes');


app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/templatesUsers', templateUserRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/applications', applicationRoutes);

app.get("/api/ping", (req, res) => {
    res.json({message :"✅ Serveur Express fonctionne !"});
});

//----------------partie metrics------------//
const client = require('prom-client');

// Crée un registre pour stocker toutes les métriques
const register = new client.Registry();

// Ajoute des métriques par défaut (CPU, mémoire, etc.)
client.collectDefaultMetrics({ register });

// Exemple : compteur personnalisé
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP reçues',
  labelNames: ['method', 'route', 'status']
});

// Exemple : histogramme pour les temps de réponse
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP en secondes',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// Enregistre les métriques
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);


// Endpoint pour exposer les métriques
app.get('/api/metrics', async (req, res) => {

  //middleware
    if (req.query.token !== process.env.METRICS_TOKEN) return res.status(403).send("Forbidden");
    
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});


module.exports = app;