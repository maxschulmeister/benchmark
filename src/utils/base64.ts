import fs from 'fs';

export async function encodeImageToBase64(imagePath: string): Promise<string> {
  const imageBuffer = await fs.promises.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  return `data:image/jpeg;base64,${base64Image}`;
}
