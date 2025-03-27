// Export functions and types from modular scripts
export { generatePrescription, PrescriptionPayload } from './modularPrescription';
export { generateExamRequest, ExamRequestPayload } from './modularExamRequest';
// Only export SkinInfo once since it's identical in both modules
export { SkinInfo } from './modularPrescription';
// Future exports:
// export { generateMedicalCertificate, MedicalCertificatePayload } from './modularMedicalCertificate';

// Re-export the config
export { config } from './config'; 