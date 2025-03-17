import { z } from "zod";

// Define constants
export const DECISION_TYPES = ["emergencial", "diagnostico_diferencial", "ask_human", ""] as const;

// Zod schema definition with proper TypeScript typing
export const RouterResponseSchema = z.object({
  decision: z.enum(DECISION_TYPES).describe("Decisão sobre qual caminho seguir com base na descrição do paciente"),
  
  case_synthesis: z.string().nullable().optional()
    .describe("Síntese técnica do caso a ser analisado"),
  
  question_to_human: z.string().nullable().optional()
    .describe("Pergunta específica para o usuário quando há necessidade de esclarecimento"),
  
  decision_reason: z.string().nullable().optional()
    .describe("Explicação pela qual a decisão emergencial, diagnostico_diferencial, ask_human foi feita.")
});

// Export the inferred type from the schema
export type RouterResponse = z.infer<typeof RouterResponseSchema>;

// Equivalent JSONSchema object
export const RouterResponseJSONSchema = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "RouterResponse",
  "type": "object",
  "properties": {
    "decision": {
      "type": "string",
      "enum": DECISION_TYPES,
      "description": "Decisão sobre qual caminho seguir com base na descrição do paciente"
    },
    "case_synthesis": {
      "type": ["string", "null"],
      "description": "Síntese técnica do caso a ser analisado"
    },
    "question_to_human": {
      "type": ["string", "null"],
      "description": "Pergunta específica para o usuário quando há necessidade de esclarecimento"
    },
    "decision_reason": {
      "type": ["string", "null"],
      "description": "Explicação pela qual a decisão emergencial, diagnostico_diferencial, ask_human foi feita."
    }
  },
  "required": ["decision"]
}; 