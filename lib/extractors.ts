// @ts-ignore
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';

/**
 * Extracts text from a PDF buffer.
 *
 * @param buffer The file buffer containing PDF data
 * @returns The extracted raw text string
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF file.');
  }
}

/**
 * Extracts text from an image buffer using OCR (tesseract.js).
 *
 * @param buffer The file buffer containing image data
 * @returns The extracted raw text string
 */
export async function extractTextFromImage(buffer: Buffer): Promise<string> {
  try {
    // Tesseract.recognize accepts a Buffer directly in Node.js
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  } catch (error) {
    console.error('Error performing OCR on image:', error);
    throw new Error('Failed to extract text from image file using OCR.');
  }
}

/**
 * Extracts text from a plain text file buffer.
 *
 * @param buffer The file buffer containing txt data
 * @returns The extracted raw text string
 */
export function extractTextFromTXT(buffer: Buffer): string {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error('Failed to extract text from TXT file.');
  }
}

/**
 * Master utility to extract text based on mime-type.
 *
 * @param buffer The file buffer
 * @param mimeType The file's mime type
 * @returns The extracted text string
 */
export async function processFileBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  }

  if (mimeType === 'text/plain') {
    return extractTextFromTXT(buffer);
  }

  if (mimeType.startsWith('image/')) {
    return await extractTextFromImage(buffer);
  }

  throw new Error(`Unsupported mime type for text extraction: ${mimeType}`);
}
