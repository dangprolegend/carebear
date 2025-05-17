import { ImageAnnotatorClient } from '@google-cloud/vision';

const visionClient = new ImageAnnotatorClient();

export const getTextFromImage = async (imageBase64: string): Promise<string> => {
    try {
        const request = {
            image: {
                content: imageBase64,
            },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION'}],
        };
        console.log ('Sending image to Google Cloud Vision API for OCR...');
        const [result] = await visionClient.documentTextDetection(request);
        const fullTextAnnotation = result.fullTextAnnotation;
        console.log ('Received OCR response from Google Cloud Vision API.');
        
        if (fullTextAnnotation && fullTextAnnotation.text){
            return fullTextAnnotation.text;
        }
        return '';
    } catch (error) {
        console.error('Google Cloud Vision API Error', error);
        throw new Error('Failed to extract text from image using Google Cloud Vision API.');
    }
    
};