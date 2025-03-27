import fs from 'fs/promises';
import path from 'path';
import { generateExamRequest, ExamRequestPayload, SkinInfo } from './wisecare-lib/modularExamRequest';

/**
 * Generate an exam request from a JSON file
 * @param jsonFilePath Path to the JSON file containing exam request data
 * @param outputPath Optional custom output path for the PDF
 */
async function generateExamRequestFromJson(jsonFilePath: string, outputPath?: string): Promise<void> {
  try {
    // Read and parse the JSON file
    const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
    const payload = JSON.parse(jsonContent) as { examRequest: ExamRequestPayload; skinInfo?: SkinInfo };
    
    // Generate the exam request
    console.log('Generating exam request with payload:', JSON.stringify(payload.examRequest, null, 2));
    if (payload.skinInfo) {
      console.log('Using skin info:', JSON.stringify(payload.skinInfo, null, 2));
    }
    const pdfPath = await generateExamRequest(payload.examRequest, payload.skinInfo);
    
    // Copy to custom output path if provided
    if (outputPath) {
      await fs.copyFile(path.resolve(pdfPath), path.resolve(outputPath));
      console.log(`Exam request PDF copied to ${outputPath}`);
    }
  } catch (error) {
    console.error('Error generating exam request:', error);
    process.exit(1);
  }
}

// When script is run directly, use command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node generateExamRequest.ts <path-to-json-file> [output-path]');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  const outputPath = args.length > 1 ? args[1] : undefined;
  
  generateExamRequestFromJson(jsonFilePath, outputPath)
    .then(() => console.log('Exam request generation completed'))
    .catch(error => console.error('Failed to generate exam request:', error));
} 