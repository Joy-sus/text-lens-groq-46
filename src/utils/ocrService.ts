
import { createWorker } from 'tesseract.js';

export const performOCR = async (imageFile: File): Promise<string> => {
  const worker = await createWorker('eng');
  
  try {
    console.log('Starting OCR processing...');
    const { data: { text } } = await worker.recognize(imageFile);
    console.log('OCR completed successfully');
    return text.trim();
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to extract text from image');
  } finally {
    await worker.terminate();
  }
};
