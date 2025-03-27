#!/usr/bin/env python3
import json
import os

from python_wrapper import generate_prescription


def main():
    
    image_path = "https://minio.homolog.v4h.cloud/public/IntellidoctorLogo.png"
    # Define the prescription payload
    prescription_payload = {
        "prescription": {
            "codigo": "12345",
            "consultant": {
                "name": "Paciente 2",
                "age": "12 anos",
                "gender": "Feminino"
            },
            "prescriptions": [{
                "name": "Wellbutrin",
                "dosage": "10mg",
                "posology": "Depois do jantar"
            }],
            "doctor": {
                "name": "Doctor Pedro",
                "crm": "1818181818",
                "uf": "SP"
            },
            "appointmentTookPlaceIn": {
                "name": "Clinic Name",
                "address": "123 Main St",
                "neighbourhood": "Downtown",
                "city": "São Paulo",
                "uf": "SP",
                "phone": "1234567890"
            }
        },
        "skinInfo": {
            "images": {
                "logo": f"{image_path}"
            },
            "colors": {
                "header": "#0A7BED",
                "footer": {
                    "primary": "#0A7BED",
                    "secondary": "#054586"
                },
                "title": "#CF0014",
                "text": {
                    "gray100": "#EFEFEF",
                    "gray200": "#DBDBDB",
                    "gray300": "#7A7A7A",
                    "gray400": "#303030",
                    "blue": "#0A7BED"
                },
                "background": "#ffffff"
            },
            "links": {
                "validationUrl": "https://receita.v4h.cloud"
            }
        }
    }

    # Pretty print the payload
    print(json.dumps(prescription_payload, indent=2))

    # Create output directory if it doesn't exist
    os.makedirs("output", exist_ok=True)
    
    # Generate the prescription PDF
    output_path = "output/test_prescription_with_image.pdf"
    print(f"Generating prescription to: {output_path}")
    
    try:
        result = generate_prescription(prescription_payload, output_path)
        print(f"Result: {result}")
        print("Prescription generated successfully!")
    except Exception as e:
        print(f"Error generating prescription: {e}")

if __name__ == "__main__":
    main() 