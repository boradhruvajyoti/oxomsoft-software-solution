const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const { initDB } = require('./config/db');
const pageRoutes = require('./routes/pageRoutes');
const apiRoutes = require('./routes/apiRoutes');
const PageController = require('./controllers/pageController');

const app = express();

// Trust proxy for correct IP headers behind Caddy / reverse proxies
app.set('trust proxy', 1);

// Initialize Database connection
initDB();

// View Engine Setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdn.tailwindcss.com',
          'https://cdnjs.cloudflare.com',
          'https://unpkg.com',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
          'https://cdnjs.cloudflare.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com',
        ],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https:'],
        frameSrc: ["'self'", 'https://www.google.com', 'https://maps.google.com'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Compression Middleware (gzip/deflate)
app.use(compression());

// CORS Configuration
app.use(cors());

// Global Rate Limiter for general DDOS / traffic spike mitigation
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please slow down.',
});
app.use(globalLimiter);

// Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Static Assets
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
  })
);

// Mount Page and API Routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// 404 Handler
app.use(PageController.getNotFoundPage);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  const isAjax = req.xhr || req.headers.accept?.indexOf('json') > -1;

  if (isAjax) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred.',
    });
  }

  res.status(500).render('pages/404', {
    title: '500 - Server Error | Oxomsoft Software Solution',
    metaDescription: 'An unexpected internal error occurred.',
    canonicalUrl: `${process.env.APP_URL || 'https://oxomsoft.in'}/500`,
    currentPath: req.path,
    company: {
      name: 'Oxomsoft Software Solution',
      shortName: 'Oxomsoft',
      domain: 'oxomsoft.in',
      email: process.env.SUPPORT_EMAIL || 'support@oxomsoft.com',
      phone: '+91 98765 43210',
      address: 'Guwahati, Assam, India - 781001',
      year: new Date().getFullYear(),
    },
    customMessage: 'We experienced an internal server error. Our engineering team has been notified.',
  });
});

const PORT = process.env.PORT || 3000;

// Export for clustering or direct start
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Single Mode] Oxomsoft server running on http://localhost:${PORT} (PID: ${process.pid})`);
  });
}

module.exports = app;
