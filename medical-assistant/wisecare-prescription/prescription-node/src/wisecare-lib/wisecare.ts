// TypeScript interface for all payload types (prescriptions, exam requests, medical certificates)

import WiseAPI from 'wise-api';
import fs from 'fs/promises';
import { config as defaultConfig } from './config';

// Types
export interface WiseAPIConfig {
  baseUrl: string;
  type: 'ORG' | 'SYSTEMCLIENT' | 'USER';
  login: string;
  password: string;
}

export type PrescriptionType = 'BASIC' | 'ANTIMICROBIAL' | 'SPECIALCONTROL' | 'EXAMREQUEST' | 'REPORT' | 'MEDICALCERTIFICATE' | 'APAC_REPORT' | 'OPINION';

export interface PrescriptionPayload {
  org?: string;
  orgUnit?: string;
  user?: string;
  prescription: {
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
  };
}

export interface ExamRequestPayload {
  org?: string;
  orgUnit?: string;
  user?: string;
  prescription: {
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
  };
}

export interface MedicalCertificatePayload {
  org?: string;
  orgUnit?: string;
  user?: string;
  prescription: {
    certificate: string;
    consultant: string;
    period: string;
    notes: string;
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
  };
}

// Internal helper function to initialize the API
async function initializeWiseAPI(config?: Partial<WiseAPIConfig>) {
  const apiConfig = {
    baseUrl: config?.baseUrl || 'https://session-manager.homolog.v4h.cloud/api/v1',
    type: (config?.type || 'ORG') as 'ORG',
    login: config?.login || defaultConfig.login,
    password: config?.password || defaultConfig.password
  };
  
  return await WiseAPI(apiConfig);
}

// Main functions that match the original script functionality
export async function generatePrescription(
  payload: PrescriptionPayload, 
  outputPath?: string
): Promise<Buffer> {
  // Initialize API
  const wiseapi = await initializeWiseAPI();
  
  // Get certificates
  const certificates: any = await wiseapi.prescription.listCertificates();
  if (!certificates.length) throw Error('There are not certificates in this local device');
  
  // Create prescription
  const fullPayload = {
    org: payload.org || defaultConfig.org,
    orgUnit: payload.orgUnit || defaultConfig.orgUnit,
    user: payload.user || defaultConfig.user,
    type: 'BASIC' as PrescriptionType,
    responsableCertificate: certificates[0].base64Certificate,
    prescription: payload.prescription
  };
  
  const prescription = await wiseapi.prescription.create(fullPayload);
  
  // Sign document
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });
  
  // Download document
  const buffer = await wiseapi.prescription.download(String(prescription.id));
  
  // Save file if outputPath is provided
  const filePath = outputPath || `output/prescription_basic_${prescription.id}.pdf`;
  await fs.writeFile(filePath, buffer);
  
  return buffer;
}

export async function generateExamRequest(
  payload: ExamRequestPayload, 
  outputPath?: string
): Promise<Buffer> {
  // Initialize API
  const wiseapi = await initializeWiseAPI();
  
  // Get certificates
  const certificates: any = await wiseapi.prescription.listCertificates();
  if (!certificates.length) throw Error('There are not certificates in this local device');
  
  // Create exam request
  const fullPayload = {
    org: payload.org || defaultConfig.org,
    orgUnit: payload.orgUnit || defaultConfig.orgUnit,
    user: payload.user || defaultConfig.user,
    type: 'EXAMREQUEST' as PrescriptionType,
    responsableCertificate: certificates[0].base64Certificate,
    prescription: {
      ...payload.prescription,
      dateOfEmission: payload.prescription.dateOfEmission || new Date().toLocaleDateString()
    }
  };
  
  const prescription = await wiseapi.prescription.create(fullPayload);
  
  // Sign document
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });
  
  // Download document
  const buffer = await wiseapi.prescription.download(String(prescription.id));
  
  // Save file if outputPath is provided
  const filePath = outputPath || `output/exam_request_${prescription.id}.pdf`;
  await fs.writeFile(filePath, buffer);
  
  return buffer;
}

export async function generateMedicalCertificate(
  payload: MedicalCertificatePayload, 
  outputPath?: string
): Promise<Buffer> {
  // Initialize API
  const wiseapi = await initializeWiseAPI();
  
  // Get certificates
  const certificates: any = await wiseapi.prescription.listCertificates();
  if (!certificates.length) throw Error('There are not certificates in this local device');
  
  // Create medical certificate
  const fullPayload = {
    org: payload.org || defaultConfig.org,
    orgUnit: payload.orgUnit || defaultConfig.orgUnit,
    user: payload.user || defaultConfig.user,
    type: 'MEDICALCERTIFICATE' as PrescriptionType,
    responsableCertificate: certificates[0].base64Certificate,
    prescription: {
      ...payload.prescription,
      dateOfEmission: payload.prescription.dateOfEmission || new Date().toLocaleDateString()
    }
  };
  
  const prescription = await wiseapi.prescription.create(fullPayload);
  
  // Sign document
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });
  
  // Download document
  const buffer = await wiseapi.prescription.download(String(prescription.id));
  
  // Save file if outputPath is provided
  const filePath = outputPath || `output/medical_certificate_${prescription.id}.pdf`;
  await fs.writeFile(filePath, buffer);
  
  return buffer;
} 