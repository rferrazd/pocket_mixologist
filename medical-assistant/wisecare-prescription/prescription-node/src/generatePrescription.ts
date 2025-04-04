import fs from 'fs/promises';
import path from 'path';
import { generatePrescription, PrescriptionPayload, SkinInfo } from './wisecare-lib';

/**
 * Generate a prescription from a JSON file
 * @param jsonFilePath Path to the JSON file containing prescription data
 * @param outputPath Optional custom output path for the PDF
 */
async function generatePrescriptionFromJson(jsonFilePath: string, outputPath?: string): Promise<void> {
  try {
    // Read and parse the JSON file
    const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
    const payload = JSON.parse(jsonContent) as { prescription: PrescriptionPayload; skinInfo?: SkinInfo };
    
    // Generate the prescription
    console.log('Generating prescription with payload:', JSON.stringify(payload.prescription, null, 2));
    if (payload.skinInfo) {
      console.log('Using skin info:', JSON.stringify(payload.skinInfo, null, 2));
    }
    
    // Pass the output path directly to avoid duplicate file creation
    const pdfPath = await generatePrescription(
      payload.prescription, 
      payload.skinInfo,
      outputPath
    );
    
    console.log(`Prescription PDF saved to ${pdfPath}`);
  } catch (error) {
    console.error('Error generating prescription:', error);
    process.exit(1);
  }
}

// When script is run directly, use command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node generatePrescription.ts <path-to-json-file> [output-path]');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  const outputPath = args.length > 1 ? args[1] : undefined;
  
  generatePrescriptionFromJson(jsonFilePath, outputPath)
    .then(() => console.log('Prescription generation completed'))
    .catch(error => console.error('Failed to generate prescription:', error));
} 