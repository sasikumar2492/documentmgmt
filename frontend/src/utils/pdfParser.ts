import { FormSection, FormField } from '../types/index';

// Parse PDF file and convert to form sections
export const parsePdfToFormSections = async (file: File): Promise<FormSection[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // Use PDF.js to extract text
        const text = await extractTextFromPdf(arrayBuffer);
        
        // Parse the text to create form fields
        const sections: FormSection[] = [];
        const lines = text.split('\n').filter(line => line.trim());
        const fields: FormField[] = [];
        let currentSection = 'PDF Content';
        let fieldCounter = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (!line) continue;
          
          // Check if line looks like a section header
          if ((line === line.toUpperCase() && line.length < 50 && line.length > 2) ||
              /^(SECTION|PART|CHAPTER)\s+\d+/i.test(line)) {
            // Save previous section
            if (fields.length > 0) {
              sections.push({
                id: `section_${sections.length}`,
                title: currentSection,
                fields: [...fields]
              });
              fields.length = 0;
            }
            currentSection = line;
            continue;
          }
          
          // Check for label:value pattern
          if (line.includes(':')) {
            const colonIndex = line.indexOf(':');
            const label = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            // Only treat as label:value if label is reasonable length
            if (label.length > 0 && label.length < 100 && !label.includes('.')) {
              let fieldType: FormField['type'] = 'text';
              
              // Detect field type
              if (label.toLowerCase().includes('date')) {
                fieldType = 'date';
              } else if (label.toLowerCase().includes('number') || 
                         label.toLowerCase().includes('quantity') ||
                         label.toLowerCase().includes('amount') ||
                         label.toLowerCase().includes('code')) {
                fieldType = 'number';
              } else if (value.length > 100) {
                fieldType = 'textarea';
              } else if (value.toLowerCase().match(/^(yes|no|true|false|checked|unchecked)$/)) {
                fieldType = 'checkbox';
              }
              
              fields.push({
                id: `field_${sections.length}_${fieldCounter++}`,
                label: label,
                type: fieldType,
                value: value,
                required: label.includes('*') || label.toLowerCase().includes('required')
              });
              continue;
            }
          }
          
          // Check for form-like patterns (underscores or dashes indicating blank fields)
          if (/_{3,}|\.{3,}|-{3,}/.test(line)) {
            const match = line.match(/^([^_.-]+)[_.-]{3,}(.*)$/);
            if (match) {
              const label = match[1].trim();
              const value = match[2].trim();
              
              if (label) {
                fields.push({
                  id: `field_${sections.length}_${fieldCounter++}`,
                  label: label,
                  type: 'text',
                  value: value,
                  required: false
                });
                continue;
              }
            }
          }
          
          // Regular line - create as a text field if it's meaningful content
          if (line.length > 5) {
            fields.push({
              id: `field_${sections.length}_${fieldCounter++}`,
              label: `Line ${i + 1}`,
              type: line.length > 100 ? 'textarea' : 'text',
              value: line,
              required: false
            });
          }
        }
        
        // Add last section
        if (fields.length > 0) {
          // Mock images for demonstration as Fields
          if (sections.length === 0) {
            fields.splice(3, 0, {
              id: `img_field_pdf_${sections.length}_1`,
              label: 'PDF Source Diagram',
              type: 'image',
              value: 'https://images.unsplash.com/photo-1721244654346-9be0c0129e36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
              required: false
            });
          }

          sections.push({
            id: `section_${sections.length}`,
            title: currentSection,
            fields: fields
          });
        }
        
        // If no sections found, create a default one
        if (sections.length === 0) {
          sections.push({
            id: 'section_default',
            title: 'PDF Content',
            fields: [
              {
                id: 'field_default_1',
                label: 'Content',
                type: 'textarea',
                value: text || 'No content extracted from PDF',
                required: false
              }
            ]
          });
        }
        
        console.log('📕 Parsed PDF Sections:', sections);
        console.log(`✅ Total fields captured from PDF: ${sections.reduce((sum, s) => sum + s.fields.length, 0)}`);
        
        resolve(sections);
      } catch (error) {
        console.error('Error parsing PDF file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Extract text from PDF using PDF.js
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Import PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker to use the bundled version from esm.sh
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    
    // Load the PDF
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    
    // Fallback: Try to extract basic text without worker
    try {
      const text = await extractTextFallback(arrayBuffer);
      return text;
    } catch (fallbackError) {
      console.error('Fallback extraction also failed:', fallbackError);
      return 'Unable to extract text from PDF. Please try converting to Word or Excel format.';
    }
  }
}

// Fallback text extraction method
async function extractTextFallback(arrayBuffer: ArrayBuffer): Promise<string> {
  // Simple fallback: convert to string and try to find readable text
  const uint8Array = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(uint8Array);
  
  // Extract text between common PDF text markers
  const textMatches = text.match(/\(([^)]+)\)/g);
  
  if (textMatches && textMatches.length > 0) {
    return textMatches
      .map(match => match.slice(1, -1))
      .filter(t => t.length > 0)
      .join(' ');
  }
  
  return 'PDF text extraction requires additional processing. Please upload an Excel or Word file for better results.';
}