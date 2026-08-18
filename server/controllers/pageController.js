const companyInfo = {
  name: 'Oxomsoft Software Solution',
  shortName: 'Oxomsoft',
  domain: 'oxomsoft.in',
  url: process.env.APP_URL || 'https://oxomsoft.in',
  email: process.env.SUPPORT_EMAIL || 'support@oxomsoft.com',
  phone: '+91 98765 43210',
  address: 'Guwahati, Assam, India - 781001',
  tagline: 'Engineering Next-Gen Web, SaaS & Mobile Solutions',
  year: new Date().getFullYear(),
};

const PageController = {
  /**
   * Render Home Page
   */
  getHomePage(req, res) {
    res.render('pages/index', {
      title: 'Oxomsoft Software Solution | Custom Software, SaaS & Mobile App Development',
      metaDescription: 'Oxomsoft Software Solution builds high-performance custom websites, scalable SaaS cloud platforms, and native Android & iOS mobile applications for forward-thinking businesses.',
      canonicalUrl: `${companyInfo.url}/`,
      currentPath: '/',
      company: companyInfo,
    });
  },

  /**
   * Render About Us Page
   */
  getAboutPage(req, res) {
    res.render('pages/about', {
      title: 'About Us | Oxomsoft Software Solution',
      metaDescription: 'Learn about Oxomsoft Software Solution, our engineering culture, mission, core values, and dedicated team of software architects & digital creators.',
      canonicalUrl: `${companyInfo.url}/about`,
      currentPath: '/about',
      company: companyInfo,
    });
  },

  /**
   * Render Contact Us Page
   */
  getContactPage(req, res) {
    res.render('pages/contact', {
      title: 'Contact Us | Get in Touch with Oxomsoft',
      metaDescription: 'Ready to build your next digital product? Contact Oxomsoft Software Solution for project quotes, consultation, or technical inquiries.',
      canonicalUrl: `${companyInfo.url}/contact`,
      currentPath: '/contact',
      company: companyInfo,
      submitted: req.query.submitted === 'true',
    });
  },

  /**
   * Render Privacy Policy Page
   */
  getPrivacyPolicyPage(req, res) {
    res.render('pages/privacy', {
      title: 'Privacy Policy | Oxomsoft Software Solution',
      metaDescription: 'Privacy policy for Oxomsoft Software Solution (oxomsoft.in) explaining how we collect, store, and protect user data.',
      canonicalUrl: `${companyInfo.url}/privacy-policy`,
      currentPath: '/privacy-policy',
      company: companyInfo,
    });
  },

  /**
   * 404 Handler
   */
  getNotFoundPage(req, res) {
    res.status(404).render('pages/404', {
      title: '404 - Page Not Found | Oxomsoft Software Solution',
      metaDescription: 'The page you are looking for does not exist or has been moved.',
      canonicalUrl: `${companyInfo.url}${req.path}`,
      currentPath: req.path,
      company: companyInfo,
    });
  },
};

module.exports = PageController;
