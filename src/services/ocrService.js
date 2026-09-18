import Tesseract from 'tesseract.js';

/**
 * Phase 2A/2B — live OCR for uploaded label images.
 * Returns raw text only. Never substitutes demo copy.
 */
export async function recognizeLabelText(imageSource, onProgress) {
  if (!imageSource) {
    throw new Error('No image was provided for OCR.');
  }

  const result = await Tesseract.recognize(imageSource, 'eng', {
    logger: (message) => {
      if (typeof onProgress !== 'function') return;
      if (message.status === 'recognizing text' && typeof message.progress === 'number') {
        onProgress(message.progress);
      }
    },
  });

  return {
    text: result?.data?.text || '',
    confidence: typeof result?.data?.confidence === 'number' ? result.data.confidence : null,
  };
}
