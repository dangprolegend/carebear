import { ImageAnnotatorClient, protos } from '@google-cloud/vision';

const visionClient = new ImageAnnotatorClient();

export const getTextFromImage = async (imageBase64: string): Promise<string> => {
  try {
    const request: protos.google.cloud.vision.v1.IAnnotateImageRequest = {
      image: {
        content: imageBase64,
      },
      features: [
        {
          type: protos.google.cloud.vision.v1.Feature.Type.DOCUMENT_TEXT_DETECTION,
        },
      ],
    };

    console.log('Sending image to Google Cloud Vision API for OCR (using batchAnnotateImages)...'); // Ensure this log is present
    const [response] = await visionClient.batchAnnotateImages({ // <<<< THIS IS THE CORRECT METHOD
      requests: [request],
    });
    console.log('Received OCR response from Google Cloud Vision API.');

    const singleImageResponse = response.responses?.[0];

    if (singleImageResponse?.error?.message) {
      console.error('Google Cloud Vision API returned an error for the image:', singleImageResponse.error.message);
      throw new Error(`Vision API error: ${singleImageResponse.error.message}`);
    }

    const fullTextAnnotation = singleImageResponse?.fullTextAnnotation;

    if (fullTextAnnotation && fullTextAnnotation.text) {
      return fullTextAnnotation.text;
    }
    return '';
  } catch (error: any) {
    console.error('Google Cloud Vision API Error in ocrService (batchAnnotateImages attempt):', error);
    if (error.message && error.message.startsWith('Vision API error:')) {
        throw error;
    }
    throw new Error('Failed to extract text from image using Google Cloud Vision API.');
  }
};