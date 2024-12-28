export interface GuidelineValidation {
  entryPoint: boolean;
  returnStatement: boolean;
  nestedFunctions: boolean;
}

export const validateGuidelines = (content: string): GuidelineValidation => {
  const validation = {
    entryPoint: false,
    returnStatement: false,
    nestedFunctions: true, // Start true, set to false if nested functions found
  };

  // Check for solve function
  const solveFunction = content.match(/def\s+solve\s*\([^)]*\):/);
  validation.entryPoint = !!solveFunction;

  if (solveFunction) {
    // Get the function body
    const functionStart = content.indexOf(solveFunction[0]);
    const functionBody = content.slice(functionStart);
    
    // Check for return statement
    validation.returnStatement = /\breturn\b/.test(functionBody);

    // Check for nested functions (simplified check)
    const nestedFunctionCheck = functionBody.match(/def\s+\w+\s*\([^)]*\):/g);
    if (nestedFunctionCheck && nestedFunctionCheck.length > 1) {
      validation.nestedFunctions = false;
    }
  }

  return validation;
};