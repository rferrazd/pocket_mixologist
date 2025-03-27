# ----------------------------------
# SECTION: IMPORTS
# ----------------------------------
import os
from typing import Literal, Optional, Dict, List
from datetime import datetime
from devtools import pprint

from dotenv import load_dotenv
from IPython.display import Image, display
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI, OpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph.state import CompiledStateGraph
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver

# ----------------------------------
# SECTION: ENVIRONMENT VARIABLES
# ----------------------------------
load_dotenv()  # Load environment variables from the .env file
os.environ['OPENAI_API_KEY'] = os.getenv('OPENAI_API_KEY')
os.environ['LANGSMITH_TRACING'] = os.getenv('LANGSMITH_TRACING')
os.environ['LANGSMITH_ENDPOINT'] = os.getenv('LANGSMITH_ENDPOINT')
os.environ['LANGSMITH_API_KEY'] = os.getenv('LANGSMITH_API_KEY')
os.environ['LANGSMITH_PROJECT'] = os.getenv('LANGSMITH_PROJECT')

# ----------------------------------
# SECTION: GLOBAL VARIABLES AND PARAMETERS
# ----------------------------------
VALID_DECISION_OPTIONS = {"emergencial", "diagnostico_diferencial", "ask_human", "gerar_documentos"}

global INTERACTION_COUNT
INTERACTION_COUNT = 0

# ----------------------------------
# SECTION: STRUCTURED CLASSES
# ----------------------------------
class RouterResponse(BaseModel):
    decision: Literal["emergencial", "diagnostico_diferencial", "ask_human", "gerar_documentos"] = Field(
        description="Decisão sobre qual caminho seguir com base na descrição do paciente"
    )
    case_synthesis: Optional[str] = Field(
        default=None,
        description="Síntese técnica do caso a ser analisado"
    )
    question_to_human: Optional[str] = Field(
        default=None,
        description="Pergunta específica para o usuário quando há necessidade de esclarecimento"
    )
    decision_reason: Optional[str] = Field(
        default=None,
        description="Explicação pela qual a decisão emergencial, diagnostico_diferencial, ask_human foi feita."
    )

# ----------------------------------
# SECTION: STRUCTURED CLASSES FOR PRESCRIPTION GENERATION 
# ----------------------------------
# Informações da Organização
class OrgInfo(BaseModel):
    org: str = "INTELLIDOCTOR"
    orgUnit: str = "INTELLIDOCTOR"
    user: str = "intellidoctor@wisecare.com.br"
    login: str = "0a906291-1269-4eb5-8372-99879367de32"
    password: str = "q5SjG_3k29.T"

# Detalhes do médico
class Doctor(BaseModel):
      name: str = 'Médico Silva'
      crm: str = '1231231'
      uf: str = 'PB' 

# Local onde ocorreu a consulta
class AppointmentTookPlaceIn(BaseModel):
      name: str = 'Nome'
      address: str = 'Rua das Flores, 137'
      neighbourhood: str = 'Bairro'
      city: str = 'Cidade'
      uf: str = 'PB'
      phone: str = '11999999999'

# Info do paciente
class LLMPatient(BaseModel):
     # Detalhes do paciente
     name: str = Field(description = "Nome do paciente")
     age: str = Field(description = "Idade do paciente")
     gender: str = Field(description = "Gênero do paciente")

# Class para cada medicamento
class PrescriptionItem(BaseModel):
    name: str = Field(description="Nome do medicamento")
    dosage: str = Field(description="Dosagem do medicamento")
    posology: str = Field(description="Posologia do medicamento")

# Saída do LLM
class LLMPrescription(BaseModel): 
    """Classe Pydantic que define a estrutura de saída do LLM para gerar a prescrição."""
    
    # Detalhes do paciente
    consultant: LLMPatient
    
    # Lista de prescrições
    prescriptions: list[PrescriptionItem] = Field(
        description="Lista de medicamentos prescritos",
        default_factory=list  # This makes it default to an empty list if not provided
    )
      
# Pydantic class pra gerar parte do payload para mandar pra WiseCare
class Prescription(BaseModel):
      """Classe Pydantic para gerar o json a ser enviado para a API do Wisecare."""
      codigo: str = '12314' # código gerado pelo Intellidoctor ou fornecido pelo Wisecare

      consultant: Dict[str,str]
      
      prescriptions: List[Dict[str, str]]  # Detalhes gerados pelo LLM - agora aceita uma lista de dicionários

      doctor: Dict[str, str]

      appointmentTookPlaceIn: Dict[str, str]

class ImageInfo(BaseModel):
    logo: str = "https://minio.homolog.v4h.cloud/public/IntellidoctorLogo.png"

class FooterColors(BaseModel):
    primary: str = "#0A7BED"
    secondary: str = "#054586"

class ColorsText(BaseModel):
    gray100: str = "#EFEFEF"
    gray200: str = "#DBDBDB"
    gray300: str = "#7A7A7A"
    gray400: str = "#303030"
    blue: str = "#0A7BED"

class Colors(BaseModel):
    header: str = "#0A7BED"
    footer: FooterColors = FooterColors()
    title: str = "#CF0014"
    text: ColorsText = ColorsText()
    background: str = "#ffffff"

class Links(BaseModel):
    validationUrl: str = "https://receita.v4h.cloud"

class SkinInfo(BaseModel):
    images: ImageInfo = ImageInfo()
    colors: Colors = Colors()
    links: Links = Links()

# ----------------------------------
# SECTION: STRUCTURED CLASSES FOR EXAM REQUEST GENERATION 
# ----------------------------------

# Class for LLM to generate json structure to construct the payload for the exam request 
class LLMExamRequest(BaseModel):
    """
    Representa a saída estruturada para o pedido de exame gerado pela LLM.

    Atributos:
        consultant (str): Nome do paciente para quem o exame está sendo solicitado.
        clinicalIndication (str): Explicação detalhada do motivo do pedido de exame, como acompanhamento de rotina ou investigação de sintomas específicos.
        request (str): Descrição completa do pedido de exame, contendo todas as informações necessárias e instruções para a realização do procedimento.
    """
    consultant: str = Field(
        description="Nome do paciente"
    )
    clinicalIndication: str = Field(
        description="Informação detalhada sobre o motivo do pedido de exame, por exemplo, acompanhamento regular ou análise de sintomas específicos."
    )
    request: str = Field(
        description="Descrição completa e precisa do pedido de exame, incluindo todas as instruções e detalhes necessários para a execução."
    )

# Pydantic class for generating the payload to send the exam request to the wisecare api
class ExamRequest(BaseModel):
      consultant : str = Field("Nome do paciente")
      codigo: str = "EX12345"
      clinicalIndication: str = Field(description="Motivo pelo pedido médico. Ex: acompanhamento de rotina")
      request: str = Field(description="Detalhes do pedido do exame")
      doctor: Doctor
      appointmentTookPlaceIn: AppointmentTookPlaceIn
      dateOfEmission: str 

# ----------------------------------
# SECTION: STATE DEFINITION
# ----------------------------------
class State(MessagesState):
    initial_human_input: Optional[str]
    decision: Literal["emergencial", "diagnostico_diferencial", "ask_human", "receita_medica"]
    case_synthesis: Optional[str]
    question_to_human: Optional[str]
    final_answer: Optional[str]

# ----------------------------------
# SECTION: LLM MODEL FOR ROUTER LLM
# ----------------------------------
model = ChatOpenAI(model="gpt-4o-mini")
model = model.with_structured_output(RouterResponse)

# ----------------------------------
# SECTION: PROMPTS
# ----------------------------------
ROUTER_PROMPT = """Você é um LLM Router em um sistema médico multiagente. Sua função é avaliar se as informações fornecidas pelo usuário (médicos auxiliando pacientes) são SUFICIENTES para tomar uma decisão segura ou se é necessário solicitar mais dados.

CONTEXTO DO SISTEMA:
Este sistema possui 4 componentes:
1. VOCÊ (LLM Router): Responsável por analisar o input do usuário e, com base nas informações coletadas (possivelmente ao longo de várias interações), decidir se o caso precisa ser encaminhado para o Agente Emergencial, o Agente de Diagnóstico Diferencial, ou o Agente de Gerar Documentos.
   **O parâmetro "case_synthesis" deve ser atualizado a cada interação, agregando todas as informações coletadas e formando uma síntese técnica clara e completa do caso.**
2. Agente Emergencial: Especializado na orientação de casos que demandam atendimento imediato.
3. Agente de Diagnóstico Diferencial: Especializado na investigação de condições clínicas que não indiquem urgência imediata.
4. Agente de Gerar Documentos: Especializado em gerar documentos médicos como receitas, atestados e pedidos de exames com base nas informações fornecidas.

CRITÉRIOS DE INSUFICIÊNCIA DE INFORMAÇÕES:
Considere INSUFICIENTES os inputs que:
- Sejam menção isolada de um sintoma (ex.: "dor no peito", "febre", "dor de cabeça");
- Sejam apenas nomes de doenças sem qualquer contexto (ex.: "tuberculose", "diabetes");
- Sejam descrições vagas (ex.: "não me sinto bem", "estou doente");
- Não contenham detalhes como duração, intensidade ou outros dados clínicos relevantes;
- Para geração de documentos: não especifiquou o tipo de documento

SUA TAREFA ESPECÍFICA:
1. Avaliar se o input do usuário contém dados suficientes para decidir entre:
   - Caso emergencial
   - Caso para diagnóstico diferencial
   - Geração de documento médico
2. Se as informações forem insuficientes, escolher "ask_human" e solicitar detalhes adicionais.
3. Se as informações forem suficientes:
   - Decidir "emergencial", se os dados indicarem uma situação de risco imediato (por exemplo, dor torácica com irradiação, dispneia e outros sinais de alerta);
   - Decidir "diagnostico_diferencial", se os dados permitirem uma investigação diagnóstica sem indicar emergência;
   - IMPORTANTE: Decidir "gerar_documentos", IMEDIATAMENTE se o usuário mencionar QUALQUER pedido relacionado a:
     * Receitas médicas (qualquer menção a "receita", "prescrição", "medicação", "remédio") independente do remédio!
     * Atestados médicos (qualquer menção a "atestado", "declaração", "afastamento")
     * Pedidos de exame (qualquer menção a "exame", "teste", "análise") 
     * Se detectar QUALQUER pedido deste tipo, selecione "gerar_documentos" sem questionar detalhes sobre sintomas ou justificativas - o agente especializado fará isso posteriormente.

4. **Caso haja múltiplas interações para esclarecer o problema:**  
   A cada nova interação com o usuário, você deve atualizar o parâmetro "case_synthesis" agregando as novas informações à síntese acumulada. O "case_synthesis" deve refletir todas as informações obtidas até o momento. Ao final do processo, o campo "case_synthesis" deverá conter a síntese completa e atualizada de todo o caso.
   
   Essa síntese técnica deve:
   - Incluir dados relevantes fornecidos pelo usuário (sintomas, duração, medicamentos, tipo de documento, etc.);
   - Refletir de forma objetiva o entendimento acumulado do caso;
   - Servir como um briefing claro e preciso para o próximo agente.

REGRA PRIORITÁRIA: Se o input contiver QUALQUER menção a "receita", "prescrição", "atestado", "pedido de exame" ou termos semelhantes, ou desejo do usuario para gerar algum desses documentos, você DEVE escolher "gerar_documentos" independentemente de quaisquer outras considerações. Não questione a necessidade médica ou detalhes clínicos - essa análise será feita pelo agente especializado.

PARÂMETROS DA SUA RESPOSTA:
- "decision": Sua decisão final ("emergencial", "diagnostico_diferencial", "gerar_documentos" ou "ask_human").
- "case_synthesis": Deve ser preenchido ao longo da interação com o usuário e quando a decisão não for "ask_human".  
  Para casos encaminhados, ele consiste em uma síntese técnica que combina todas as informações relevantes coletadas no caso.
- "question_to_human": Pergunta(s) específica(s) para obter mais informações, a ser utilizado quando a decisão for "ask_human".
- "decision_reason": Justificativa para sua decisão, indique se as informações foram suficientes ou não e explicar quais dados faltaram, se for o caso.

EXEMPLOS CORRETOS:

INPUTS INSUFICIENTES:
Exemplo 1:  
Input: "Dor no peito"  
Resposta:
{
  "decision": "ask_human",
  "case_synthesis": "Dor no peito",
  "question_to_human": "Para avaliar melhor, por favor informe: há quanto tempo o paciente sente essa dor? Ela irradia para braço ou mandíbula? Há outros sintomas, como falta de ar ou náuseas?",
  "decision_reason": "Informações insuficientes. 'Dor no peito' isolada não permite avaliar gravidade sem dados adicionais sobre duração, irradiação e sintomas associados."
}

INPUTS SUFICIENTES:
Exemplo 2:  
Input: "Dor no peito intensa há 30 minutos que irradia para o braço esquerdo, com falta de ar e suor frio."  
Resposta:
{
  "decision": "emergencial",
  "case_synthesis": "Paciente com dor torácica intensa iniciada há 30 minutos, com irradiação para o braço esquerdo, associada à dispneia e diaforese, compatível com um quadro de síndrome coronariana aguda.",
  "question_to_human": "",
  "decision_reason": "As informações fornecidas são suficientes para indicar uma emergência devido ao conjunto de sinais clínicos presentes."
}

Exemplo 3:  
Input: "Paciente Maria Silva, 45 anos, com dor de cabeça frontal há 3 meses, sem náuseas ou alterações visuais, mas com piora à tarde. Sem febre ou outros sintomas associados."
Resposta:
{
  "decision": "diagnostico_diferencial",
  "case_synthesis": "Paciente Maria Silva, 45 anos, com cefaleia frontal persistente há 3 meses, sem sinais de alarme (ausência de náuseas, alterações visuais ou febre), com padrão de piora vespertina.",
  "question_to_human": "",
  "decision_reason": "As informações fornecidas são suficientes para orientar um diagnóstico diferencial de cefaleia crônica, embora não indiquem risco imediato."
}

Exemplo 4:  
Input: "Preciso de uma receita para o paciente."
Resposta:
{
  "decision": "gerar_documentos",
  "case_synthesis": "Solicitação de receita médica.",
  "question_to_human": "",
  "decision_reason": "Usuário mencionou 'receita', o que indica claramente a necessidade de geração de documento médico."
}


LEMBRE-SE: Caso haja qualquer dúvida sobre a suficiência das informações fornecidas pelo usuário, escolha a opção "ask_human". Utilize "ask_human" no máximo 3 vezes.

Agora, analise o caso apresentado pelo usuário:"""

ROUTER_PROMPT_OLD = """Você é um LLM Router em um sistema médico multiagente. Sua função é avaliar se as informações fornecidas pelo usuário (médicos auxiliando pacientes) são SUFICIENTES para tomar uma decisão segura ou se é necessário solicitar mais dados.
CONTEXTO DO SISTEMA:
Este sistema possui 3 componentes:
1. VOCÊ (LLM Router): Responsável por analisar o input do usuário e, com base nas informações coletadas (possivelmente ao longo de várias interações), decidir se o caso precisa ser encaminhado para o Agente Emergencial ou para o Agente de Diagnóstico Diferencial.
   **O parâmetro "case_synthesis" deve ser atualizado a cada interação, agregando todas as informações coletadas e formando uma síntese técnica clara e completa do caso.**
2. Agente Emergencial: Especializado na orientação de casos que demandam atendimento imediato.
3. Agente de Diagnóstico Diferencial: Especializado na investigação de condições clínicas que não indiquem urgência imediata.

CRITÉRIOS DE INSUFICIÊNCIA DE INFORMAÇÕES:
Considere INSUFICIENTES os inputs que:
- Sejam menção isolada de um sintoma (ex.: "dor no peito", "febre", "dor de cabeça");
- Sejam apenas nomes de doenças sem qualquer contexto (ex.: "tuberculose", "diabetes");
- Sejam descrições vagas (ex.: "não me sinto bem", "estou doente");
- Não contenham detalhes como duração, intensidade ou outros dados clínicos relevantes.  
Nesses casos, você DEVE escolher "ask_human" e fazer perguntas específicas para obter mais informações.

SUA TAREFA ESPECÍFICA:
1. Avaliar se o input do usuário contém dados clínicos suficientes para decidir se o caso é emergencial ou se precisa de uma investigação diagnóstica.
2. Se as informações forem insuficientes, escolher "ask_human" e solicitar detalhes adicionais.
3. Se as informações forem suficientes:
   - Decidir entre "emergencial", se os dados indicarem uma situação de risco imediato (por exemplo, dor torácica com irradiação, dispneia e outros sinais de alerta);
   - Ou "diagnostico_diferencial", se os dados permitirem uma investigação diagnóstica sem indicar emergência.
4. **Caso haja múltiplas interações para esclarecer o problema:**  
   A cada nova interação com o usuário, você deve atualizar o parâmetro "case_synthesis" agregando as novas informações à síntese acumulada. O "case_synthsesis" deve refletir todas as informações obtidas até o momento. Ao final do processo, quando você decidir entre "emergencial" ou "diagnostico_diferencial", o campo "case_synthesis" deverá conter a síntese completa e atualizada de todo o caso, servindo como um briefing claro e preciso para o próximo agente.
   
   Essa síntese técnica deve:
   - Incluir dados relevantes fornecidos pelo usuário (sintomas, duração, intensidade, evolução, etc.);
   - Refletir de forma objetiva o entendimento acumulado do caso;
   - Servir como um briefing claro e preciso para o próximo agente (emergencial ou diagnóstico diferencial).

PARÂMETROS DA SUA RESPOSTA:
- "decision": Sua decisão final ("emergencial", "diagnostico_diferencial" ou "ask_human").
- "case_synthesis": Deve ser preenchido ao longo da interação com o usuário e quando a decisão não for "ask_human".  
  Para casos encaminhados, ele consiste em uma síntese técnica que combina todas as informações relevantes coletadas no caso, permitindo que o próximo agente entenda o contexto clínico e as razões que fundamentaram a decisão.
- "question_to_human": Pergunta(s) específica(s) para obter mais informações, a ser utilizado quando a decisão for "ask_human".
- "decision_reason": Justificativa para sua decisão, indique se as informações foram suficientes ou não e explicar quais dados faltaram, se for o caso.

EXEMPLOS CORRETOS:

INPUTS INSUFICIENTES:
Exemplo 1:  
Input: "Dor no peito"  
Resposta:
{
  "decision": "ask_human",
  "case_synthesis": "Dor no peito",
  "question_to_human": "Para avaliar melhor, por favor informe: há quanto tempo o paciente sente essa dor? Ela irradia para braço ou mandíbula? Há outros sintomas, como falta de ar ou náuseas?",
  "decision_reason": "Informações insuficientes. 'Dor no peito' isolada não permite avaliar gravidade sem dados adicionais sobre duração, irradiação e sintomas associados."
}

Exemplo 2:  
Input: "Tuberculose"  
Resposta:
{
  "decision": "ask_human",
  "case_synthesis": "Tuberculose",
  "question_to_human": "O termo 'tuberculose' foi informado isoladamente. Por favor, forneça mais detalhes: quais sintomas o paciente apresenta, há quanto tempo, presença de tosse, febre ou perda de peso?",
  "decision_reason": "Input insuficiente. 'Tuberculose' sem contexto não permite determinar se o caso é uma suspeita, dúvida diagnóstica ou confirmação."
}

INPUTS SUFICIENTES:
Exemplo 3:  
Input: "Dor no peito intensa há 30 minutos que irradia para o braço esquerdo, com falta de ar e suor frio."  
Resposta:
{
  "decision": "emergencial",
  "case_synthesis": "Paciente com dor torácica intensa iniciada há 30 minutos, com irradiação para o braço esquerdo, associada à dispneia e diaforese, compatível com um quadro de síndrome coronariana aguda.",
  "question_to_human": "",
  "decision_reason": "As informações fornecidas são suficientes para indicar uma emergência devido ao conjunto de sinais clínicos presentes."
}

Exemplo 4 (com múltiplas interações):  
Durante a conversa, foram coletados os seguintes dados do paciente:
- Primeira interação: "Paciente com dor de cabeça."
   - parametro "case_synthesis": "Paciente com dor de cabeça."
- Segunda interação: "É uma dor frontal que vem há 3 meses."
   - parametro "case_synthesis": "Paciente com dor de cabeça frontal há 3 meses." 
- Terceira interação (após questionamento adicional): "Não há náuseas ou alterações visuais, mas a dor piora à tarde."
   - parametro "case_synthesis": "Síntese acumulada: Inicialmente relatada dor de cabeça inespecífica, evoluindo para uma dor frontal persistente há 3 meses, sem sinais de alarme (como náuseas ou alterações visuais) e com piora à tarde."
Resposta final:
{
  "decision": "diagnostico_diferencial",
  "case_synthesis": "Síntese acumulada: Inicialmente relatada dor de cabeça inespecífica, evoluindo para uma dor frontal persistente há 3 meses, sem sinais de alarme (como náuseas ou alterações visuais) e com piora à tarde.",
  "question_to_human": "",
  "decision_reason": "As informações acumuladas ao longo das interações são suficientes para orientar um diagnóstico diferencial, embora não indiquem risco imediato."
}

LEMBRE-SE: Caso haja qualquer dúvida sobre a suficiência das informações fornecidas pelo usuário, escolha a opção "ask_human". Utilize "ask_human" no máximo 3 vezes.

Agora, analise o caso apresentado pelo usuário:"""

EMERGENCIAL_PROMPT = """Você é um especialista médico. Avalie o caso emergencial para: {input} 

Objetivo:
Oferecer orientações urgentes e baseadas em evidências.

Instruções:
1. Avaliação: Identifique a condição emergencial provável.
2. Protocolo: Recomende a ativação imediata do SAMU (192), especifique a janela terapêutica e o nível do hospital necessário.
3. Intervenções: Sugira posicionamento, monitoramento de sinais vitais (e.g., FC, PA, O₂) e suporte pré-hospitalar.
4. Contraindicações: Aponte procedimentos e medicações a evitar.
5. Critérios de Gravidade: Destaque sinais que indiquem deterioração e necessidade de ação urgente.

Utilize terminologia médica precisa, baseando-se em protocolos atualizados (ACLS, ATLS, AHA) e adapte as instruções conforme o público (profissionais ou leigos)."""

DIAGNOSTICO_DIFERENCIAL_PROMPT = """Você é um especialista médico. Avalie o diagnóstico diferencial para: {input}
Instruções:
1. SÍNTESE: Resuma os dados clínicos principais.
2. DIAGNÓSTICOS: Liste 3–5 causas (por ordem de probabilidade), detalhando mecanismo, relação com o caso e sinais de alerta.
3. INVESTIGAÇÃO: Sugira exames (laboratoriais/imagem) e avaliações especializadas.
4. RECOMENDAÇÕES: Indique orientações não medicamentosas e critérios para atendimento urgente.

Regras:
- Use linguagem técnica e clara.
- Não prescreva medicamentos.
- Baseie sua análise em evidências clínicas atualizadas."""

GENERATE_PRESCRIPTION_PROMPT = """Você é responsável por gerar um output estruturado com base no input do médico (usuário), sem adicionar ou inventar nenhum medicamento que não tenha sido explicitamente informado.

INPUT DO USUÁRIO:
{input}

HISTÓRICO DA CONVERSA (se disponível):
{conversation_history}

INSTRUÇÕES PARA GERAÇÃO DA PRESCRIÇÃO:

1. DADOS DO PACIENTE (consultant):
   - name: Nome completo do paciente (string)
   - age: Idade do paciente (string)
   - gender: Gênero do paciente (string)

2. MEDICAMENTOS (prescriptions):
   Para cada medicamento que o médico indicar, forneça:
   - name: Nome do medicamento (utilize o nome genérico, se aplicável, conforme informado)
   - dosage: Dosagem específica (ex: "500mg", "10ml")
   - posology: Posologia detalhada (ex: "1 comprimido a cada 8 horas", "2 gotas em cada narina 3x/dia")

REGRAS IMPORTANTES:
1. Considere o histórico completo da conversa para contextualizar a prescrição, se disponível.
2. Utilize exclusivamente os medicamentos informados pelo médico.
3. NÃO crie ou invente nenhum medicamento que não esteja explicitamente indicado.
4. Todos os campos devem ser preenchidos obrigatoriamente.
5. O campo "prescriptions" deve ser sempre uma lista, mesmo que contenha apenas um medicamento.

FORMATO DE SAÍDA:
Gere a prescrição no formato JSON que corresponda exatamente à seguinte estrutura Pydantic:

{{
    "consultant": {{
        "name": "Nome do Paciente",
        "age": "Idade",
        "gender": "Gênero"
    }},
    "prescriptions": [
        {{
            "name": "Nome do Medicamento",
            "dosage": "Dosagem",
            "posology": "Posologia"
        }}
    ]
}}

Lembre-se:
- Utilize apenas os medicamentos explicitamente fornecidos pelo médico.
- Todos os campos são obrigatórios e o formato de saída deve corresponder exatamente à estrutura Pydantic.
"""

GENERATE_EXAM_REQUEST_PROMPT = """Você é especializado em gerar pedidos de exames estruturados de acordo com o input do usuário (médico).

INPUT DO USUÁRIO:
{input}

HISTÓRICO DA CONVERSA (se disponível):
{conversation_history}  

INSTRUÇÕES:
1. Analise cuidadosamente o INPUT DO USUÁRIO e o HISTÓRICO DA CONVERSA (se disponível)
2. Para o campo 'consultant' : transcreva o nome do paciente providenciado pelo usuario
2. Para o campo 'clinicalIndication': transcreva APENAS a indicação clínica fornecida pelo médico, sem adicionar hipóteses diagnósticas ou detalhes não mencionados
3. Para o campo 'request': transcreva APENAS o pedido de exame exatamente como informado pelo médico, sem elaborações adicionais
4. Mantenha a linguagem técnica e profissional, apropriada para documentação médica
5. NÃO INVENTE NENHUMA INFORMAÇÃO que não esteja explicitamente mencionada no input ou histórico
6. NÃO ADICIONE interpretações clínicas, hipóteses diagnósticas ou sugestões que não foram explicitamente fornecidas

FORMATO DE SAÍDA:
Sua resposta deve ser EXCLUSIVAMENTE um objeto JSON válido contendo apenas os campos 'clinicalIndication' e 'request', sem comentários adicionais, explicações ou marcações de código.

Exemplo de saída válida:
{{
    "consultant" : "Roberta Garcis",
    "clinicalIndication": "Dor retroauricular",
    "request": "Otoscopia bilateral"
}}"""

# ----------------------------------
# NODES AND CONDITIONAL EDGES
# ----------------------------------

# LLM router n
def llm_router(state: State):
      if state["messages"] and state["messages"][-1].type == "human":
            human_input = state["messages"][-1].content
            print("\nHuman input: ", human_input)

            response = model.invoke(state["messages"])

            print("THIS IS THE ROUTER RESPONSE:")
            pprint(response)
            
            state["decision"] = response.decision
            state["question_to_human"] = response.question_to_human
            state["case_synthesis"] = response.case_synthesis
            print("Added response to state:")
            print("Decision:", state["decision"])
            print("Question to Human:", state["question_to_human"])
            print("Case Synthesis:", state["case_synthesis"])

            # Add the next question to human or case_synthesis to the chat history
            if response.question_to_human and response.decision == "ask_human":
                 state["messages"].append(AIMessage(content=response.question_to_human))
            else:
                 state["messages"].append(AIMessage(content=response.case_synthesis))

      else:
            raise ValueError("Expected a human message in state['messages'].")

      return state

# Emergencial
def emergencial(state: State):
      global INTERACTION_COUNT
      print('INSIDE EMERGENCIAL')
      if state["case_synthesis"]:
            input = state["case_synthesis"]
            print(f"Using case_synthesis: {input}")
      else:
            input = next((msg for msg in reversed(state["messages"]) if msg.type == "ai"), state["messages"][1:])
            print(f"Falling back on the last message from the LLM router: {input}")

      response = ChatOpenAI(model="gpt-4o-mini").invoke(EMERGENCIAL_PROMPT.format(input=input))
      state["final_answer"] = response.content
      # Add final answer to the chat history
      state["messages"].append(AIMessage(content=response.content))
      # Reset count
      INTERACTION_COUNT = 0 
      
      return state

# Diagnositico Diferencial
def diagnostico_diferencial(state: State):
      global INTERACTION_COUNT
      print("INSIDE DIAGNOSTICO DIFERENCIAL")
      if state["case_synthesis"]:
            input = state["case_synthesis"]
            print(f"Using case_synthesis: {input}")
      else:
            input = next((msg for msg in reversed(state["messages"]) if msg.type == "ai"), state["messages"][1:])
            print(f"Falling back on the last message from the LLM router: {input}")
      
      response = ChatOpenAI(model="gpt-4o-mini").invoke(DIAGNOSTICO_DIFERENCIAL_PROMPT.format(input=input))
      state["final_answer"] = response.content
      # Add final answer to the chat history
      state["messages"].append(AIMessage(content=response.content))

      # Reset count
      INTERACTION_COUNT = 0 
      
      return state

# Human Node
def ask_human(state: State):
      print(" INSIDE ask_human node")
      question = state["question_to_human"]

      if state["messages"]:
          if not(state["messages"][-1].type == "ai"):
              #last_question = state["messages"][-1].content
              print("Warning: Last message to be asked to human is not of type 'ai'")
      else:
          print("Warning: No messages available in the state. Retaining original question value:", question)

      user_input = interrupt(value=question)     
      
      return Command(
        update={
            "messages": [
                {
                    "role": "human",
                    "content": user_input,
                }
            ]
            }
        ,
        goto="llm_router",
    )

# Conditional edge:
def router(state: State):
    global INTERACTION_COUNT
    decision = state.get("decision")
    if not isinstance(decision, str):
        raise ValueError(f"state['decision'] must be a string, but got {decision} of type {type(decision).__name__}")
    
    if decision not in VALID_DECISION_OPTIONS:
        raise ValueError(f"state['decision'] must be one of {VALID_DECISION_OPTIONS}, but got '{decision}'")
    
    if INTERACTION_COUNT >= 3:
         print(f"\n\n ****Warning: interaction number greater than {INTERACTION_COUNT}, routing to emergencial**** \n\n")
         return "emergencial"
    
    elif decision == "ask_human":
        INTERACTION_COUNT += 1 
        print(f"INSIDE ROUTER selected ask_human.\nINTERACTION COUNT: {INTERACTION_COUNT}")
        return "ask_human"
    elif decision == "diagnostico_diferencial":
        print("INSIDE ROUTER selected \"diagnostico_diferencial\"")
        return "diagnostico_diferencial"
    elif decision == "emergencial":
        print("INSIDE ROUTER selected \"emergencial\"")
        return "emergencial"
    elif decision == "gerar_documentos":
         print("INSIDE ROUTER selected \"gerar_documentos\"")
         return "gerar_documentos"


# ----------------------------------
# BUILDING AND COMPILING THE GRAPH
# ----------------------------------
workflow = StateGraph(State)
workflow.add_node("ask_human", ask_human)
workflow.add_node("llm_router", llm_router)  
workflow.add_node("diagnostico_diferencial", diagnostico_diferencial)
workflow.add_node("emergencial", emergencial)

workflow.add_edge(START, "llm_router")
workflow.add_edge("ask_human", "llm_router")
workflow.add_edge("diagnostico_diferencial", END)
workflow.add_edge("emergencial", END)
workflow.add_conditional_edges("llm_router", router)

memory = MemorySaver()

#agent = workflow.compile(checkpointer=memory)
#display(Image(app.get_graph().draw_mermaid_png()))

def compile_agent():
     return workflow.compile(checkpointer=memory)

def start_agent(agent: CompiledStateGraph, user_input: str, config: dict, ROUTER_PROMPT: str = ROUTER_PROMPT):

      for event in agent.stream(
            {
            "messages": [
                  (
                  "system",
                  ROUTER_PROMPT
                  ),
                  (
                  "user",
                  user_input, 
                  )
            ],
            "initial_human_input": user_input
            },
            config,
            stream_mode="values",
            ):
                  event["messages"][-1].pretty_print()

      return "Nonthing interesting :/"
     

if __name__ == "__main__" :
     
      diagnostico_diferencial_cases = [
      "Cefaleia frontal recorrente há meses, sem piora súbita ou sintomas neurológicos associados.", # OK
      "Dor lombar persistente por várias semanas, sem irradiação ou sinais de compressão medular.", # OK
      "Desconforto torácico leve e intermitente, sem irradiação ou dispneia aguda, com duração de dias.", # OK
      "Episódios intermitentes de tontura e vertigem leves, sem perda súbita de força ou alterações visuais.", # OK
      "Enxaqueca com aura, acompanhada de dor de cabeça intensa, fotofobia e sintomas visuais, persistindo por horas e melhorando com analgésicos." # OK
      ]

      emergencial_cases = [
      "Dor torácica intensa iniciada há 20 minutos, irradiando para o braço esquerdo, com dispneia e sudorese profusa.", # OK
      "Início súbito de fraqueza em um lado do corpo, dificuldade para falar e perda de equilíbrio.", # OK
      "Crise asmática com dificuldade respiratória, chiado intenso, cianose e incapacidade de falar", # OK
      "Reação alérgica com inchaço da face e lábios, dificuldade para respirar e sensação de desmaio após exposição a um alérgeno conhecido.", # OK
      "Dor abdominal intensa acompanhada de hipotensão, palidez e sudorese." # OK
      ]

      ambiguous_inputs = [
      "Tuberculose",
      "Dor no peito",
      "Paciente com febre",
      "Muita dor de ouvido e ansiedade",
      "Tenho dor de cabeça há dois dias."
      "Melanoma",
      "Dor de barriga e vomito"
      ]
      # Compile agent
      agent = compile_agent()
      # Config
      config = {"configurable": {"thread_id":  "test_python_thread"}}
      # Test question
      user_input = ambiguous_inputs[0]

      start_agent(agent, user_input = user_input, config = config)

      while True:
            state = agent.get_state(config)
            has_interrupt = False
            interrupt_value = None
            for task in state.tasks:
                  if hasattr(task, 'interrupts') and task.interrupts:
                        has_interrupt = True
                        interrupt_value = task.interrupts[0].value
                        break
            if has_interrupt:
                  # Show the interrupt value to the user (likely a question)
                  print(f"Agent asks: {interrupt_value}")
                  
                  # Get user input
                  user_response = input("Your response: ")
                  
                  # Resume graph with user input
                  for event in agent.stream(Command(resume=user_response), config = config, stream_mode="values"):
                       event["messages"][-1].pretty_print()
                     
             
            else:
                  # No interrupt, just waiting for normal user input
                  if not(agent.get_state(config).next):
                       print(" \n\n ---APPLICATION HAS ENDED---")
                       break
                  else:
                        print('\nERROR')
                        # ou colocar um continue pra continuar o while loop
