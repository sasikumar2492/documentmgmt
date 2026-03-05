/**
 * SFDT Modifier - Direct manipulation of Syncfusion Document JSON
 * Finds labels (e.g. "SOP No.:", "Effective Date:") and updates the value after the colon.
 * Also fills footer signatories table (Prepared By, Reviewed By, Approved By × Name, Designation, Signature, Date).
 */

export interface HeaderFieldValues {
  sopNo?: string;
  versionNo?: string;
  effectiveDate?: string;
  revisionDate?: string;
}

/** Signatory column: Name, Designation, Signature, Date */
export interface SignatoryValues {
  name?: string;
  designation?: string;
  signature?: string;
  date?: string;
}

export interface FooterFieldValues {
  preparedBy?: SignatoryValues;
  reviewedBy?: SignatoryValues;
  approvedBy?: SignatoryValues;
}

/** Label patterns to search for (with optional punctuation); value is the key in HeaderFieldValues */
const LABEL_PATTERNS: { pattern: RegExp; key: keyof HeaderFieldValues }[] = [
  { pattern: /SOP\s+No\.?\s*:?\s*/i, key: 'sopNo' },
  { pattern: /Version\s+No\.?\s*:?\s*/i, key: 'versionNo' },
  { pattern: /Effective\s+Date\s*:?\s*/i, key: 'effectiveDate' },
  { pattern: /Revision\s+Date\s*:?\s*/i, key: 'revisionDate' },
];

/**
 * Modify SFDT JSON: search for label keys and set the value after the colon.
 * Walks all sections, blocks, table cells, and headers so it works regardless of layout.
 */
export function updateHeaderFieldsInSFDT(sfdtJson: string, values: HeaderFieldValues): string {
  if (!values || Object.keys(values).length === 0) return sfdtJson;

  try {
    const sfdt = typeof sfdtJson === 'string' ? JSON.parse(sfdtJson) : sfdtJson;
    let sections = sfdt.sections ?? sfdt.document?.sections ?? sfdt.content?.sections;

    if (!sections || sections.length === 0) {
      return sfdtJson;
    }

    for (const section of sections) {
      const blocks: any[] = [];
      if (section.blocks?.length) blocks.push(...section.blocks);
      if (section.header?.blocks?.length) blocks.push(...section.header.blocks);
      if (section.footer?.blocks?.length) blocks.push(...section.footer.blocks);
      const hf = section.headersFooters;
      if (hf && typeof hf === 'object') {
        for (const v of Object.values(hf)) {
          if (v && typeof v === 'object' && Array.isArray((v as any).blocks))
            blocks.push(...(v as any).blocks);
        }
      }

      for (const block of blocks) {
        if (block.inlines) {
          replaceLabelValuesInBlock(block, values);
        }
        if (block.rows) {
          for (const row of block.rows) {
            if (!row.cells) continue;
            for (const cell of row.cells) {
              if (!cell.blocks) continue;
              for (const inner of cell.blocks) {
                if (inner.inlines) replaceLabelValuesInBlock(inner, values);
              }
            }
          }
        }
      }
    }

    return JSON.stringify(sfdt);
  } catch (error) {
    console.error('Error updating SFDT:', error);
    return sfdtJson;
  }
}

/** Row labels in the signatories table (first column) */
const SIGNATORY_ROW_LABELS = ['Name', 'Designation', 'Signature', 'Date'];
/** Column headers for signatory columns (after "Signatories") */
const SIGNATORY_COL_LABELS = ['Prepared By', 'Reviewed By', 'Approved By'];

function getCellText(cell: any): string {
  if (!cell) return '';
  
  // Try regular format first: cell.blocks[0].inlines[0].text
  if (cell.blocks?.length) {
    const textParts: string[] = [];
    for (const block of cell.blocks) {
      if (block.inlines?.length) {
        for (const inline of block.inlines) {
          // Some SFDT variants store content on `text`, others on `t`,
          // and some have both; include all non-null values.
          if (inline.text != null) textParts.push(inline.text);
          if (inline.t != null) textParts.push(inline.t);
        }
      }
    }
    if (textParts.length > 0) {
      return textParts.join('').trim();
    }
  }
  
  // Try optimized format: cell.b[0].i[0].t
  if (cell.b?.length) {
    const textParts: string[] = [];
    for (const block of cell.b) {
      // Try 'i' for inlines
      if (block.i?.length) {
        for (const inline of block.i) {
          if (inline.t != null) {
            textParts.push(inline.t);
          }
        }
      }
      // Also try 'inlines' in case of mixed format
      if (block.inlines?.length) {
        for (const inline of block.inlines) {
          if (inline.text != null) {
            textParts.push(inline.text);
          }
          if (inline.t != null) {
            textParts.push(inline.t);
          }
        }
      }
    }
    if (textParts.length > 0) {
      return textParts.join('').trim();
    }
  }
  
  return '';
}

function setCellText(cell: any, text: string): void {
  if (!cell) return;

  // Handle regular format (blocks, inlines, text)
  if (Array.isArray(cell.blocks) && cell.blocks.length > 0) {
    const firstBlock = cell.blocks[0];
    const firstInline = firstBlock.inlines?.[0];
    const format = firstInline?.characterFormat
      ? { ...firstInline.characterFormat }
      : {};

    firstBlock.inlines = [{ text: text || '', characterFormat: format }];
    return;
  }

  // Handle optimized format (b, i, t)
  if (Array.isArray(cell.b) && cell.b.length > 0) {
    const firstBlock = cell.b[0];
    
    // If it has 'i' (inlines in optimized format)
    if (Array.isArray(firstBlock.i) && firstBlock.i.length > 0) {
      const firstInline = firstBlock.i[0];
      const format = firstInline?.cf ? { ...firstInline.cf } : {};
      firstBlock.i = [{ t: text || '', cf: format }];
      return;
    }
    
    // If it has 'inlines' (mixed format)
    if (Array.isArray(firstBlock.inlines) && firstBlock.inlines.length > 0) {
      const firstInline = firstBlock.inlines[0];
      firstBlock.inlines = [{ t: text || '', text: text || '' }];
      return;
    }
  }

  // Create blocks if they don't exist (works for both formats)
  if (!Array.isArray(cell.blocks) || cell.blocks.length === 0) {
    cell.blocks = [
      {
        inlines: [
          {
            text: text || '',
            characterFormat: {},
          },
        ],
      },
    ];
  }
}

/**
 * Fill footer signatories table: find table with "Prepared By" / "Reviewed By" / "Approved By"
 * and rows "Name", "Designation", "Signature", "Date"; set cells by column and row.
 */
export function updateFooterFieldsInSFDT(sfdtJson: string, values: FooterFieldValues): string {
  if (!values || (!values.preparedBy && !values.reviewedBy && !values.approvedBy)) {
    return sfdtJson;
  }

  try {
    const sfdt = typeof sfdtJson === 'string' ? JSON.parse(sfdtJson) : sfdtJson;
    
    // Handle BOTH regular and optimized SFDT formats
    // Optimized format uses: sec (sections), b (blocks), r (rows), c (cells)
    // Regular format uses: sections, blocks, rows, cells
    let sections = sfdt.sections ?? sfdt.document?.sections ?? sfdt.content?.sections ?? sfdt.sec;
    
    if (!sections?.length) {
      return sfdtJson;
    }
    const columnKeys: (keyof FooterFieldValues)[] = ['preparedBy', 'reviewedBy', 'approvedBy'];
    const rowKeys: (keyof SignatoryValues)[] = ['name', 'designation', 'signature', 'date'];
    let tableFound = false;

    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];
      const blocks: any[] = [];
      
      // Handle optimized format (b) and regular format (blocks)
      const blockList = section.b ?? section.blocks;
      if (blockList?.length) blocks.push(...blockList);
      
      // Also check footer blocks
      const footerBlocks = section.footer?.b ?? section.footer?.blocks ?? section.fb;
      if (footerBlocks?.length) blocks.push(...footerBlocks);
      
      const hf = section.headersFooters ?? section.hf;
      if (hf && typeof hf === 'object') {
        for (const v of Object.values(hf)) {
          if (v && typeof v === 'object') {
            const vBlocks = (v as any).b ?? (v as any).blocks;
            if (Array.isArray(vBlocks)) blocks.push(...vBlocks);
          }
        }
      }

      for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
        const block = blocks[blockIdx];
        
        // Handle optimized format (r) and regular format (rows)
        const rows = block.r ?? block.rows;
        if (!rows?.length) continue;
        
        let headerRowIndex = -1;
        let colIndexByLabel: Record<string, number> = {};

        // Look through all rows for a header that contains our signatory columns.
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          // Handle optimized format (c) and regular format (cells)
          const cells = row.c ?? row.cells;
          if (!cells?.length) continue;
          
          const allText = cells.map((c: any) => getCellText(c)).join(' ');
          const rawJson = (() => {
            try {
              return JSON.stringify(cells);
            } catch {
              return '';
            }
          })();
          
          // Check if this row contains any of our signatory column labels.
          const hasSignatoryCols = SIGNATORY_COL_LABELS.some((l) => {
            const needle = l.toLowerCase();
            return (
              allText.toLowerCase().includes(needle) ||
              rawJson.toLowerCase().includes(needle)
            );
          });
          
          if (hasSignatoryCols) {
            headerRowIndex = r;
            // Map column index to label
            for (let c = 0; c < cells.length; c++) {
              const text = getCellText(cells[c]).toLowerCase();
              const cellJson = (() => {
                try {
                  return JSON.stringify(cells[c]).toLowerCase();
                } catch {
                  return '';
                }
              })();
              const key = SIGNATORY_COL_LABELS.find((l) => {
                const needle = l.toLowerCase();
                return text.includes(needle) || cellJson.includes(needle);
              });
              if (key) {
                colIndexByLabel[key] = c;
              }
            }
            break;
          }
        }

        if (headerRowIndex === -1) continue;
        if (Object.keys(colIndexByLabel).length === 0) continue;

        tableFound = true;
        const colIndexToKey: Record<number, keyof FooterFieldValues> = {};
        
        SIGNATORY_COL_LABELS.forEach((label, i) => {
          const idx = colIndexByLabel[label];
          if (idx != null) {
            colIndexToKey[idx] = columnKeys[i];
          }
        });

        // Update data rows (rows after the header).
        // SFDT exports for this table sometimes have unreliable row labels,
        // so we map by row order relative to the header:
        // row 1 -> Name, row 2 -> Designation, row 3 -> Signature, row 4 -> Date.
        for (let r = headerRowIndex + 1; r < rows.length; r++) {
          const row = rows[r];
          const cells = row.c ?? row.cells;
          if (!cells?.length || cells.length < 2) continue;

          const relativeRow = r - headerRowIndex - 1;
          if (relativeRow < 0 || relativeRow >= rowKeys.length) continue;

          const rowKey = rowKeys[relativeRow];
          // Update cells in this row for each signatory column
          for (let c = 1; c < cells.length; c++) {
            const colKey = colIndexToKey[c];
            if (!colKey) continue;
            
            const signatoryData = values[colKey] as SignatoryValues | undefined;
            const cellValue = signatoryData?.[rowKey];

            if (cellValue != null && cellValue !== '') {
              setCellText(cells[c], cellValue);
            }
          }
        }
      }
    }

    return JSON.stringify(sfdt);
  } catch (error) {
    return sfdtJson;
  }
}

/** Regex to find end of a value (next newline or next label) */
const END_OF_VALUE = /\n|(?=SOP\s+No\.?|Version\s+No\.?|Effective\s+Date|Revision\s+Date)/i;

/**
 * Get full text from a block's inlines, replace "label: oldValue" with "label: newValue", write back.
 */
function replaceLabelValuesInBlock(block: { inlines: any[] }, values: HeaderFieldValues): void {
  const inlines = block.inlines;
  if (!inlines?.length) return;

  const fullText = inlines
    .filter((i: any) => i.text != null)
    .map((i: any) => i.text)
    .join('');

  if (!fullText) return;

  let newText = fullText;
  let changed = false;

  for (const { pattern, key } of LABEL_PATTERNS) {
    const newValue = values[key];
    if (newValue == null || newValue === '') continue;

    const match = newText.match(pattern);
    if (!match) continue;

    const labelPart = match[0];
    const start = newText.indexOf(labelPart);
    const afterLabel = newText.slice(start + labelPart.length);
    const endMatch = afterLabel.match(END_OF_VALUE);
    const valueEnd = endMatch ? endMatch.index! : afterLabel.length;
    const before = newText.slice(0, start + labelPart.length);
    const rest = afterLabel.slice(valueEnd);

    newText = before + newValue + rest;
    changed = true;
  }

  if (!changed) return;

  const first = inlines[0];
  const format = first.characterFormat ? { ...first.characterFormat } : {};
  block.inlines.length = 0;
  block.inlines.push({ text: newText, characterFormat: format });
}

