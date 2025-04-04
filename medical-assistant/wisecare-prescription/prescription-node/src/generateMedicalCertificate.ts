import fs from 'fs/promises';
import path from 'path';
import { generateMedicalCertificate, MedicalCertificatePayload, SkinInfo } from './wisecare-lib/modularMedicalCertificate';

/**
 * Generate a medical certificate from a JSON file
 * @param jsonFilePath Path to the JSON file containing medical certificate data
 * @param outputPath Optional custom output path for the PDF
 */
async function generateMedicalCertificateFromJson(jsonFilePath: string, outputPath?: string): Promise<void> {
  try {
    // Read and parse the JSON file
    const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
    const payload = JSON.parse(jsonContent) as { medicalCertificate: MedicalCertificatePayload; skinInfo?: SkinInfo };
    
    // Generate the medical certificate
    console.log('Generating medical certificate with payload:', JSON.stringify(payload.medicalCertificate, null, 2));
    if (payload.skinInfo) {
      console.log('Using skin info:', JSON.stringify(payload.skinInfo, null, 2));
    }
    
    // Pass the output path directly to avoid duplicate file creation
    const pdfPath = await generateMedicalCertificate(
      payload.medicalCertificate, 
      payload.skinInfo,
      outputPath
    );
    
    console.log(`Medical certificate PDF saved to ${pdfPath}`);
  } catch (error) {
    console.error('Error generating medical certificate:', error);
    process.exit(1);
  }
}

// When script is run directly, use command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: ts-node generateMedicalCertificate.ts <path-to-json-file> [output-path]');
    process.exit(1);
  }
  
  const jsonFilePath = args[0];
  const outputPath = args.length > 1 ? args[1] : undefined;
  
  generateMedicalCertificateFromJson(jsonFilePath, outputPath)
    .then(() => console.log('Medical certificate generation completed'))
    .catch(error => console.error('Failed to generate medical certificate:', error));
} 