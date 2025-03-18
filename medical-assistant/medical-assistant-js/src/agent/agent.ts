import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Import schemas from our new schemas.ts file
import { RouterResponseSchema, DECISION_TYPES, RouterResponse } from "../schemas/schemas.js";
import { ROUTER_PROMPT, EMERGENCIAL_PROMPT, DIAGNOSTICO_DIFERENCIAL_PROMPT } from "../prompts/prompts.js";

// Calculate path to the root NodeInterrupt directory (3 levels up from agent.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../../..');

// Load environment variables from .env in the NodeInterrupt directory
const dotenvResult = dotenv.config({ path: path.join(rootPath, '.env') });
if (dotenvResult.error) {
  console.warn("⚠️  Warning: Could not load .env file. Ensure that the .env file exists at the NodeInterrupt directory.");
  console.warn(`Looking for .env at: ${path.join(rootPath, '.env')}`);
}

// Destructure required environment variables for safe use.
const {
  OPENAI_API_KEY,
  LANGSMITH_TRACING,
  LANGSMITH_ENDPOINT,
  LANGSMITH_API_KEY,
  LANGSMITH_PROJECT
} = process.env;

// Optionally, verify that each required variable is set.
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'LANGSMITH_TRACING',
  'LANGSMITH_ENDPOINT',
  'LANGSMITH_API_KEY',
  'LANGSMITH_PROJECT'
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.warn(`Warning: Environment variable ${varName} is not set.`);
  }
});

// Imports
import { z } from "zod"; // for pydantic stuff
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import {
  MessagesAnnotation,
  Annotation,
  StateGraph,
  START,
  END,
  MemorySaver,
  interrupt,
  Command,
  messagesStateReducer
} from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { PromptTemplate } from "@langchain/core/prompts";

console.log("Agent file loaded successfully");

// Helper function to pretty print messages
function prettyPrintMessage(message: BaseMessage) {
  // Check if it's a message object
  if (!message || typeof message !== 'object') {
    console.log("Not a valid message object");
    return;
  }
  
  // Determine the type
  let type = "Unknown";
  if (message instanceof HumanMessage) {
    type = "Human";
  } else if (message instanceof AIMessage) {
    type = "AI";
  } else if (message instanceof SystemMessage) {
    type = "System";
  }
  
  // Format and print
  console.log(`[${type}]: ${message.content}`);
}

// Variables and Global variables 
let INTERACTION_COUNT = 0;
const VALID_DECISION_OPTIONS = ["emergencial", "diagnostico_diferencial", "ask_human"];
const model_emergencial = new ChatOpenAI({ modelName: "gpt-4o-mini" });

// Graph State
// Extend the base MessagesAnnotation state with another field
const AgentState = Annotation.Root({
  ...MessagesAnnotation.spec,
  // Override the messages annotation to include default system message
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [new SystemMessage(ROUTER_PROMPT)]
  }),
  decision: Annotation({
    reducer: (old: string, update: typeof DECISION_TYPES[number]) => {
      const validValues = DECISION_TYPES;
      if (!validValues.includes(update)) {
        throw new Error(`Invalid decision value: ${update}. Must be one of: ${validValues.join(', ')}`);
      }
      return update;
    },
    default: () => "" as typeof DECISION_TYPES[number]
  }),
  case_synthesis: Annotation({
    value: (old: string | null, update: string | null) => update,
    default: () => null as string | null
  }),
  question_to_human: Annotation({
    value: (old: string | null, update: string | null) => update,
    default: () => null as string | null
  }),
  final_answer: Annotation({
    value: (old: string | null, update: string | null) => update,
    default: () => null as string | null
  })
});


// -------------------------------
// LLM MODEL FOR ROUTER LLM
//--------------------------------
const m = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
});

const model = m.withStructuredOutput(RouterResponseSchema);

// ----------------------------------
// NODES AND CONDITIONAL EDGES
// ----------------------------------

// llm_router
async function llm_router(state: typeof AgentState.State) {
  
  if (state.messages.length > 0) {
    const lastMessage = state.messages[state.messages.length - 1];
    // Check if the last message is a HumanMessage by examining its constructor name
    if (lastMessage instanceof HumanMessage) {
      const humanInput = lastMessage.content;
      const response: RouterResponse = await model.invoke(state.messages);

      console.log("\nTHIS IS THE ROUTER RESPONSE SYNTHESIS:");
      console.log(response.case_synthesis);
      console.log("\nTHIS IS THE DECISION REASON:");
      console.log(response.decision_reason);  

      // Add the next question to human or case_synthesis to the chat history
      if (response.question_to_human && response.decision === "ask_human") {
        state.messages.push(new AIMessage(response.question_to_human));
      } 
      
      // No need to add the case_synthesis to the messages, because we dont want to display it to the user
      // else if (response.case_synthesis) {
      //   state.messages.push(new AIMessage(response.case_synthesis));
      // }

      const newState = {
            decision: response.decision,
            case_synthesis: response.case_synthesis || null,
            question_to_human: response.question_to_human || null
          };

      return newState;
    } else {
      throw new Error("Expected a human message in state.messages.");
    }
  } else {
    throw new Error("Expected messages in state.messages but found none.");
  }
} 

async function ask_human(state: typeof AgentState.State){
  console.log("INSIDE ask_human node")
  const question = state.question_to_human
  // state.question_to_human should contain same string as the last AIMessage in messages:
  // Create a reversed copy of the messages array
              // const reversedMessages = [...state.messages].reverse();
                
              // // Find the first message in the reversed array that is an instance of AIMessage
              // const lastAIMessage = reversedMessages.find(msg => msg instanceof AIMessage);

              // if (lastAIMessage) {
              // // Now lastAIMessage contains the last AIMessage in the original array
              // console.log("Last AI message content:", lastAIMessage.content);
              // } else {
              // console.log("No AIMessage found in the messages array");
              // }
  
  const user_input = interrupt({ value: question });

  return new Command({
    update: {
      messages: [
        {
          role: "human",
          content: user_input,
        },
      ],
    },
    goto: "llm_router",
  });
}

async function emergencial(state: typeof AgentState.State) {
  // Use let for variables that need to be reassigned
  console.log("INSIDE EMERGENCIAL");

  let input: string;

  if (state.case_synthesis) {
    input = state.case_synthesis;
    //console.log(`Using case_synthesis: ${input}`);
  } else {
    // Fallback: use the conversation history excluding the system message (the very first message in state.messages)
    const conversationHistory = state.messages.slice(1);
    if (conversationHistory.length > 0) {
      input = conversationHistory.map(msg => String(msg.content)).join("\n");
      console.warn(`Falling back on the conversation history: ${input}`);
    } else {
      throw new Error("No conversation history found in state.messages (excluding the system message).");
    }
  }
  const formattedPrompt = EMERGENCIAL_PROMPT.replace("{input}", input);
  const response = await model_emergencial.invoke(formattedPrompt);
  state.messages.push(new AIMessage({ content: String(response.content) }));
  
  // Reset INTERACTION_COUNT to zero
  INTERACTION_COUNT = 0;

  const newState = {
      final_answer: response.content
    };
  return newState;
}
async function diagnostico_diferencial(state: typeof AgentState.State) {
  console.log(`INSIDE diagnostico_diferencial`);

  let input: string;

  if (state.case_synthesis) {
    input = state.case_synthesis;
    //console.log(`Using case_synthesis: ${input}`);
  }  else {
    // Fallback: use the conversation history excluding the system message (the very first message in state.messages)
    const conversationHistory = state.messages.slice(1);
    if (conversationHistory.length > 0) {
      input = conversationHistory.map(msg => String(msg.content)).join("\n");
      console.warn(`Falling back on the conversation history: ${input}`);
    } else {
      throw new Error("No conversation history found in state.messages (excluding the system message).");
    }
  }

  const formattedPrompt = DIAGNOSTICO_DIFERENCIAL_PROMPT.replace("{input}", input);
  const response = await model_emergencial.invoke(formattedPrompt);
  state.messages.push(new AIMessage({ content: String(response.content) }));
  
   // Reset INTERACTION_COUNT to zero
  INTERACTION_COUNT = 0;

  const newState = {
      final_answer: response.content
    };
  return newState;

}

// CONDITIONAL EDGE
const router = function(state: typeof AgentState.State) {
  // Get decision from state
  const decision = state.decision;
  // Validate decision is a string (this is redundant in TypeScript with proper typing, but keeping for consistency)
  if (typeof decision !== 'string') {
    throw new Error(`state.decision must be a string, but got ${decision} of type ${typeof decision}`);
  }
  // Validate decision is a valid option
  if (!VALID_DECISION_OPTIONS.includes(decision)) {
    throw new Error(`state.decision must be one of ${VALID_DECISION_OPTIONS.join(', ')}, but got '${decision}'`);
  }
  // Check if we've exceeded max interaction count
  if (INTERACTION_COUNT >= 3 && decision === "ask_human") {
    console.log("\n\n ****Warning: interaction number greater than 3, routing to emergencial**** \n\n");
    return "emergencial";
  }
  // Route based on decision
  else {  
    if (decision === "ask_human") {
      INTERACTION_COUNT += 1;
      console.log(`INSIDE ROUTER selected ask_human.\nINTERACTION COUNT: ${INTERACTION_COUNT}`);
      return "ask_human";
    } else if (decision === "diagnostico_diferencial") {
        console.log("INSIDE ROUTER selected diagnostico_diferencial");
        return "diagnostico_diferencial";
    } else if (decision === "emergencial") {
        console.log("INSIDE ROUTER selected \"emergencial\"");
        return "emergencial";
    }
  }
  
  // Default fallback (should never reach here with proper validation)
  console.log("WARNING: No valid decision found, defaulting to emergencial");
  return "emergencial";
}
  

// ----------------------------------
// BUILDING AND COMPILING THE GRAPH
// ----------------------------------
const workflow = new StateGraph(AgentState)
.addNode("llm_router", llm_router)
.addNode("ask_human", ask_human)
.addNode("diagnostico_diferencial", diagnostico_diferencial)
.addNode("emergencial", emergencial)
.addEdge(START, "llm_router")
.addEdge("ask_human", "llm_router")
.addEdge("diagnostico_diferencial", END)
.addEdge("emergencial", END)
.addConditionalEdges("llm_router", router)

// const agent = workflow.compile({ checkpointer: new MemorySaver() });

// Export the compiled workflow for LangGraph to use
export const agent = workflow.compile({ checkpointer: new MemorySaver() });


const config = { configurable: { thread_id: "test_2" } };


// Exemplo emergencial
//const example_input = "Crise asmática com dificuldade respiratória, chiado intenso, cianose e incapacidade de falar"
// Exemplo de diagnostico diferencial
//const example_input = "Enxaqueca com aura, acompanhada de dor de cabeça intensa, fotofobia e sintomas visuais, persistindo por horas e melhorando com analgésicos." 
// Exemplo ambiguo
const example_input = "tuberculose"
const input = {
  messages: [
    //new SystemMessage(ROUTER_PROMPT),
    new HumanMessage(example_input)
  ],
  initial_human_input: example_input,
};

// Run the agent
const runAgent = async () => {
  console.log(`INTERACTION_COUNT before agent execution: ${INTERACTION_COUNT}`)
  try {
    let iterationCount = 0;
    const MAX_ITERATIONS = 10;
    
    // Initial stream
    let stream = await agent.stream(input, {
      ...config,
      streamMode: "values" as const
    });
    
    // Process initial stream
    for await (const event of stream) {
      // Get the last message
      const lastMessage = event.messages[event.messages.length - 1];
      // Print it nicely
      prettyPrintMessage(lastMessage);
    }
    
    // Main loop for handling interrupts and checking state
    while (iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      
      // Get the current state
      const state = await agent.getState(config);     
      // Print state information
      // console.log("\n----- STATE OBJECT DETAILS -----");
      // console.log("State keys:", Object.keys(state));
      // console.log("state.next:", state.next);
      // console.log("state.tasks:", state.tasks);
      // if (state.values) {
      //   console.log("state.values.final_answer:", state.values.final_answer);
      //   console.log("state.values.decision:", state.values.decision);
      //   console.log("state.values.case_synthesis:", state.values.case_synthesis);
      //   console.log("state.values.question_to_human:", state.values.question_to_human);
      // }      
      // console.log("----- END STATE DETAILS -----\n");      
      

      // Check for interrupts
      let hasInterrupt = false;
      let interruptValue = null;
      
      if (state.tasks) {
        for (const task of state.tasks) {
          if (task.interrupts && task.interrupts.length > 0) {
            hasInterrupt = true;
            interruptValue = task.interrupts[0].value;
            break;
          }
        }
      }
      
      if (hasInterrupt) {
        // Create readline interface for user input
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        // Get user input with a Promise
        const userResponse = await new Promise<string>((resolve) => {
          rl.question('Digite a sua resposta: ', (answer) => {
            resolve(answer);
            rl.close();
          });
        });
        
        // Resume the graph with the user input
        stream = await agent.stream(new Command({resume: userResponse}), {
          ...config,
          streamMode: "values" as const
        });
        
        // Process the new stream events
        for await (const event of stream) {
          const lastMessage = event.messages[event.messages.length - 1];
          prettyPrintMessage(lastMessage);
        }
      } else {
        if (!state.next || state.next.length === 0) {
          console.log("state.next is empty, breaking loop");
          break;
        } else {
          console.log(`state.next exists: ${state.next}`);
          // Continue loop execution
        }
      }
    }
    
    if (iterationCount >= MAX_ITERATIONS) {
      console.log(`Reached maximum iterations (${MAX_ITERATIONS})`);
    }
    
  } catch (error) {
    console.error("Error running agent:", error);
  }

  console.log(`\n\nINTERACTION_COUNT after agent execution: ${INTERACTION_COUNT}`)
};
    
// runAgent();



// Only run the agent when executed directly
try {
  if (import.meta.url && process.argv[1] && import.meta.url === fileURLToPath(process.argv[1])) {
    runAgent();
  }
} catch (error) {
  console.warn("Could not determine if running directly, skipping automatic execution");
}