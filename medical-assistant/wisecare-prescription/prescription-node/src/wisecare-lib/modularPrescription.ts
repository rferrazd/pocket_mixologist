import WiseAPI from 'wise-api';
import fs from 'fs/promises';
import { config } from './config';

// Define the prescription payload interface
export interface PrescriptionPayload {
  codigo: string;
  consultant: {
    name: string;
    age: string;
    gender: string;
  };
  prescriptions: Array<{
    name: string;
    dosage: string;
    posology: string;
  }>;
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
 * Generate a prescription PDF
 * @param payload The prescription data
 * @returns Path to the generated PDF
 */
export async function generatePrescription(payload: PrescriptionPayload, skinInfo?: SkinInfo): Promise<string> {
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
  console.log(certificates);
  
  console.log('Creating basic prescription');
  const prescription = await wiseapi.prescription.create({
    org: config.org,
    orgUnit: config.orgUnit,
    user: config.user,
    type: 'BASIC',
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

  const outputPath = `output/prescription_basic_${prescription.id}.pdf`;
  console.log('Document saved in: ', outputPath);
  await fs.writeFile(outputPath, buffer);
  
  return outputPath;
}

