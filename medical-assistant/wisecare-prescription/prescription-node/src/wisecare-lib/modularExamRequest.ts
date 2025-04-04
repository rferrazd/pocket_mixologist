import WiseAPI from 'wise-api';
import fs from 'fs/promises';
import { config } from './config';

// Define the exam request payload interface
export interface ExamRequestPayload {
  consultant: string;
  codigo: string;
  clinicalIndication: string;
  request: string;
  doctor: {
    name: string;
    crm: string;
    uf: string;
  };
  appointmentTookPlaceIn: {
    name: string;
    address: string;
    neighbourhood: string;
    city: string;
    uf: string;
    phone: string;
  };
  dateOfEmission?: string;
}

export interface SkinInfo {
  images: {
    logo: string;
  };
  colors: {
    header: string;
    footer: {
      primary: string;
      secondary: string;
    };
    title: string;
    text: {
      gray100: string;
      gray200: string;
      gray300: string;
      gray400: string;
      blue: string;
    };
    background: string;
  };
  links: {
    validationUrl: string;
  };
}

/**
 * Generate an exam request PDF
 * @param payload The exam request data
 * @param skinInfo Optional skinning configuration for the PDF
 * @param outputPath Optional output path for the generated PDF
 * @returns Path to the generated PDF
 */
export async function generateExamRequest(
  payload: ExamRequestPayload, 
  skinInfo?: SkinInfo,
  outputPath?: string
): Promise<string> {
  console.log('Lib Initialization');
  const wiseapi = await WiseAPI({
    baseUrl: 'https://session-manager.homolog.v4h.cloud/api/v1',
    type: 'ORG',
    login: config.login,
    password: config.password
  });

  console.log('Getting local certificates');
  const certificates: any = await wiseapi.prescription.listCertificates();
  if (!certificates.length) throw Error('There are not certificates in this local device');

  // Set date of emission if not provided
  if (!payload.dateOfEmission) {
    payload.dateOfEmission = new Date().toLocaleDateString();
  }

  console.log('Creating examRequest prescription');
  const prescription = await wiseapi.prescription.create({
    org: config.org,
    orgUnit: config.orgUnit,
    user: config.user,
    type: 'EXAMREQUEST',
    responsableCertificate: certificates[0].base64Certificate,
    prescription: payload,
    skinInfo: skinInfo // Include the skinInfo configuration if provided
  });

  console.log('Signing locally, this will open an popup to put certificate password');
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);

  console.log('Confirming sinature');
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });

  console.log('Downloading document');
  const buffer = await wiseapi.prescription.download(String(prescription.id));

  // Use provided output path or create a default one
  const filePath = outputPath || `output/exam_request_${prescription.id}.pdf`;
  console.log('Document saved in: ', filePath);
  await fs.writeFile(filePath, buffer);
  
  return filePath;
}