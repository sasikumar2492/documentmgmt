const nodemailer = require('nodemailer');
const { pool } = require('../db/pool');
const config = require('../config');

let transporter = null;

function isEmailConfigured() {
  const { host, user, password } = config.smtp || {};
  return !!(host && user && password);
}

function getTransport() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }
  return transporter;
}

/**
 * Resolve user ids to notification addresses and names.
 * Returns array of { email, fullName }. Uses user.email if set, else username@emailDomain.
 */
async function getUsersForNotification(userIds) {
  if (!userIds || userIds.length === 0) return [];
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, full_name, email, username FROM users WHERE id = ANY($1::uuid[])`,
      [userIds.filter(Boolean)]
    );
    const domain = config.emailDomain || 'fedhubsoftware.com';
    return result.rows.map((r) => ({
      email: (r.email && r.email.trim()) ? r.email.trim() : `${(r.username || '').replace(/\s+/g, '')}@${domain}`,
      fullName: r.full_name || r.username || 'User',
    }));
  } finally {
    client.release();
  }
}

/**
 * Get request owner and assignee user ids for a request.
 */
async function getRequestNotifyUserIds(requestId) {
  if (!requestId) return [];
  const client = await pool.connect();
  try {
    const r = await client.query(
      'SELECT created_by, assigned_to FROM requests WHERE id = $1',
      [requestId]
    );
    const row = r.rows[0];
    if (!row) return [];
    const ids = [row.created_by, row.assigned_to].filter(Boolean);
    return [...new Set(ids)];
  } finally {
    client.release();
  }
}

function sendMail(options) {
  const transport = getTransport();
  if (!transport) {
    console.warn('Email not configured; skipping send.');
    return Promise.resolve();
  }
  const from = config.smtp.fromName
    ? `"${config.smtp.fromName}" <${config.smtp.from}>`
    : config.smtp.from;
  return transport.sendMail({ from, ...options }).catch((err) => {
    console.error('Email send error:', err.message);
  });
}

/**
 * Send notification after document upload.
 * Recipients: uploader (confirmation), request owner/assignee if request_id present.
 */
async function sendDocumentUploadNotification(payload) {
  const { document, uploaderUserId, requestId } = payload;
  if (!document || !uploaderUserId) return;

  const recipientIds = [uploaderUserId];
  if (requestId) {
    const requestUserIds = await getRequestNotifyUserIds(requestId);
    recipientIds.push(...requestUserIds);
  }

  const recipients = await getUsersForNotification([...new Set(recipientIds)]);
  if (recipients.length === 0) return;

  const subject = `Document uploaded: ${document.fileName}`;
  const text = [
    `A document has been uploaded to PHARMA DMS.`,
    ``,
    `Document: ${document.fileName}`,
    `Version: ${document.version || 1}`,
    requestId ? `Request ID: ${requestId}` : '',
    `Uploaded at: ${document.createdAt || new Date().toISOString()}`,
  ].filter(Boolean).join('\n');

  const html = `
    <p>A document has been uploaded to <strong>PHARMA DMS</strong>.</p>
    <p><strong>Document:</strong> ${escapeHtml(document.fileName)}</p>
    <p><strong>Version:</strong> ${document.version || 1}</p>
    ${requestId ? `<p><strong>Request ID:</strong> ${escapeHtml(String(requestId))}</p>` : ''}
    <p><strong>Uploaded at:</strong> ${escapeHtml(String(document.createdAt || new Date().toISOString()))}</p>
  `;

  for (const to of recipients) {
    await sendMail({
      to: to.email,
      subject,
      text,
      html,
    });
  }
}

/**
 * Send notification when document status is updated.
 * Recipients: document creator, request owner/assignee (if linked).
 */
async function sendDocumentStatusChangeNotification(payload) {
  const { documentId, fileName, requestId, oldStatus, newStatus, updatedByUserId, createdByUserId } = payload;
  if (!fileName || oldStatus === newStatus) return;

  const recipientIds = [createdByUserId].filter(Boolean);
  if (requestId) {
    const requestUserIds = await getRequestNotifyUserIds(requestId);
    recipientIds.push(...requestUserIds);
  }
  const recipientSet = new Set(recipientIds);
  if (updatedByUserId) recipientSet.delete(updatedByUserId);
  const recipients = await getUsersForNotification([...recipientSet]);
  if (recipients.length === 0) return;

  const subject = `Document status updated: ${fileName}`;
  const text = [
    `A document status has been updated in PHARMA DMS.`,
    ``,
    `Document: ${fileName}`,
    `Previous status: ${oldStatus}`,
    `New status: ${newStatus}`,
    requestId ? `Request ID: ${requestId}` : '',
    `Updated at: ${new Date().toISOString()}`,
  ].filter(Boolean).join('\n');

  const html = `
    <p>A document status has been updated in <strong>PHARMA DMS</strong>.</p>
    <p><strong>Document:</strong> ${escapeHtml(fileName)}</p>
    <p><strong>Previous status:</strong> ${escapeHtml(oldStatus)}</p>
    <p><strong>New status:</strong> ${escapeHtml(newStatus)}</p>
    ${requestId ? `<p><strong>Request ID:</strong> ${escapeHtml(String(requestId))}</p>` : ''}
    <p><strong>Updated at:</strong> ${escapeHtml(new Date().toISOString())}</p>
  `;

  for (const to of recipients) {
    await sendMail({
      to: to.email,
      subject,
      text,
      html,
    });
  }
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  isEmailConfigured,
  getTransport,
  getUsersForNotification,
  sendDocumentUploadNotification,
  sendDocumentStatusChangeNotification,
  sendMail,
};
