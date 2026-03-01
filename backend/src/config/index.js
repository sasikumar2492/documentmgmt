require('dotenv').config();

module.exports = {
  db: {
    host: process.env.DATABASEHOST || 'localhost',
    port: parseInt(process.env.DATABASEPORT || '5432', 10),
    database: process.env.DATABASENAME || 'pharma_dms_test',
    user: process.env.DATABASEUSER || 'postgres',
    password: process.env.DATABASEPASSWORD || 'postgres',
  },
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  fileStoragePath: process.env.FILE_STORAGE_PATH || './uploads',
  /** Syncfusion Word Processor Server (Docker) - DOCX to SFDT. e.g. http://localhost:6002 */
  documentEditorServiceUrl: process.env.DOCUMENT_EDITOR_SERVICE_URL || '',
  /** AWS S3 for template file storage (optional). When set, templates are also uploaded to S3. */
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    prefix: process.env.AWS_S3_PREFIX || '', // e.g. "Pharma DMS" for folder under bucket
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};
