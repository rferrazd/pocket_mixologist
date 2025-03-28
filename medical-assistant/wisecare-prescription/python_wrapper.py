import json
import subprocess
import os
import shutil
import tempfile
from typing import Dict, Any, Optional
from datetime import datetime

# Get the absolute path to the current directory
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PRESCRIPTION_NODE_DIR = os.path.join(CURRENT_DIR, 'prescription-node')

def generate_prescription(prescription_payload: Dict[str, Any], output_path: Optional[str] = None, skin_info: Optional[Dict[str, Any]] = None) -> str:
    """Generate a prescription PDF with custom payload.
    
    This uses the parameterized modularPrescription.ts script to generate a PDF.
    
    Args:
        prescription_payload: The prescription data
        output_path: Optional path to save the PDF
    
    Returns:
        str: Path to the generated PDF
    """
    # Create unique output filename if not provided
    if not output_path:
        output_path = os.path.join(CURRENT_DIR, f"output/prescription_{os.urandom(4).hex()}.pdf")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Create a temporary file with the JSON payload
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='w') as temp_file:
        #json.dump(prescription_payload, temp_file)
        json_payload = {"prescription" : prescription_payload}
        payload_path = temp_file.name

        # Add skin info if provided
        if skin_info:
            json_payload["skinInfo"] = skin_info
            
        json.dump(json_payload, temp_file)
        payload_path = temp_file.name 
    
    try:
        # Run the script with ts-node
        result = subprocess.run(
            [
                'yarn', '--cwd', PRESCRIPTION_NODE_DIR,
                'ts-node', 'src/generatePrescription.ts',
                payload_path,
                os.path.abspath(output_path)
            ],
            capture_output=True,
            text=True,
            cwd=PRESCRIPTION_NODE_DIR
        )
        
        if result.returncode != 0:
            raise Exception(f"Failed to generate prescription: {result.stderr}")
        
        # Verify the output file exists
        if not os.path.exists(output_path):
            raise Exception(f"Output file was not created at {output_path}")
        
        print(f"Prescription generated and saved to {output_path}")
        return output_path
    finally:
        # Clean up temporary file
        if os.path.exists(payload_path):
            os.unlink(payload_path)

def generate_exam_request(exam_request_payload: Dict[str, Any], output_path: Optional[str] = None, skin_info: Optional[Dict[str, Any]] = None) -> str:
    """Generate an exam request PDF with custom payload.
    
    This function uses the parameterized modularExamRequest.ts script to generate a PDF.
    
    Args:
        exam_request_payload: The exam request data
        output_path: Optional path to save the PDF
        skin_info: Optional styling information for the PDF
    
    Returns:
        str: Path to the generated PDF
    """
    # Create unique output filename if not provided
    if not output_path:
        output_path = os.path.join(CURRENT_DIR, f"output/exam_request_{os.urandom(4).hex()}.pdf")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Create a temporary file with the JSON payload
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='w') as temp_file:
        # The payload should be wrapped in an object with an "examRequest" key
        json_payload = {"examRequest": exam_request_payload}
        
        # Add skin info if provided
        if skin_info:
            json_payload["skinInfo"] = skin_info
            
        json.dump(json_payload, temp_file)
        payload_path = temp_file.name
    
    try:
        # Run the script with ts-node
        result = subprocess.run(
            [
                'yarn', '--cwd', PRESCRIPTION_NODE_DIR,
                'ts-node', 'src/generateExamRequest.ts',
                payload_path,
                os.path.abspath(output_path)
            ],
            capture_output=True,
            text=True,
            cwd=PRESCRIPTION_NODE_DIR
        )
        
        if result.returncode != 0:
            raise Exception(f"Failed to generate exam request: {result.stderr}")
        
        # Verify the output file exists
        if not os.path.exists(output_path):
            raise Exception(f"Output file was not created at {output_path}")
        
        print(f"Exam request generated and saved to {output_path}")
        return output_path
    finally:
        # Clean up temporary file
        if os.path.exists(payload_path):
            os.unlink(payload_path)

def generate_medical_certificate(medical_certificate_payload: Dict[str, Any], output_path: Optional[str] = None, skin_info: Optional[Dict[str, Any]] = None) -> str:
    """Generate a medical certificate PDF with custom payload.
    
    This function uses the parameterized modularMedicalCertificate.ts script to generate a PDF.
    
    Args:
        medical_certificate_payload: The medical certificate data
        output_path: Optional path to save the PDF
        skin_info: Optional styling information for the PDF
    
    Returns:
        str: Path to the generated PDF
    """
    # Create unique output filename if not provided
    if not output_path:
        output_path = os.path.join(CURRENT_DIR, f"output/medical_certificate_{os.urandom(4).hex()}.pdf")
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    # Create a temporary file with the JSON payload
    with tempfile.NamedTemporaryFile(suffix='.json', delete=False, mode='w') as temp_file:
        # The payload should be wrapped in an object with a "medicalCertificate" key
        json_payload = {"medicalCertificate": medical_certificate_payload}
        
        # Add skin info if provided
        if skin_info:
            json_payload["skinInfo"] = skin_info
            
        json.dump(json_payload, temp_file)
        payload_path = temp_file.name
    
    try:
        # Run the script with ts-node
        result = subprocess.run(
            [
                'yarn', '--cwd', PRESCRIPTION_NODE_DIR,
                'ts-node', 'src/generateMedicalCertificate.ts',
                payload_path,
                os.path.abspath(output_path)
            ],
            capture_output=True,
            text=True,
            cwd=PRESCRIPTION_NODE_DIR
        )
        
        if result.returncode != 0:
            raise Exception(f"Failed to generate medical certificate: {result.stderr}")
        
        # Verify the output file exists
        if not os.path.exists(output_path):
            raise Exception(f"Output file was not created at {output_path}")
        
        print(f"Medical certificate generated and saved to {output_path}")
        return output_path
    finally:
        # Clean up temporary file
        if os.path.exists(payload_path):
            os.unlink(payload_path)

# Example usage:
if __name__ == "__main__":
    # Example logo image URL
    intellidoctor_image_blue = "https://minio.homolog.v4h.cloud/public/IntellidoctorLogo.png"
    
    # Example skin information for styling documents
    skin_info = {
        "images": {
            "logo": intellidoctor_image_blue
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
    
    # Example prescription payload
    prescription_payload = {
        "prescription": {
            "codigo": "12345",
            "consultant": {
                "name": "Patient Name",
                "age": "35 anos",
                "gender": "Masculino"
            },
            "prescriptions": [{
                "name": "Medication Name",
                "dosage": "10mg",
                "posology": "2x ao dia"
            }],
            "doctor": {
                "name": "Doctor Name",
                "crm": "12345",
                "uf": "SP"
            },
            "appointmentTookPlaceIn": {
                "name": "Clinic Name",
                "address": "123 Main St",
                "neighbourhood": "Downtown",
                "city": "São Paulo",
                "uf": "SP",
                "phone": "1234567890"
            },
            "dateOfEmission" :  "DATA 2"
        },
        "skinInfo": skin_info
    }
    
    # Generate prescription
    # prescription_result = generate_prescription(prescription_payload, "output/example_prescription.pdf")
    # print(f"Prescription result: {prescription_result}")
    
    # Example exam request payload
    exam_request_payload = {
        "consultant": "John Doe",
        "codigo": "98765",
        "clinicalIndication": "Routine checkup",
        "request": "Complete blood count, Lipid panel, Urinalysis",
        "doctor": {
            "name": "Doctor Name",
            "crm": "12345",
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
    }
    
    # Generate exam request
    # exam_request_result = generate_exam_request(
    #     exam_request_payload=exam_request_payload,
    #     output_path="output/example_exam_request.pdf",
    #     skin_info=skin_info
    # )
    # print(f"Exam request result: {exam_request_result}")
    
    # Example medical certificate payload
    medical_certificate_payload = {
        "consultant": "Renato Russo",
        "period": "4 weeks",
        "notes": "Patient requires rest due to lower back injury",
        "doctor": {
            "name": "Doctor Name",
            "crm": "12345",
            "uf": "SP"
        },
        "appointmentTookPlaceIn": {
            "name": "Clinic Name",
            "address": "123 Main St",
            "neighbourhood": "Downtown",
            "city": "São Paulo",
            "uf": "SP",
            "phone": "1234567890"
        },
        "dateOfEmission": datetime.now().strftime("%d/%m/%Y")
    }
    
    # Generate medical certificate
    medical_certificate_result = generate_medical_certificate(
        medical_certificate_payload=medical_certificate_payload,
        output_path="output/example_medical_certificate.pdf",
        skin_info=skin_info  # Using the same skin_info defined earlier
    )
    print(f"Medical certificate result: {medical_certificate_result}") 