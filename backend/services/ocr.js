import Tesseract from 'tesseract.js';

export async function extractTextFromImage(imageBuffer) {
  try {
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          console.log(`  OCR progress: ${Math.round(info.progress * 100)}%`);
        }
      },
    });
    const text = result.data.text.trim();
    if (!text) {
      throw new Error('No text could be extracted from the image');
    }
    console.log(`  ✅ OCR extracted ${text.length} characters`);
    return text;
  } catch (error) {
    console.error('OCR Error:', error.message);
    throw new Error('Failed to extract text from image: ' + error.message);
  }
}

export async function extractTextFromPDF(pdfBuffer) {
  // For PDFs, we'll try to extract text using a simple approach
  // In production, you might want to use pdf-parse or similar library
  try {
    // Convert PDF buffer to text using Tesseract (treating each page as image)
    // This is a simplified approach - for better PDF handling, install pdf-parse
    const text = pdfBuffer.toString('utf-8');

    // Try to find readable text in the PDF
    const readableText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (readableText.length > 50) {
      console.log(`  ✅ PDF text extracted: ${readableText.length} characters`);
      return readableText;
    }

    // Fallback: use OCR on the PDF buffer
    const result = await Tesseract.recognize(pdfBuffer, 'eng');
    const ocrText = result.data.text.trim();
    if (ocrText) {
      console.log(`  ✅ PDF OCR extracted: ${ocrText.length} characters`);
      return ocrText;
    }

    throw new Error('Could not extract text from PDF');
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}
