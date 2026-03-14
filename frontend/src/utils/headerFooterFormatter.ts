/**
 * Header & Footer Formatter for Syncfusion Documents
 * Provides utilities to insert and manage headers and footers with dynamic content
 */

export interface HeaderFooterData {
  // Header fields
  sopNo: string;
  versionNo: string;
  effectiveDate: string;
  revisionDate: string;

  // Footer fields
  preparedByName: string;
  preparedByDesignation: string;
  preparedBySignature: string;
  preparedByDate: string;

  reviewedByName: string;
  reviewedByDesignation: string;
  reviewedBySignature: string;
  reviewedByDate: string;

  approvedByName: string;
  approvedByDesignation: string;
  approvedBySignature: string;
  approvedByDate: string;
}

/**
 * Default static header/footer data for development
 * Will be replaced with database values later
 */
export const DEFAULT_HEADER_FOOTER_DATA: HeaderFooterData = {
  // Header fields
  sopNo: 'RSD-SOP-010',
  versionNo: '00',
  effectiveDate: '15-Feb-2026',
  revisionDate: '',

  // Footer fields - Prepared By
  preparedByName: 'John Smith',
  preparedByDesignation: 'Quality Lead',
  preparedBySignature: '',
  preparedByDate: '',

  // Footer fields - Reviewed By
  reviewedByName: 'Sarah Johnson',
  reviewedByDesignation: 'Department Manager',
  reviewedBySignature: '',
  reviewedByDate: '',

  // Footer fields - Approved By
  approvedByName: 'David Lee',
  approvedByDesignation: 'VP Operations',
  approvedBySignature: '',
  approvedByDate: '',
};

/**
 * Applies header and footer to a Syncfusion document
 * Uses Syncfusion's native header/footer editing API
 *
 * @param editor The Syncfusion DocumentEditor instance
 * @param headerData Header information to insert
 * @param footerData Footer information to insert
 */
export function applyHeaderFooterToDocument(
  editor: any,
  headerData: Partial<HeaderFooterData>,
  footerData: Partial<HeaderFooterData>
): void {
  try {
    console.log('=== applyHeaderFooterToDocument called ===');
    console.log('Header data:', headerData);
    console.log('Footer data:', footerData);
    
    if (!editor) {
      console.warn('Editor not found');
      return;
    }

    // Access document through proper Syncfusion path
    const doc = editor.documentHelper?.document;
    if (!doc) {
      console.warn('Document not found');
      return;
    }

    const sections = doc.sections;
    if (!sections || sections.length === 0) {
      console.warn('⚠️ No sections found in document - creating header/footer through API');
      
      // Try alternative approach: use Syncfusion's API to insert header/footer
      try {
        insertHeaderViaAPI(editor, headerData);
        insertFooterViaAPI(editor, footerData);
        console.log('✓ Header/footer inserted via API');
      } catch (apiError) {
        console.error('API method also failed:', apiError);
      }
      return;
    }

    // Apply header and footer to first section
    const section = sections[0];
    if (section) {
      // Update header
      updateHeader(section, headerData);

      // Update footer
      updateFooter(section, footerData);
      
      console.log('✓ Header/footer updated successfully');
    }

    // Refresh the document
    if (editor.documentHelper && typeof editor.documentHelper.updateZoomFactor === 'function') {
      editor.documentHelper.updateZoomFactor(editor.zoomFactor);
    }
  } catch (error) {
    console.error('Error applying header/footer to document:', error);
  }
}

/**
 * Insert header using Syncfusion API
 */
function insertHeaderViaAPI(editor: any, data: Partial<HeaderFooterData>): void {
  try {
    const headerText = buildHeaderText(data);
    // Try to use insertTextInHeader if available
    if (editor.insertText) {
      editor.insertText(headerText);
    }
  } catch (error) {
    console.error('Error inserting header via API:', error);
  }
}

/**
 * Insert footer using Syncfusion API
 */
function insertFooterViaAPI(editor: any, data: Partial<HeaderFooterData>): void {
  try {
    const footerText = buildFooterText(data);
    // Implementation would go here
  } catch (error) {
    console.error('Error inserting footer via API:', error);
  }
}

/**
 * Updates header content in a section
 */
function updateHeader(section: any, data: Partial<HeaderFooterData>): void {
  try {
    // Access header body
    const headerBody = section.headerStart?.body;
    if (!headerBody) {
      console.warn('Header body not accessible');
      return;
    }

    // Clear existing content
    if (headerBody.childNodes) {
      headerBody.childNodes.length = 0;
    }

    // Build header content
    const headerText = buildHeaderText(data);

    // Add paragraphs for each line
    const lines = headerText.split('\n');
    lines.forEach((line: string) => {
      if (line.trim()) {
        const paragraph = createParagraph(line);
        headerBody.appendChild(paragraph);
      }
    });

    console.log('✓ Header updated');
  } catch (error) {
    console.error('Error updating header:', error);
  }
}

/**
 * Updates footer content in a section
 */
function updateFooter(section: any, data: Partial<HeaderFooterData>): void {
  try {
    // Access footer body
    const footerBody = section.footerStart?.body;
    if (!footerBody) {
      console.warn('Footer body not accessible');
      return;
    }

    // Clear existing content
    if (footerBody.childNodes) {
      footerBody.childNodes.length = 0;
    }

    // Build footer content
    const footerText = buildFooterText(data);

    // Add paragraphs for each line
    const lines = footerText.split('\n');
    lines.forEach((line: string) => {
      const paragraph = createParagraph(line);
      footerBody.appendChild(paragraph);
    });

    console.log('✓ Footer updated');
  } catch (error) {
    console.error('Error updating footer:', error);
  }
}

/**
 * Creates a paragraph element for document content
 */
function createParagraph(text: string): any {
  return {
    type: 'Paragraph',
    childNodes: [
      {
        type: 'Run',
        text: text,
        characterFormat: {
          fontSize: 10,
          fontFamily: 'Calibri',
        },
      },
    ],
  };
}

/**
 * Builds header text from data
 * @param data Header data
 * @returns Formatted header text
 */
function buildHeaderText(data: Partial<HeaderFooterData>): string {
  const sopNo = data.sopNo || 'RSD-SOP-010';
  const version = data.versionNo || '00';
  const effectiveDate = data.effectiveDate || new Date().toLocaleDateString('en-GB');
  const revisionDate = data.revisionDate || '';

  const lines = [
    `SOP No.: ${sopNo}`,
    // `Version No.: ${version}`,
    `Effective Date: ${effectiveDate}`,
  ];

  // if (revisionDate) {
  //   lines.push(`Revision Date: ${revisionDate}`);
  // }

  return lines.join('\n');
}

/**
 * Builds footer text with signature table
 * @param data Footer data
 * @returns Formatted footer text
 */
function buildFooterText(data: Partial<HeaderFooterData>): string {
  const preparedName = data.preparedByName || '[Name]';
  const preparedDesignation = data.preparedByDesignation || '[Designation]';
  const preparedDate = data.preparedByDate || '[Date]';

  const reviewedName = data.reviewedByName || '[Name]';
  const reviewedDesignation = data.reviewedByDesignation || '[Designation]';
  const reviewedDate = data.reviewedByDate || '[Date]';

  const approvedName = data.approvedByName || '[Name]';
  const approvedDesignation = data.approvedByDesignation || '[Designation]';
  const approvedDate = data.approvedByDate || '[Date]';

  return `Signatories

Prepared By                          Reviewed By                          Approved By
Name: ${preparedName}                Name: ${reviewedName}                Name: ${approvedName}
Designation: ${preparedDesignation}  Designation: ${reviewedDesignation}  Designation: ${approvedDesignation}
Signature: _______________           Signature: _______________           Signature: _______________
Date: ${preparedDate}                Date: ${reviewedDate}                Date: ${approvedDate}`;
}


/**
 * Merge partial data with default values
 * @param customData The custom header/footer data
 * @returns Complete header/footer data with defaults
 */
export function mergeWithDefaults(customData: Partial<HeaderFooterData>): HeaderFooterData {
  return {
    ...DEFAULT_HEADER_FOOTER_DATA,
    ...customData
  };
}

/**
 * Fallback: Update existing header/footer fields in document content
 * Uses direct table cell manipulation to update field values
 * @param editor Syncfusion DocumentEditor instance
 * @param headerData Header data to insert
 * @param footerData Footer data to insert
 */
export function insertHeaderFooterAsContent(
  editor: any,
  headerData: Partial<HeaderFooterData>,
  footerData?: Partial<HeaderFooterData>
): void {
  try {
    if (!editor) {
      console.warn('Editor not available');
      return;
    }

    console.log('=== insertHeaderFooterAsContent: Starting field updates ===');
    console.log('Data:', headerData);

    // Access the document structure
    const doc = editor.documentHelper?.document;
    if (!doc || !doc.sections || doc.sections.length === 0) {
      console.error('Cannot access document structure');
      return;
    }

    const section = doc.sections[0];
    if (!section.blocks || section.blocks.length === 0) {
      console.error('No blocks in section');
      return;
    }

    // Find the first table in the document (header table)
    let headerTable = null;
    for (const block of section.blocks) {
      if (block.blockType === 'Table' || block.rows) {
        headerTable = block;
        console.log('Found header table with', block.rows?.length, 'rows');
        break;
      }
    }

    if (!headerTable || !headerTable.rows) {
      console.error('Header table not found in document');
      return;
    }

    // Update table cells
    try {
      // Iterate through table rows to find and update cells
      for (const row of headerTable.rows) {
        if (!row.cells) continue;
        
        for (const cell of row.cells) {
          if (!cell.blocks) continue;
          
          // Check each paragraph in the cell
          for (const block of cell.blocks) {
            if (block.inlines) {
              const cellText = getCellText(block);
              
              // Update Effective Date cell (if the adjacent cell contains "Effective Date:")
              if (cellText.includes('Effective Date:') && headerData.effectiveDate) {
                // Insert the date into this cell or the next cell
                insertTextIntoCell(block, headerData.effectiveDate);
                console.log('✓ Updated Effective Date');
              }
              
              // Update Revision Date cell
              if (cellText.includes('Revision Date:') && headerData.revisionDate) {
                insertTextIntoCell(block, headerData.revisionDate);
                console.log('✓ Updated Revision Date');
              }
            }
          }
        }
      }
      
      console.log('✓ Table cells updated');
    } catch (e) {
      console.error('Error updating table cells:', e);
    }

    console.log('=== Field update complete ===');
  } catch (error) {
    console.error('insertHeaderFooterAsContent: Error:', error);
  }
}

/**
 * Get text content from a cell block
 */
function getCellText(block: any): string {
  if (!block.inlines) return '';
  return block.inlines
    .filter((inline: any) => inline.text)
    .map((inline: any) => inline.text)
    .join('');
}

/**
 * Insert text into a cell block
 */
function insertTextIntoCell(block: any, text: string): void {
  if (!block.inlines) {
    block.inlines = [];
  }
  
  // Add a text run with the new text
  block.inlines.push({
    text: ' ' + text,
    characterFormat: {}
  });
}
