const formDataService = require('../services/formDataService');

async function getFormData(req, res) {
  try {
    const result = await formDataService.getByRequestId(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Form data get error:', err);
    res.status(500).json({ error: 'Failed to get form data' });
  }
}

async function putFormData(req, res) {
  try {
    const { data, formSectionsSnapshot } = req.body || {};
    const result = await formDataService.upsert(req.params.id, { data, formSectionsSnapshot });
    res.json(result);
  } catch (err) {
    console.error('Form data put error:', err);
    res.status(500).json({ error: 'Failed to save form data' });
  }
}

module.exports = { getFormData, putFormData };
