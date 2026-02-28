import * as XLSX from 'xlsx';
import { FormSection, FormField } from '../types/index';

// Extract department from filename
export const extractDepartmentFromFilename = (filename: string): string => {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('engineering')) return 'engineering';
  if (lowerFilename.includes('manufacturing')) return 'manufacturing';
  if (lowerFilename.includes('quality') || lowerFilename.includes('qa')) return 'quality';
  if (lowerFilename.includes('procurement')) return 'procurement';
  if (lowerFilename.includes('operations')) return 'operations';
  if (lowerFilename.includes('research') || lowerFilename.includes('r&d') || lowerFilename.includes('rnd')) return 'research';
  
  // Default to engineering if no match found
  return 'engineering';
};

// Enhanced parser that captures ALL cells as editable fields organized by pages
export const parseExcelToFormSections = async (file: File): Promise<FormSection[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const sections: FormSection[] = [];
        
        // Define rows per page (approximately 40 rows per page in Excel)
        const ROWS_PER_PAGE = 40;
        
        // Iterate through each sheet in the workbook
        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          
          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          
          console.log(`📄 Processing Sheet: "${sheetName}"`);
          console.log(`   Total Rows: ${range.e.r + 1}, Total Columns: ${range.e.c + 1}`);
          
          // Check for horizontal page breaks in Excel
          const pageBreaks: number[] = [];
          
          // Excel stores page breaks in !rows property
          if (worksheet['!rows']) {
            worksheet['!rows'].forEach((rowInfo: any, index: number) => {
              if (rowInfo && rowInfo.hpx) {
                // Page break detected
                pageBreaks.push(index);
              }
            });
          }
          
          // If no explicit page breaks, use default page size (40 rows per page)
          let pageRanges: Array<{start: number, end: number}> = [];
          
          if (pageBreaks.length > 0) {
            console.log(`   📑 Found ${pageBreaks.length} explicit page break(s)`);
            // Create page ranges based on page breaks
            for (let i = 0; i < pageBreaks.length; i++) {
              const start = i === 0 ? 0 : pageBreaks[i - 1];
              const end = pageBreaks[i] - 1;
              if (end >= start) {
                pageRanges.push({ start, end });
              }
            }
            // Add last page
            if (pageBreaks[pageBreaks.length - 1] <= range.e.r) {
              pageRanges.push({
                start: pageBreaks[pageBreaks.length - 1],
                end: range.e.r
              });
            }
          } else {
            // Use default pagination
            const totalRows = range.e.r + 1;
            const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
            console.log(`   📑 No explicit page breaks found. Splitting into ${totalPages} page(s) (${ROWS_PER_PAGE} rows each)`);
            
            for (let pageNum = 0; pageNum < totalPages; pageNum++) {
              pageRanges.push({
                start: pageNum * ROWS_PER_PAGE,
                end: Math.min((pageNum + 1) * ROWS_PER_PAGE - 1, range.e.r)
              });
            }
          }
          
          // Process each page
          pageRanges.forEach((pageRange, pageNum) => {
            const startRow = pageRange.start;
            const endRow = pageRange.end;
            
            console.log(`   📄 Page ${pageNum + 1}: Rows ${startRow + 1} to ${endRow + 1}`);
            
            const pageFields: FormField[] = [];
            
            // Iterate through rows in this page
            for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
              let skipNextCell = false;
              
              // Process all columns in the row
              for (let colNum = range.s.c; colNum <= range.e.c; colNum++) {
                if (skipNextCell) {
                  skipNextCell = false;
                  continue;
                }
                
                const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum });
                const cell = worksheet[cellAddress];
                
                if (cell && cell.v !== undefined && cell.v !== null && cell.v !== '') {
                  const cellValue = String(cell.v).trim();
                  
                  // Skip completely empty cells
                  if (cellValue === '') continue;
                  
                  // Determine field type based on cell type and content
                  let fieldType: FormField['type'] = 'text';
                  let fieldValue = '';
                  let label = cellValue;
                  
                  // Check if this is a label:value pair
                  const hasNextCell = colNum < range.e.c;
                  if (hasNextCell) {
                    const nextCellAddress = XLSX.utils.encode_cell({ r: rowNum, c: colNum + 1 });
                    const nextCell = worksheet[nextCellAddress];
                    
                    if (nextCell && nextCell.v !== undefined && nextCell.v !== null && String(nextCell.v).trim() !== '') {
                      // This is a label:value pair
                      label = cellValue.replace(/:$/, '').trim();
                      fieldValue = String(nextCell.v).trim();
                      
                      // Determine field type from label and value
                      if (label.toLowerCase().includes('date')) {
                        fieldType = 'date';
                      } else if (
                        label.toLowerCase().includes('quantity') || 
                        label.toLowerCase().includes('amount') || 
                        label.toLowerCase().includes('price') ||
                        label.toLowerCase().includes('cost') ||
                        label.toLowerCase().includes('weight') ||
                        label.toLowerCase().includes('number') ||
                        (!isNaN(Number(fieldValue)) && fieldValue.length < 15)
                      ) {
                        fieldType = 'number';
                      } else if (
                        label.toLowerCase().includes('description') || 
                        label.toLowerCase().includes('notes') || 
                        label.toLowerCase().includes('comments') ||
                        label.toLowerCase().includes('remarks') ||
                        label.toLowerCase().includes('details') ||
                        label.toLowerCase().includes('address') ||
                        fieldValue.length > 100
                      ) {
                        fieldType = 'textarea';
                      } else if (
                        label.toLowerCase().includes('yes/no') || 
                        label.toLowerCase().includes('true/false') ||
                        label.toLowerCase().includes('check') ||
                        fieldValue.toLowerCase().match(/^(yes|no|true|false)$/)
                      ) {
                        fieldType = 'checkbox';
                        fieldValue = fieldValue.toLowerCase() === 'yes' || fieldValue.toLowerCase() === 'true' ? 'true' : 'false';
                      }
                      
                      pageFields.push({
                        id: `field_${sheetIndex}_${pageNum}_${rowNum}_${colNum}`,
                        label: label,
                        type: fieldType,
                        value: fieldValue,
                        required: label.includes('*') || label.toLowerCase().includes('required')
                      });
                      
                      // Skip the next cell since we've used it
                      skipNextCell = true;
                    } else {
                      // Next cell is empty - this is a label with empty value (for user to fill)
                      label = cellValue.replace(/:$/, '').trim();
                      
                      // Determine field type from label
                      if (label.toLowerCase().includes('date') || label.toLowerCase().includes('signature')) {
                        fieldType = 'date';
                      } else if (
                        label.toLowerCase().includes('quantity') || 
                        label.toLowerCase().includes('amount') || 
                        label.toLowerCase().includes('price') ||
                        label.toLowerCase().includes('cost') ||
                        label.toLowerCase().includes('weight') ||
                        label.toLowerCase().includes('number') ||
                        label.toLowerCase().includes('code')
                      ) {
                        fieldType = 'number';
                      } else if (
                        label.toLowerCase().includes('description') || 
                        label.toLowerCase().includes('notes') || 
                        label.toLowerCase().includes('comments') ||
                        label.toLowerCase().includes('remarks') ||
                        label.toLowerCase().includes('details') ||
                        label.toLowerCase().includes('address')
                      ) {
                        fieldType = 'textarea';
                      } else if (
                        label.toLowerCase().includes('approval') ||
                        label.toLowerCase().includes('name') ||
                        label.toLowerCase().includes('location') ||
                        label.toLowerCase().includes('unit')
                      ) {
                        fieldType = 'text';
                      }
                      
                      pageFields.push({
                        id: `field_${sheetIndex}_${pageNum}_${rowNum}_${colNum}`,
                        label: label,
                        type: fieldType,
                        value: '',
                        required: label.includes('*') || label.toLowerCase().includes('required')
                      });
                    }
                  } else {
                    // Last column
                    label = cellValue.replace(/:$/, '').trim();
                    
                    pageFields.push({
                      id: `field_${sheetIndex}_${pageNum}_${rowNum}_${colNum}`,
                      label: label,
                      type: fieldType,
                      value: '',
                      required: label.includes('*') || label.toLowerCase().includes('required')
                    });
                  }
                }
              }
            }
            
            // Add page as a section
            if (pageFields.length > 0) {
              const pageTitle = sheetName === 'Sheet1' || sheetName === 'Sheet 1' 
                ? `Page ${sections.length + 1}` 
                : `${sheetName} - Page ${pageNum + 1}`;
              
              // Mock images for demonstration as Fields instead of a separate list
              if (sections.length === 0) {
                // Add image after a specific field to simulate "proper section"
                const splitIndex = Math.min(pageFields.length, 4);
                pageFields.splice(splitIndex, 0, {
                  id: `img_field_${sheetIndex}_${pageNum}_1`,
                  label: 'Material Microstructure Analysis',
                  type: 'image',
                  value: 'https://images.unsplash.com/photo-1721244654346-9be0c0129e36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                  required: false
                });
              } else if (sections.length === 1) {
                const splitIndex = Math.min(pageFields.length, 2);
                pageFields.splice(splitIndex, 0, {
                  id: `img_field_${sheetIndex}_${pageNum}_2`,
                  label: 'Automated Visual Inspection Schematic',
                  type: 'image',
                  value: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                  required: false
                });
              }

              sections.push({
                id: `page_${sheetIndex}_${pageNum}`,
                title: pageTitle,
                fields: pageFields
              });
              
              console.log(`     ✅ Created page with ${pageFields.length} fields`);
            }
          });
        });
        
        // If no sections were found, create a default one
        if (sections.length === 0) {
          sections.push({
            id: 'section_default',
            title: 'Page 1',
            fields: [
              {
                id: 'field_default_1',
                label: 'Note',
                type: 'textarea',
                value: 'No structured data found in the Excel file. Please ensure the file contains properly formatted data.',
                required: false
              }
            ]
          });
        }
        
        console.log('\n' + '═'.repeat(80));
        console.log('📊 Excel Parsing Complete:');
        console.log('═'.repeat(80));
        console.log(`✅ Total pages: ${sections.length}`);
        console.log(`✅ Total fields: ${sections.reduce((sum, s) => sum + s.fields.length, 0)}`);
        console.log('\n📑 Page Summary:');
        sections.forEach((section, idx) => {
          console.log(`\n   Page ${idx + 1}: "${section.title}"`);
          console.log(`   └─ ${section.fields.length} field${section.fields.length !== 1 ? 's' : ''}`);
        });
        console.log('═'.repeat(80) + '\n');
        
        resolve(sections);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsBinaryString(file);
  });
};

// Convert form sections to flat form data
export const formSectionsToFormData = (sections: FormSection[]): Record<string, any> => {
  const formData: Record<string, any> = {};
  
  sections.forEach(section => {
    section.fields.forEach(field => {
      formData[field.id] = field.value || '';
    });
  });
  
  return formData;
};