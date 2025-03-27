#!/usr/bin/env python3
import json
import os

from python_wrapper import generate_exam_request


def main():
    # Get the base64 encoded image
    intellidoctor_image_blue = "https://drive.google.com/uc?export=download&id=1XDnTl9tMw3s22Khh1Df2RoECjjLwctth"
    image_path = intellidoctor_image_blue
    
    # Define the exam request payload
    exam_request_payload = {
        "consultant": "Maria Silva",
        "codigo": "EX12345",
        "clinicalIndication": "Acompanhamento de rotina",
        "request": "Hemograma completo, Perfil lipídico, Glicemia de jejum, TSH, T4 livre",
        "doctor": {
            "name": "Dra. Ana Carvalho",
            "crm": "54321",
            "uf": "SP"
        },
        "appointmentTookPlaceIn": {
            "name": "Centro Médico Esperança",
            "address": "Avenida Paulista, 1000",
            "neighbourhood": "Bela Vista",
            "city": "São Paulo",
            "uf": "SP",
            "phone": "1198765432"
        },
        "dateOfEmission": "01/06/2023"
    }
    
    # Define skin info for styling
    skin_info = {
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

    # Pretty print the complete payload for debugging
    print("Exam Request Payload:")
    print(json.dumps(exam_request_payload, indent=2))
    print("\nSkin Info:")
    print(json.dumps(skin_info, indent=2))

    # Create output directory if it doesn't exist
    os.makedirs("output", exist_ok=True)
    
    # Generate the exam request PDF
    output_path = "output/test_exam_request_with_image.pdf"
    print(f"Generating exam request to: {output_path}")
    
    try:
        # Pass both the exam request payload and skin info
        result = generate_exam_request(
            exam_request_payload=exam_request_payload,
            output_path=output_path,
            skin_info=skin_info
        )
        print(f"Result: {result}")
        print("Exam request generated successfully!")
    except Exception as e:
        print(f"Error generating exam request: {e}")

if __name__ == "__main__":
    main() 