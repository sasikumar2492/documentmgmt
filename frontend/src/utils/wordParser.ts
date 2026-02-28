import { FormSection, FormField } from '../types/index';

// Parse Word (.docx) file and convert to form sections organized by pages
export const parseWordToFormSections = async (file: File): Promise<FormSection[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        const sections: FormSection[] = [];
        
        console.log('📄 Processing Word Document...');
        
        // Extract everything in one pass to avoid memory issues
        const { text, headers, footers } = await extractAllFromDocx(arrayBuffer);
        
        // Split by page breaks
        const pages = text.split('<<<PAGE_BREAK>>>').filter(page => page.trim());
        
        // If no page breaks found, treat entire document as one page
        const documentPages = pages.length > 0 ? pages : [text];
        
        console.log(`   Detected ${documentPages.length} page(s) in the document`);
        
        // Process each page
        for (let pageNum = 0; pageNum < documentPages.length; pageNum++) {
          const pageText = documentPages[pageNum];
          const lines = pageText.split('\n').filter(line => line.trim());
          
          console.log(`   📄 Page ${pageNum + 1}: ${lines.length} lines`);
          
          const fields: FormField[] = [];
          let fieldCounter = 0;
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (!line) continue;
            
            // Check for label:value pattern
            if (line.includes(':') && !line.endsWith(':')) {
              const colonIndex = line.indexOf(':');
              const label = line.substring(0, colonIndex).trim();
              const value = line.substring(colonIndex + 1).trim();
              
              // Only treat as label:value if label is reasonably short
              if (label.length > 0 && label.length < 80 && value.length > 0) {
                let fieldType: FormField['type'] = 'text';
                
                // Detect field type
                if (label.toLowerCase().includes('date')) {
                  fieldType = 'date';
                } else if (
                  label.toLowerCase().includes('number') || 
                  label.toLowerCase().includes('quantity') ||
                  label.toLowerCase().includes('amount') ||
                  label.toLowerCase().includes('price') ||
                  label.toLowerCase().includes('cost') ||
                  label.toLowerCase().includes('weight') ||
                  (!isNaN(Number(value)) && value.length < 15)
                ) {
                  fieldType = 'number';
                } else if (
                  label.toLowerCase().includes('description') ||
                  label.toLowerCase().includes('notes') ||
                  label.toLowerCase().includes('comments') ||
                  label.toLowerCase().includes('remarks') ||
                  label.toLowerCase().includes('details') ||
                  label.toLowerCase().includes('address') ||
                  value.length > 100
                ) {
                  fieldType = 'textarea';
                } else if (value.toLowerCase().match(/^(yes|no|true|false)$/)) {
                  fieldType = 'checkbox';
                }
                
                fields.push({
                  id: `field_word_${pageNum}_${fieldCounter++}`,
                  label: label,
                  type: fieldType,
                  value: value,
                  required: label.includes('*') || label.toLowerCase().includes('required')
                });
                continue;
              }
            }
            
            // Check for table-like patterns (tab or multiple spaces)
            if (line.includes('\t') || /\s{3,}/.test(line)) {
              const parts = line.split(/\t|\s{3,}/).filter(p => p.trim());
              if (parts.length >= 2) {
                const label = parts[0].trim();
                const value = parts.slice(1).join(' ').trim();
                
                fields.push({
                  id: `field_word_${pageNum}_${fieldCounter++}`,
                  label: label,
                  type: value.length > 100 ? 'textarea' : 'text',
                  value: value,
                  required: false
                });
                continue;
              }
            }
            
            // If line ends with colon, it's a label without value
            if (line.endsWith(':') || line.endsWith('?')) {
              fields.push({
                id: `field_word_${pageNum}_${fieldCounter++}`,
                label: line.replace(/:$/, '').replace(/\?$/, '').trim(),
                type: 'text',
                value: '',
                required: line.includes('*')
              });
              continue;
            }
            
            // Regular content line - create as text field if it's substantial
            if (line.length > 5) {
              fields.push({
                id: `field_word_${pageNum}_${fieldCounter++}`,
                label: line.length > 50 ? line.substring(0, 50) + '...' : line,
                type: line.length > 100 ? 'textarea' : 'text',
                value: line,
                required: false
              });
            }
          }
          
          // Add page as a section
          if (fields.length > 0) {
            // Mock images for demonstration as Fields
            if (sections.length === 0) {
              fields.splice(2, 0, {
                id: `img_field_word_${pageNum}_1`,
                label: 'Technical Diagram 1',
                type: 'image',
                value: 'https://images.unsplash.com/photo-1721244654346-9be0c0129e36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                required: false
              });
            }

            sections.push({
              id: `page_word_${pageNum}`,
              title: `Page ${pageNum + 1}`,
              fields: fields,
              header: headers.length > 0 ? headers[0] : undefined, // Use first header for all pages
              footer: footers.length > 0 ? footers[0] : undefined  // Use first footer for all pages
            });
            
            console.log(`     ✅ Created page with ${fields.length} fields`);
          }
        }
        
        // If no sections found, create a default one
        if (sections.length === 0) {
          sections.push({
            id: 'section_default',
            title: 'Page 1',
            fields: [
              {
                id: 'field_default_1',
                label: 'Note',
                type: 'textarea',
                value: text || 'No content extracted from Word document. Please ensure the file is a valid .docx file.',
                required: false
              }
            ]
          });
        }
        
        console.log('\n📄 Word Parsing Complete:');
        console.log(`✅ Total pages: ${sections.length}`);
        console.log(`✅ Total fields: ${sections.reduce((sum, s) => sum + s.fields.length, 0)}`);
        sections.forEach((section, idx) => {
          console.log(`   ${idx + 1}. ${section.title} (${section.fields.length} fields)`);
        });
        console.log('');
        
        resolve(sections);
      } catch (error) {
        console.error('Error parsing Word file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Extract everything in one pass to avoid memory issues
async function extractAllFromDocx(arrayBuffer: ArrayBuffer): Promise<{ text: string, headers: string[], footers: string[] }> {
  try {
    const JSZip = (await import('jszip')).default;
    
    // Load the zip file with limited memory usage
    const zip = await JSZip.loadAsync(arrayBuffer, {
      createFolders: false,
      checkCRC32: false // Skip CRC check for faster loading
    });
    
    const headers: string[] = [];
    const footers: string[] = [];
    
    // Extract all header files
    const headerFiles = Object.keys(zip.files).filter(name => name.startsWith('word/header'));
    for (const headerFile of headerFiles) {
      try {
        const file = zip.file(headerFile);
        if (!file) continue;
        
        const headerXml = await file.async('text');
        if (headerXml) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(headerXml, 'text/xml');
          const textElements = xmlDoc.getElementsByTagName('w:t');
          
          let headerText = '';
          for (let i = 0; i < textElements.length; i++) {
            headerText += textElements[i].textContent || '';
          }
          
          if (headerText.trim()) {
            headers.push(headerText.trim());
          }
        }
      } catch (err) {
        console.warn(`Failed to extract header from ${headerFile}:`, err);
      }
    }
    
    // Extract all footer files
    const footerFiles = Object.keys(zip.files).filter(name => name.startsWith('word/footer'));
    for (const footerFile of footerFiles) {
      try {
        const file = zip.file(footerFile);
        if (!file) continue;
        
        const footerXml = await file.async('text');
        if (footerXml) {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(footerXml, 'text/xml');
          const textElements = xmlDoc.getElementsByTagName('w:t');
          
          let footerText = '';
          for (let i = 0; i < textElements.length; i++) {
            footerText += textElements[i].textContent || '';
          }
          
          if (footerText.trim()) {
            footers.push(footerText.trim());
          }
        }
      } catch (err) {
        console.warn(`Failed to extract footer from ${footerFile}:`, err);
      }
    }
    
    console.log(`   📋 Found ${headers.length} header(s) and ${footers.length} footer(s)`);
    
    // Extract text from DOCX (using basic XML parsing)
    const documentXml = await zip.file('word/document.xml')?.async('text');
    
    if (!documentXml) {
      return { text: 'Unable to extract text from Word document', headers, footers };
    }
    
    // Extract text from XML (simple approach)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
    
    // Get all paragraph nodes
    const paragraphNodes = xmlDoc.getElementsByTagName('w:p');
    
    let text = '';
    for (let i = 0; i < paragraphNodes.length; i++) {
      const paragraph = paragraphNodes[i];
      
      // Check for page breaks in this paragraph
      const pageBreaks = paragraph.getElementsByTagName('w:br');
      let hasPageBreak = false;
      
      for (let j = 0; j < pageBreaks.length; j++) {
        const brElement = pageBreaks[j];
        const typeAttr = brElement.getAttribute('w:type');
        if (typeAttr === 'page') {
          hasPageBreak = true;
          break;
        }
      }
      
      // Get text from paragraph
      const textElements = paragraph.getElementsByTagName('w:t');
      let paragraphText = '';
      
      for (let j = 0; j < textElements.length; j++) {
        paragraphText += textElements[j].textContent || '';
      }
      
      if (paragraphText.trim()) {
        text += paragraphText.trim() + '\n';
      }
      
      // Add page break marker
      if (hasPageBreak) {
        text += '<<<PAGE_BREAK>>>\n';
      }
    }
    
    return { text, headers, footers };
  } catch (error) {
    console.error('Error extracting content from DOCX:', error);
    return { text: 'Error extracting content from Word document', headers: [], footers: [] };
  }
}