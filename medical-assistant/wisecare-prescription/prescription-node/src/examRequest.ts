import WiseAPI from 'wise-api';
import fs from 'fs/promises';
import { config } from './config';

const main = async () => {
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

  console.log('Creating examRequest prescription');
  const prescription = await wiseapi.prescription.create({
    org: config.org,
    orgUnit: config.orgUnit,
    user: config.user,
    type: 'EXAMREQUEST',
    responsableCertificate: certificates[0].base64Certificate,
    prescription: {
      consultant: 'Paciente',
      codigo: '1231231',
      clinicalIndication: 'Clinica Teste',
      request: 'Lista de exames',
      doctor: {
        name: 'Médico Silva',
        crm: '1231231',
        uf: 'PB',
      },
      appointmentTookPlaceIn: {
        name: 'Nome',
        address: 'Rua das Flores, 137',
        neighbourhood: 'Bairro',
        city: 'Cidade',
        uf: 'PB',
        phone: '11999999999',
      },
      dateOfEmission: new Date().toLocaleDateString(),
    }
  });

  console.log('Signing locally, this will open an popup to put certificate password')
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);

  console.log('Confirming sinature');
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });

  console.log('Downloading document')
  const buffer = await wiseapi.prescription.download(String(prescription.id));

  console.log('Document saved in: ', `output/exam_request_${prescription.id}.pdf`)
  await fs.writeFile(`output/exam_request_${prescription.id}.pdf`, buffer);
}

main();