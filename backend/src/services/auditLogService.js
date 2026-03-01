const { pool } = require('../db/pool');

function mapRow(r) {
  let entityName = r.entity_id;
  if (r.entity_type === 'request' && r.request_display_id) entityName = r.request_display_id;
  else if (r.entity_type === 'template' && r.template_file_name) entityName = r.template_file_name;
  else if (r.entity_type === 'document' && r.document_file_name) entityName = r.document_file_name;

  let detailsStr = r.details;
  if (detailsStr != null && typeof detailsStr === 'object') detailsStr = JSON.stringify(detailsStr);
  if (detailsStr == null) detailsStr = '';

  return {
    id: r.id,
    timestamp: r.created_at,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    entityName: String(entityName),
    user: r.full_name || r.username || 'System',
    userRole: r.user_role || 'user',
    department: r.department_name || undefined,
    details: detailsStr,
    ipAddress: r.ip_address || undefined,
    requestId: r.entity_type === 'request' ? r.request_display_id : undefined,
  };
}

async function list(filters = {}) {
  const {
    entity_type,
    entity_id,
    user_id,
    request_id,
    date_range,
    from_date,
    to_date,
    limit = 100,
  } = filters;
  const limitVal = Math.min(parseInt(limit, 10) || 100, 500);

  let query = `
    SELECT a.id, a.entity_type, a.entity_id, a.action, a.user_id, a.details, a.ip_address, a.created_at,
           u.username, u.full_name, u.role AS user_role,
           d.name AS department_name,
           req.request_id AS request_display_id,
           tpl.file_name AS template_file_name,
           doc.file_name AS document_file_name
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN requests req ON a.entity_type = 'request' AND a.entity_id = req.id::text
    LEFT JOIN templates tpl ON a.entity_type = 'template' AND a.entity_id = tpl.id::text
    LEFT JOIN documents doc ON a.entity_type = 'document' AND a.entity_id = doc.id::text
    WHERE 1=1
  `;
  const params = [];
  let n = 1;
  if (entity_type) {
    query += ` AND a.entity_type = $${n++}`;
    params.push(entity_type);
  }
  if (entity_id) {
    query += ` AND a.entity_id = $${n++}`;
    params.push(entity_id);
  }
  if (user_id) {
    query += ` AND a.user_id = $${n++}`;
    params.push(user_id);
  }
  if (request_id) {
    query += ` AND (req.request_id = $${n} OR (a.entity_type = 'request' AND a.entity_id IN (SELECT id::text FROM requests WHERE request_id = $${n})))`;
    params.push(request_id);
    n++;
  }
  if (date_range === 'today') {
    query += ` AND a.created_at >= CURRENT_DATE AND a.created_at < CURRENT_DATE + INTERVAL '1 day'`;
  } else if (date_range === 'week') {
    query += ` AND a.created_at >= NOW() - INTERVAL '7 days'`;
  } else if (date_range === 'month') {
    query += ` AND a.created_at >= NOW() - INTERVAL '30 days'`;
  } else if (from_date) {
    query += ` AND a.created_at >= $${n++}`;
    params.push(from_date);
  }
  if (to_date && !date_range) {
    query += ` AND a.created_at <= $${n++}`;
    params.push(to_date);
  }
  query += ` ORDER BY a.created_at DESC LIMIT $${n}`;
  params.push(limitVal);

  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows.map(mapRow);
  } finally {
    client.release();
  }
}

module.exports = { list };
