import fs from 'fs';

export const getMimeType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    default:
      return 'image/png'; // default to PNG
  }
};

export async function encodeImageToBase64(imagePath: string): Promise<string> {
  const mimeType = getMimeType(imagePath);

  let imageBuffer: Buffer;
  try {
    imageBuffer = await fs.promises.readFile(imagePath);
  } catch (error) {
    throw new Error(`Failed to read file: ${imagePath}`);
  }

  if (imageBuffer.length < 100) {
    console.warn('Warning: Image file is very small, may not be a valid image.');
  }

  const base64Image = imageBuffer.toString('base64');
  const base64String = `data:${mimeType};base64,${base64Image}`;

  return base64String;
}
