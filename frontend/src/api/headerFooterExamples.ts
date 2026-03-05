/**
 * EXAMPLE: API Endpoints and Response Structure for Header/Footer Data
 * 
 * This file shows example API endpoint structures that should be implemented
 * in the backend to support dynamic header/footer functionality.
 * 
 * NOTE: This is a reference implementation guide. Adjust based on your
 * actual backend structure and database schema.
 */

/**
 * Example API Response Types
 */
export interface HeaderFooterAPIResponse {
  success: boolean;
  data: {
    documentId: string;
    sopNo: string;
    versionNo: string;
    effectiveDate: string;
    revisionDate: string;
    signatoriesData: {
      preparedBy: SignatoryInfo;
      reviewedBy: SignatoryInfo;
      approvedBy: SignatoryInfo;
    };
  };
  error?: string;
}

export interface SignatoryInfo {
  name: string;
  designation: string;
  date?: string;
  signature?: string; // Base64 or URL to signature image (future enhancement)
}

/**
 * ============================================================================
 * EXAMPLE BACKEND ENDPOINTS
 * ============================================================================
 */

/**
 * OPTION 1: Dedicated Endpoint for Header/Footer
 * ================================================
 * 
 * GET /api/v1/documents/{documentId}/header-footer
 * 
 * Query Parameters:
 *   - requestId (optional): Request ID to fetch signatory data
 * 
 * Example Request:
 *   GET /api/v1/documents/doc-123/header-footer?requestId=req-456
 * 
 * Example Response (200 OK):
 * {
 *   "success": true,
 *   "data": {
 *     "documentId": "doc-123",
 *     "sopNo": "RSD-SOP-010",
 *     "versionNo": "00",
 *     "effectiveDate": "15-Feb-2026",
 *     "revisionDate": "",
 *     "signatoriesData": {
 *       "preparedBy": {
 *         "name": "John Smith",
 *         "designation": "Quality Lead",
 *         "date": ""
 *       },
 *       "reviewedBy": {
 *         "name": "Sarah Johnson",
 *         "designation": "Manager",
 *         "date": ""
 *       },
 *       "approvedBy": {
 *         "name": "David Lee",
 *         "designation": "VP Operations",
 *         "date": ""
 *       }
 *     }
 *   }
 * }
 */

/**
 * OPTION 2: Extend Document Listing Endpoint
 * ============================================
 * 
 * GET /api/v1/documents/{documentId}
 * 
 * Include header/footer data in main document response:
 * 
 * Example Response:
 * {
 *   "id": "doc-123",
 *   "title": "RSD-SOP-010 Live Demo of Application.doc",
 *   "department": "Engineering",
 *   "status": "draft",
 *   "createdAt": "2026-02-15T10:00:00Z",
 *   "headerFooter": {
 *     "sopNo": "RSD-SOP-010",
 *     "versionNo": "00",
 *     "effectiveDate": "15-Feb-2026",
 *     "revisionDate": "",
 *     "signatoriesData": {
 *       "preparedBy": { ... },
 *       "reviewedBy": { ... },
 *       "approvedBy": { ... }
 *     }
 *   }
 * }
 */

/**
 * OPTION 3: Template Metadata Endpoint
 * ====================================
 * 
 * GET /api/v1/templates/{templateId}/metadata
 * 
 * Fetch default header/footer configuration from the template:
 * 
 * Example Response:
 * {
 *   "templateId": "tmpl-123",
 *   "defaultHeaderFooter": {
 *     "sopNo": "RSD-SOP-010",
 *     "versionNo": "00",
 *     "signatureFields": ["preparedBy", "reviewedBy", "approvedBy"]
 *   }
 * }
 */

/**
 * ============================================================================
 * EXAMPLE EXPRESS.JS BACKEND IMPLEMENTATION
 * ============================================================================
 */

/**
 * Example Express.js route handler:
 * 
 * // File: routes/documents.js
 * 
 * router.get('/:documentId/header-footer', async (req, res) => {
 *   try {
 *     const { documentId } = req.params;
 *     const { requestId } = req.query;
 *     
 *     // Fetch document metadata
 *     const doc = await Document.findById(documentId);
 *     if (!doc) {
 *       return res.status(404).json({ success: false, error: 'Document not found' });
 *     }
 *     
 *     // Fetch header footer data
 *     const headerFooter = await DocumentHeaderFooter.findOne({ documentId });
 *     
 *     // If request-specific signatories, fetch those
 *     let signatoriesData = {
 *       preparedBy: { name: '', designation: '', date: '' },
 *       reviewedBy: { name: '', designation: '', date: '' },
 *       approvedBy: { name: '', designation: '', date: '' }
 *     };
 *     
 *     if (requestId) {
 *       const request = await Request.findById(requestId)
 *         .populate('preparedBy reviewedBy approvedBy');
 *       
 *       if (request) {
 *         signatoriesData = {
 *           preparedBy: {
 *             name: request.preparedBy?.name || '',
 *             designation: request.preparedBy?.designation || '',
 *             date: request.preparedDate?.toISOString().split('T')[0] || ''
 *           },
 *           reviewedBy: {
 *             name: request.reviewedBy?.name || '',
 *             designation: request.reviewedBy?.designation || '',
 *             date: request.reviewedDate?.toISOString().split('T')[0] || ''
 *           },
 *           approvedBy: {
 *             name: request.approvedBy?.name || '',
 *             designation: request.approvedBy?.designation || '',
 *             date: request.approvedDate?.toISOString().split('T')[0] || ''
 *           }
 *         };
 *       }
 *     }
 *     
 *     return res.json({
 *       success: true,
 *       data: {
 *         documentId,
 *         sopNo: headerFooter?.sopNo || doc.sopNo || '',
 *         versionNo: headerFooter?.versionNo || doc.version || '00',
 *         effectiveDate: headerFooter?.effectiveDate || '',
 *         revisionDate: headerFooter?.revisionDate || '',
 *         signatoriesData
 *       }
 *     });
 *   } catch (error) {
 *     console.error('Error fetching header/footer:', error);
 *     res.status(500).json({ success: false, error: 'Internal server error' });
 *   }
 * });
 */

/**
 * ============================================================================
 * FRONTEND USAGE EXAMPLE
 * ============================================================================
 * 
 * Add this to your API client (src/api/client.ts or similar):
 * 
 * ```typescript
 * import { HeaderFooterAPIResponse } from './types';
 * 
 * export const fetchHeaderFooterData = async (
 *   documentId: string,
 *   requestId?: string
 * ): Promise<HeaderFooterAPIResponse['data']> => {
 *   const response = await apiClient.get(
 *     `/documents/${documentId}/header-footer`,
 *     { params: requestId ? { requestId } : {} }
 *   );
 *   return response.data.data;
 * };
 * ```
 * 
 * Then use in your component:
 * 
 * ```typescript
 * const handleApplyHeaderFooter = async () => {
 *   try {
 *     const data = await fetchHeaderFooterData(templateId, requestId);
 *     applyHeaderFooterToDocument(editor, data, data);
 *   } catch (error) {
 *     console.error('Error applying dynamic header/footer:', error);
 *     // Fall back to defaults
 *   }
 * };
 * ```
 */

/**
 * ============================================================================
 * DJANGO EXAMPLE (if using Django backend)
 * ============================================================================
 */

/**
 * # Example models.py
 * 
 * class DocumentHeaderFooter(models.Model):
 *     document = models.OneToOneField(Document, on_delete=models.CASCADE)
 *     sop_no = models.CharField(max_length=255, blank=True)
 *     version_no = models.CharField(max_length=50, blank=True)
 *     effective_date = models.DateField(null=True, blank=True)
 *     revision_date = models.DateField(null=True, blank=True)
 *     
 *     created_at = models.DateTimeField(auto_now_add=True)
 *     updated_at = models.DateTimeField(auto_now=True)
 *     
 *     class Meta:
 *         db_table = 'document_header_footer'
 * 
 * # Example views.py
 * 
 * from rest_framework.decorators import api_view
 * from rest_framework.response import Response
 * 
 * @api_view(['GET'])
 * def get_header_footer(request, document_id):
 *     try:
 *         doc = Document.objects.get(id=document_id)
 *         header_footer = DocumentHeaderFooter.objects.get(document=doc)
 *         
 *         return Response({
 *             'success': True,
 *             'data': {
 *                 'documentId': str(doc.id),
 *                 'sopNo': header_footer.sop_no,
 *                 'versionNo': header_footer.version_no,
 *                 'effectiveDate': header_footer.effective_date.strftime('%d-%b-%Y'),
 *                 'revisionDate': header_footer.revision_date.strftime('%d-%b-%Y') if header_footer.revision_date else '',
 *                 'signatoriesData': get_signatories(document_id, request.query_params.get('requestId'))
 *             }
 *         })
 *     except Exception as e:
 *         return Response({'success': False, 'error': str(e)}, status=400)
 */

/**
 * ============================================================================
 * NOTES FOR IMPLEMENTATION
 * ============================================================================
 * 
 * 1. CACHING
 *    Consider caching header/footer data at the template level to avoid
 *    repeated database queries for commonly used documents.
 * 
 * 2. VERSIONING
 *    If documents have multiple versions, ensure you fetch the correct
 *    header/footer version corresponding to the document version.
 * 
 * 3. SIGNATORY MANAGEMENT
 *    Consider implementing a separate table/collection for signatories
 *    that can be managed independently from documents.
 * 
 * 4. AUDIT TRAIL
 *    Track header/footer changes in an audit log for compliance purposes,
 *    especially for regulated industries (pharma, manufacturing, etc).
 * 
 * 5. LOCALIZATION
 *    If supporting multiple languages/regions, make header/footer
 *    content translatable and locale-aware.
 * 
 * 6. PERFORMANCE
 *    Index frequently queried fields (documentId, templateId) in the
 *    database for faster retrieval.
 * 
 * 7. VALIDATION
 *    Validate all header/footer data on the backend before storing.
 *    Sanitize dates, remove XSS attempts, etc.
 */

export const API_EXAMPLES = {
  ENDPOINT_1: '/api/v1/documents/{documentId}/header-footer',
  ENDPOINT_2: '/api/v1/documents/{documentId}',
  ENDPOINT_3: '/api/v1/templates/{templateId}/metadata'
};
