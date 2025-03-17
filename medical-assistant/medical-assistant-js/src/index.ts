/**
 * Medical Assistant Agent - JavaScript Implementation
 * 
 * This is the main entry point for the medical assistant agent.
 * It implements the same functionality as the Python version (agent.py)
 * but using LangGraph.js and LangChain.js.
 * 
 * The .env file should be located in the NodeInterrupt directory.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Calculate paths for logging purposes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../../..');

console.log('Starting Medical Assistant Agent...');
console.log(`Current directory: ${__dirname}`);
console.log(`Expected .env location: ${path.join(rootPath, '.env')}`);

// Import the agent module - Note the .js extension is still needed even in TypeScript 
// because we're using Node's ESM system with "moduleResolution": "NodeNext"
import './agent/agent.js';

console.log('Medical Assistant Agent - JavaScript Implementation initialized'); 



/*
General notes:
langgraph dev does not support JavaScript-based LangGraph using langgraph dev
*/