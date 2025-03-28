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

  console.log('Creating medical certificate prescription');

  const prescription = await wiseapi.prescription.create({
    org: config.org,
    orgUnit: config.orgUnit,
    user: config.user,
    type: 'MEDICALCERTIFICATE',
    signatureSource: 'LEDGERSIGN',
    responsableCertificate: certificates[0].base64Certificate,
    
      prescription: {
          consultant: "Jose Santos",
          period: "1 semana",
          notes: "caiu da escada e faturou o pé",
          doctor: {
              name: "Pablo Esposito",
              crm: "23242",
              uf: "PB"
          },
          appointmentTookPlaceIn: {
              name: "Duomed",
              address: "Avenida Epitacio Pessoa, 10",
              neighbourhood: "Torre",
              city: "João Pessoa",
              uf: "PB",
              phone: "982051591"
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

  console.log('Document saved in: ', `output/medical_certificate_${prescription.id}.pdf`)
  await fs.writeFile(`output/medical_certificate_${prescription.id}.pdf`, buffer);
}

main();