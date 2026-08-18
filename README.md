# Oxomsoft Software Solution — Production Web Platform

[![Domain](https://img.shields.io/badge/Domain-oxomsoft.in-blue)](https://oxomsoft.in)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19.2-black.svg)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com)
[![Reverse Proxy](https://img.shields.io/badge/Reverse%20Proxy-Caddy%20v2-teal.svg)](https://caddyserver.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

Official production website and backend for **Oxomsoft Software Solution** (`oxomsoft.in`), engineered with high-throughput Node.js clustering, MySQL connection pooling, Three.js 3D hero canvas, Tailwind CSS styling, EJS templating, security headers, rate limiting, and Caddy reverse proxy integration.

---

## 🏢 Company Overview
- **Company Name:** Oxomsoft Software Solution
- **Domain:** [oxomsoft.in](https://oxomsoft.in)
- **Support Email:** [support@oxomsoft.com](mailto:support@oxomsoft.com)
- **Core Services:**
  1. Custom Website Development
  2. Multi-Tenant SaaS App Cloud Development
  3. Android & iOS Mobile Application Engineering (Flutter / Native)

---

## 🏗️ Architecture & Features

```
Oxomosft Software Solution/
├── server/
│   ├── cluster.js               # Multi-core CPU cluster master (auto-respawn)
│   ├── app.js                   # Express application setup, security, static, routes
│   ├── config/
│   │   └── db.js                # MySQL2 connection pool with auto-table initialization
│   ├── controllers/
│   │   ├── pageController.js    # Renders Home, About, Contact, Privacy, 404 views
│   │   └── contactController.js # Handles contact validations, DB insertion & email alerts
│   ├── routes/
│   │   ├── pageRoutes.js        # Web page routes (/, /about, /contact, /privacy-policy)
│   │   └── apiRoutes.js         # RESTful API endpoints (/api/contact)
│   └── models/
│       └── messageModel.js      # Database queries with resilient fallback
├── views/
│   ├── partials/
│   │   ├── header.ejs           # HTML5 Head, fonts, Tailwind CDN, Three.js & navbar
│   │   ├── navbar.ejs           # Glassmorphism header & mobile navigation drawer
│   │   └── footer.ejs           # Detailed footer with brand, domain & legal links
│   └── pages/
│       ├── index.ejs            # Home with Three.js 3D Hero, services & process
│       ├── about.ejs            # About page with mission, vision, core values & team
│       ├── contact.ejs          # Contact form, direct support & interactive map
│       ├── privacy.ejs          # Full Privacy Policy for oxomsoft.in
│       └── 404.ejs              # Branded 404 error page
├── public/
│   ├── css/
│   │   └── styles.css           # Glassmorphism cards, glow accents, animations
│   ├── js/
│   │   ├── hero-three.js        # Three.js 3D particle constellation & reactive geometry
│   │   ├── contact-form.js      # Client validation & async AJAX submission
│   │   └── main.js              # Navbar scroll blur, mobile drawer, scroll reveal
│   ├── assets/
│   │   └── favicon.svg          # Stylized geometric Oxomsoft brand icon
│   ├── robots.txt               # Search engine crawler instructions
│   └── sitemap.xml              # SEO sitemap
├── Caddyfile                    # Production Caddy reverse proxy & TLS configuration
├── ecosystem.config.js          # PM2 cluster configuration for VPS deployment
├── .env.example                 # Environment configuration template
├── package.json                 # Project dependencies & npm scripts
└── README.md                    # Detailed documentation
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later
- **MySQL**: v8.0 or later (Optional for UI test; app has fallback mode if DB is offline)
- **Git**

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 4. Database Setup (MySQL)
Create database in your local MySQL instance:
```sql
CREATE DATABASE IF NOT EXISTS oxomsoft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> **Note:** When the application starts, it will automatically create the `contact_messages` table if it does not already exist:
```sql
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 5. Running the Application

#### Option A: Native Node.js Cluster Mode (Utilizing all CPU Cores)
```bash
npm start
```
*Spawns a master process and forks a worker on every available CPU core with automatic respawn on worker failure.*

#### Option B: Single Worker Mode (Development / Debugging)
```bash
npm run start:single
```

#### Option C: Auto-Reloading Dev Mode (via Nodemon)
```bash
npm run dev
```

Visit the website at: **http://localhost:3000**

---

## 🚀 Production Deployment

### 1. Running with PM2 Cluster Mode
Install PM2 globally if not already installed:
```bash
npm install -g pm2
```

Start the application cluster:
```bash
npm run pm2:start
```

Check status and logs:
```bash
pm2 status
npm run pm2:logs
```

### 2. Caddy Reverse Proxy & Automatic SSL Setup

Caddy provides automatic HTTPS (Let's Encrypt certificates), modern TLS 1.3, HTTP/2 & HTTP/3 support, and Zstandard/Gzip compression.

1. **Install Caddy on Linux (Debian/Ubuntu):**
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

2. **Copy the `Caddyfile`:**
```bash
sudo cp Caddyfile /etc/caddy/Caddyfile
```

3. **Format & Reload Caddy:**
```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Your website will immediately be accessible with auto-renewing SSL at `https://oxomsoft.in`.

---

## 🛡️ Security & Performance Highlights

1. **HTTP Security Headers (`helmet`)**: Configured with strict Content-Security-Policy (CSP), HSTS, and X-Frame-Options.
2. **API Rate Limiting (`express-rate-limit`)**: Protects the contact endpoint against spam bots and brute-force flooding.
3. **Data Sanitization (`express-validator`)**: Trims, escapes, and normalizes contact form submissions before database insertion.
4. **Compression (`compression`)**: Gzip & Deflate response body compression for low-bandwidth environments.
5. **Node.js Clustering (`cluster`)**: Zero-downtime worker restarts and full hardware utilization across multiple CPU cores.
6. **Graceful Database Fallback**: If MySQL temporarily drops connection, incoming submissions are safely cached in-memory while system warnings are emitted.

---

## 📧 Support & Contact

- **Domain:** [oxomsoft.in](https://oxomsoft.in)
- **Support Desk:** [support@oxomsoft.com](mailto:support@oxomsoft.com)
- **Location:** Guwahati, Assam, India - 781001
- **Copyright:** &copy; 2025 Oxomsoft Software Solution. All rights reserved.
