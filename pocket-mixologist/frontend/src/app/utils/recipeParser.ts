export type ParsedRecipe = {
  name: string;
  ingredients: string[];
  instructions: string[];
  glass?: string;
  garnish?: string;
  notes?: string;
};

/**
 * Parses a cocktail recipe from message content
 */
export function parseRecipe(content: string): ParsedRecipe | null {
  // If the message doesn't contain a recipe, return null
  if (!isRecipe(content)) {
    return null;
  }
  
  let name = '';
  const ingredients: string[] = [];
  const instructions: string[] = [];
  let glass: string | undefined;
  let garnish: string | undefined;
  let notes: string | undefined;
  
  // Extract the cocktail name from the title
  const titleMatch = content.match(/## (.*)/);
  if (titleMatch) {
    name = titleMatch[1].trim();
  }
  
  // Split content into lines
  const lines = content.split('\n');
  
  // Track which section we're in
  let currentSection: 'ingredients' | 'instructions' | 'other' = 'other';
  
  // Process each line
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) {
      continue;
    }
    
    // Check for section headers
    if (trimmedLine === 'Ingredients:') {
      currentSection = 'ingredients';
      continue;
    } else if (trimmedLine === 'Instructions:') {
      currentSection = 'instructions';
      continue;
    } else if (/^Glass:/.test(trimmedLine)) {
      glass = trimmedLine.replace(/^Glass:\s*/, '').trim();
      currentSection = 'other';
      continue;
    } else if (/^Garnish:/.test(trimmedLine)) {
      garnish = trimmedLine.replace(/^Garnish:\s*/, '').trim();
      currentSection = 'other';
      continue;
    } else if (/^Note:/.test(trimmedLine) || /^Notes:/.test(trimmedLine)) {
      notes = trimmedLine.replace(/^Notes?:\s*/, '').trim();
      currentSection = 'other';
      continue;
    }
    
    // Process content based on current section
    if (currentSection === 'ingredients' && trimmedLine.startsWith('-')) {
      ingredients.push(trimmedLine.substring(1).trim());
    } else if (currentSection === 'instructions' && /^\d+\./.test(trimmedLine)) {
      instructions.push(trimmedLine.replace(/^\d+\.\s*/, '').trim());
    } else if (currentSection === 'other' && !name && trimmedLine.startsWith('#')) {
      // Backup for title if we missed it initially
      name = trimmedLine.replace(/^#+\s*/, '').trim();
    }
  }
  
  // If we couldn't extract a name, use a generic one
  if (!name) {
    name = 'Cocktail Recipe';
  }
  
  return {
    name,
    ingredients,
    instructions,
    glass,
    garnish,
    notes
  };
}

/**
 * Checks if the message content contains a cocktail recipe
 */
export function isRecipe(content: string): boolean {
  // Check for common recipe patterns
  return (
    content.includes('Ingredients:') && 
    content.includes('Instructions:') && 
    (content.includes('oz') || content.includes('ml') || content.includes('cl'))
  );
}

/**
 * Extracts all cocktail recipes from a list of messages
 */
export function extractRecipesFromMessages(messages: Array<{content: string; role: string}>): ParsedRecipe[] {
  const recipes: ParsedRecipe[] = [];
  
  for (const message of messages) {
    // Only check assistant messages
    if (message.role !== 'assistant') {
      continue;
    }
    
    const recipe = parseRecipe(message.content);
    if (recipe) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
} 