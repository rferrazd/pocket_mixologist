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
  console.log(certificates);
  console.log('Creating basic prescription');
  const prescription = await wiseapi.prescription.create({
    org: config.org,
    orgUnit: config.orgUnit,
    user: config.user,
    type: 'BASIC', // significado diso?  // receituario -> BASIC, exame -> EXAMREQUEST, atestado de trabalho -->  atestado medico --> MEDICALCERTIFICATE
    responsableCertificate: certificates[0].base64Certificate,
    prescription: {
      codigo: '12314', // gerado por nos ou a wisecare manda
      consultant: {
        name: 'Roberta Garcia',
        age: '24 anos',
        gender: 'Feminino',
      },
      prescriptions: [{
        name: 'Dorflex',
        dosage: '1mg',
        posology: '1x ao dia',
      }, {
        name: 'Dipirona',
        dosage: '1mg',
        posology: '1x ao dia',
      }],
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
    },
    skinInfo: {
      images: {
        logo: "https://minio.homolog.v4h.cloud/mail-logo/prescription.png"
      },
      colors: {
        header: "#0A7BED",
        footer: {
          primary: "#0A7BED",
          secondary: "#054586"
        },
        title: "#CF0014",
        text: {
          gray100: "#EFEFEF",
          gray200: "#DBDBDB",
          gray300: "#7A7A7A",
          gray400: "#303030",
          blue: "#0A7BED"
        },
        background: "#ffffff"
      },
      links: {
        validationUrl: "https://receita.v4h.cloud"
      }
    }
  });
  // depois configurar o skin pra hospitais diferentes
  console.log('Signing locally, this will open an popup to put certificate password')
  const signResponse = await wiseapi.prescription.signLocal(certificates[0].id, prescription.dataToSign);

  console.log('Confirming sinature');
  await wiseapi.prescription.sign(String(prescription.id), { signatureValue: signResponse[0].signature });

  console.log('Downloading document')
  const buffer = await wiseapi.prescription.download(String(prescription.id));

  console.log('Document saved in: ', `output/prescription_basic_${prescription.id}.pdf`)
  await fs.writeFile(`output/prescription_basic_${prescription.id}.pdf`, buffer);
}

main();