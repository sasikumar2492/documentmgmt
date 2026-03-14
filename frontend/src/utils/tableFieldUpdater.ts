/**
 * Table Field Updater - Direct value replacement after colons
 * Searches for labels and updates values that follow the colon
 */

export interface TableFieldValues {
  sopNo?: string;
  versionNo?: string;
  effectiveDate?: string;
  revisionDate?: string;
}

// Label variants to try (document may use "SOP No." or "SOP No", etc.)
const LABEL_VARIANTS: Record<keyof TableFieldValues, string[]> = {
  sopNo: ['SOP No.', 'SOP No'],
  versionNo: ['Version No.', 'Version No'],
  effectiveDate: ['Effective Date:', 'Effective Date'],
  revisionDate: ['Revision Date:', 'Revision Date'],
};

/**
 * Update header table field values in a loaded Syncfusion document
 * Searches for label keys and updates values after the colon
 * @param editor Syncfusion DocumentEditor instance
 * @param values Field values to update
 */
export function updateTableFields(editor: any, values: TableFieldValues): void {
  try {
    if (!editor || !editor.search || !editor.selection || !editor.editor) {
      console.error('❌ Editor not ready');
      return;
    }

    console.log('=== Starting table field updates ===');
    console.log('Values:', values);

    // Update each field by searching for the label text (try multiple variants)
    if (values.sopNo) {
      updateFieldByLabel(editor, LABEL_VARIANTS.sopNo, values.sopNo);
    }

    if (values.versionNo) {
      updateFieldByLabel(editor, LABEL_VARIANTS.versionNo, values.versionNo);
    }

    if (values.effectiveDate) {
      updateFieldByLabel(editor, LABEL_VARIANTS.effectiveDate, values.effectiveDate);
    }

    // if (values.revisionDate) {
    //   updateFieldByLabel(editor, LABEL_VARIANTS.revisionDate, values.revisionDate);
    // }

    console.log('=== Table field updates complete ===');
  } catch (error) {
    console.error('❌ Error updating table fields:', error);
  }
}

/**
 * Find a label (trying variants) and update the value after the colon.
 * Note: editor.search.find() returns void; we detect success by selecting the line and checking text.
 */
function updateFieldByLabel(editor: any, labelVariants: string[], newValue: string): void {
  try {
    for (const variant of labelVariants) {
      editor.selection.moveToDocumentStart();
      editor.search.find(variant, 'None');
      editor.selection.selectLine();
      const fullText = (editor.selection.text || '').trim();

      // Check if this line contains the label (find() may not move cursor if text is in table/header)
      const hasLabel = labelVariants.some((v) => fullText.includes(v)) || fullText.includes('SOP No') || fullText.includes('Version No') || fullText.includes('Effective Date') || fullText.includes('Revision Date');
      if (!hasLabel || !fullText) continue;

      const colonIndex = fullText.indexOf(':');
      if (colonIndex === -1) continue;

      const labelPart = fullText.substring(0, colonIndex + 1).trimEnd();
      const newText = `${labelPart} ${newValue}`;
      editor.editor.insertText(newText);
      console.log(`✓ Updated "${variant}" → "${newValue}"`);
      return;
    }
    console.log(`⚠ Label not found (tried: ${labelVariants.join(', ')})`);
  } catch (error) {
    console.error(`❌ Error updating field:`, error);
  }
}
