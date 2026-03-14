/**
 * Utility to process Syncfusion Document Format (SFDT) to remove 
 * track changes / revisions before export. This ensures downloaded
 * documents show clean, accepted content without change markup.
 * 
 * The original SFDT is not modified (creates a deep copy).
 */

interface RevisionProperties {
  [key: string]: any;
}

interface CharacterFormat {
  revisions?: RevisionProperties[];
  [key: string]: any;
}

interface Inline {
  characterFormat?: CharacterFormat;
  revisions?: RevisionProperties[];
  [key: string]: any;
}

interface ParagraphFormat {
  revisions?: RevisionProperties[];
  [key: string]: any;
}

interface Paragraph {
  paragraphFormat?: ParagraphFormat;
  inlines?: Inline[];
  revisions?: RevisionProperties[];
  [key: string]: any;
}

interface Section {
  blocks?: Paragraph[];
  [key: string]: any;
}

interface SfdtDocument {
  sections?: Section[];
  revisions?: RevisionProperties[];
  [key: string]: any;
}

/**
 * Deep clone an object to ensure original SFDT is not mutated
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (clonedObj as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

/**
 * Remove all revision tracking from a character format object.
 * This cleans formatting markup that indicates deleted/inserted/changed text.
 */
function cleanCharacterFormat(format: CharacterFormat): CharacterFormat {
  if (!format) return format;
  
  const cleaned = { ...format };
  
  // Remove revision tracking
  if (cleaned.revisions) {
    delete cleaned.revisions;
  }
  // Remove revision properties that might be set
  if (cleaned.revisionsColor) {
    delete cleaned.revisionsColor;
  }
  
  return cleaned;
}

/**
 * Remove all track changes from inline elements (text runs).
 * Creates a new array without mutation.
 */
function cleanInlines(inlines: Inline[] | undefined): Inline[] | undefined {
  if (!inlines || !Array.isArray(inlines)) return inlines;
  
  return inlines.map(inline => {
    const cleaned = { ...inline };
    
    // Remove revisions
    if (cleaned.revisions) {
      delete cleaned.revisions;
    }
    
    // Clean character format
    if (cleaned.characterFormat) {
      cleaned.characterFormat = cleanCharacterFormat(cleaned.characterFormat);
    }
    
    return cleaned;
  });
}

/**
 * Remove all track changes from paragraph format.
 * Returns cleaned format without mutation.
 */
function cleanParagraphFormat(format: ParagraphFormat | undefined): ParagraphFormat | undefined {
  if (!format) return format;
  
  const cleaned = { ...format };
  
  // Remove revision tracking
  if (cleaned.revisions) {
    delete cleaned.revisions;
  }
  
  return cleaned;
}

/**
 * Remove all track changes from a single paragraph.
 * This includes both paragraph-level changes and all inline element changes.
 */
function cleanParagraph(paragraph: Paragraph): Paragraph {
  const cleaned = { ...paragraph };
  
  // Remove paragraph-level revisions
  if (cleaned.revisions) {
    delete cleaned.revisions;
  }
  
  // Clean paragraph format
  if (cleaned.paragraphFormat) {
    cleaned.paragraphFormat = cleanParagraphFormat(cleaned.paragraphFormat);
  }
  
  // Clean all inlines
  if (cleaned.inlines) {
    cleaned.inlines = cleanInlines(cleaned.inlines);
  }
  
  return cleaned;
}

/**
 * Remove all track changes from a section's blocks (paragraphs).
 * Returns cleaned blocks array.
 */
function cleanBlocks(blocks: Paragraph[] | undefined): Paragraph[] | undefined {
  if (!blocks || !Array.isArray(blocks)) return blocks;
  
  return blocks.map(block => cleanParagraph(block));
}

/**
 * Remove all track changes from a section.
 */
function cleanSection(section: Section): Section {
  const cleaned = { ...section };
  
  // Remove section-level revisions if any
  if (cleaned.revisions) {
    delete cleaned.revisions;
  }
  
  // Clean all blocks in section
  if (cleaned.blocks) {
    cleaned.blocks = cleanBlocks(cleaned.blocks);
  }
  
  return cleaned;
}

/**
 * Main function: Accept all changes in SFDT by removing all revision tracking.
 * 
 * This creates a new SFDT object with all revision metadata stripped, ensuring
 * that the exported document shows only "accepted" content without any
 * track changes markup or revision indicators.
 * 
 * @param sfdtJsonString - The SFDT JSON string from the document
 * @returns New SFDT JSON string with all revisions removed, or original if parsing fails
 * 
 * @example
 * const cleanSfdt = acceptAllChangesInSfdt(originalSfdt);
 * const docxBlob = await exportSfdtToDocx(cleanSfdt, fileName);
 */
export function acceptAllChangesInSfdt(sfdtJsonString: string): string {
  if (!sfdtJsonString || typeof sfdtJsonString !== 'string') {
    return sfdtJsonString;
  }
  
  try {
    // Parse the SFDT
    const document: SfdtDocument = JSON.parse(sfdtJsonString);
    
    // Create a deep clone to avoid mutating original
    const cleaned = deepClone(document);
    
    // Remove top-level revisions
    if (cleaned.revisions) {
      delete cleaned.revisions;
    }
    
    // Clean all sections
    if (cleaned.sections && Array.isArray(cleaned.sections)) {
      cleaned.sections = cleaned.sections.map(section => cleanSection(section));
    }
    
    // Convert back to JSON string
    return JSON.stringify(cleaned);
  } catch (error) {
    console.warn('Failed to accept changes in SFDT, returning original', error);
    return sfdtJsonString;
  }
}

/**
 * Alternative approach: Remove revision-related content while preserving structure.
 * This is more aggressive and ensures no revision markup remains.
 * 
 * Use this if acceptAllChangesInSfdt doesn't fully remove all change indicators.
 */
export function cleanAllRevisionsInSfdt(sfdtJsonString: string): string {
  if (!sfdtJsonString || typeof sfdtJsonString !== 'string') {
    return sfdtJsonString;
  }
  
  try {
    let cleaned = sfdtJsonString;
    
    // Remove any revision-related properties via regex
    // This is a fallback approach for edge cases
    cleaned = cleaned.replace(/"revisions":\s*\[[^\]]*\]/g, '"revisions":[]');
    cleaned = cleaned.replace(/"revisionsColor":\s*"[^"]*"/g, '"revisionsColor":""');
    cleaned = cleaned.replace(/"trackChange":\s*true/g, '"trackChange":false');
    
    // Verify it's still valid JSON
    JSON.parse(cleaned);
    return cleaned;
  } catch (error) {
    console.warn('Failed to clean all revisions, returning original', error);
    return sfdtJsonString;
  }
}
