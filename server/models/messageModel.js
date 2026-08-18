const { pool, isDbConnected } = require('../config/db');

// In-memory fallback queue in case DB is temporarily disconnected
const fallbackMessages = [];

const MessageModel = {
  /**
   * Save a new contact message to the database
   * @param {Object} data - Message payload
   * @returns {Promise<Object>} Insert result
   */
  async create({ name, email, phone, subject, message, ip, userAgent }) {
    if (isDbConnected()) {
      try {
        const query = `
          INSERT INTO contact_messages (name, email, phone, subject, message, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
          name,
          email,
          phone || null,
          subject,
          message,
          ip || null,
          userAgent ? userAgent.substring(0, 255) : null,
        ]);
        return { success: true, id: result.insertId, source: 'mysql' };
      } catch (err) {
        console.error('[DB Error in MessageModel.create]', err);
        // Fallback to memory if DB insert fails
        const fallbackItem = {
          id: Date.now(),
          name,
          email,
          phone,
          subject,
          message,
          created_at: new Date(),
          source: 'memory_fallback',
        };
        fallbackMessages.push(fallbackItem);
        return { success: true, id: fallbackItem.id, source: 'memory_fallback' };
      }
    } else {
      // DB not connected, store in fallback queue
      const fallbackItem = {
        id: Date.now(),
        name,
        email,
        phone,
        subject,
        message,
        created_at: new Date(),
        source: 'memory_fallback',
      };
      fallbackMessages.push(fallbackItem);
      console.log(`[Fallback Store] Stored contact submission from ${name} <${email}>`);
      return { success: true, id: fallbackItem.id, source: 'memory_fallback' };
    }
  },

  /**
   * Retrieve recent messages (for admin/monitoring)
   * @param {number} limit
   */
  async getRecent(limit = 20) {
    if (isDbConnected()) {
      const [rows] = await pool.query(
        'SELECT id, name, email, phone, subject, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
      return rows;
    }
    return fallbackMessages.slice(-limit).reverse();
  },
};

module.exports = MessageModel;
