// solverUtils.ts

import { toast } from "sonner";

export interface Parameter {
  name: string;
  type: string;
  description: string;
  default_value?: string;
}

/**
 * Extracts input parameters from the `solve` function in the provided Python content.
 * @param content - The content of the Python file as a string.
 * @returns An array of Parameter objects representing the input parameters.
 */
export const extractParameters = (content: string): Parameter[] => {
  const funcMatch = content.match(/def\s+solve\s*\(([^)]*)\)/);
  if (!funcMatch) {
    toast.error("No `solve` function found in the file.");
    return [];
  }

  const paramsString = funcMatch[1];
  const params = paramsString.split(",").map((param) => {
    const [nameAndType, defaultValue] = param.split("=").map((p) => p.trim());
    const [name, type] = nameAndType.split(":").map((p) => p.trim());

    return {
      name,
      type: type || "any",
      description: "",
      default_value: defaultValue || undefined, // Display default value if present
    };
  });

  return params.filter((param) => param.name);
};

/**
 * Extracts output parameters from the `solve` function in the provided Python content.
 * Handles both tuple returns and dictionary returns.
 *
 * @param content - The content of the Python file as a string.
 * @returns An array of Parameter objects representing the output parameters.
 */
export const extractOutputs = (content: string): Parameter[] => {
  // Step 1: Locate the `solve` function using an improved regex that captures the entire function body
  const funcMatch = content.match(/def\s+solve\s*\([^)]*\):([\s\S]*?)(?=def\s+\w+\s*\(|$)/);
  
  if (!funcMatch) {
    toast.error("No `solve` function found in the file.");
    return [];
  }
  console.log("Function Match:", funcMatch);

  let solveBody = funcMatch[1];

  // Step 2: Remove multi-line docstrings ("""...""" or '''...''')
  solveBody = solveBody.replace(/(""".*?"""|'''.*?''')/gs, "");
  
  // Step 3: Remove single-line comments (# ...)
  solveBody = solveBody.replace(/#.*$/gm, "");
  
  // Step 4: Find the last `return` statement to handle multiple returns gracefully
  const returnMatches = solveBody.match(/return\s+(.+)/gs);

  console.log("Return Matches:", returnMatches);

  
  if (!returnMatches || returnMatches.length === 0) {
    toast.warning("No `return` statement found in the `solve` function.");
    return [];
  }
  
  // Assuming the last return statement is the one that returns the result
  const lastReturn = returnMatches[returnMatches.length - 1];
  const returnMatch = lastReturn.match(/return\s+(.+)/s); // 's' flag for dot to match newlines

  if (!returnMatch) {
    toast.warning("No valid `return` statement found in the `solve` function.");
    return [];
  }

  let returnStatement = returnMatch[1].trim();

  console.log("Return Statement:", returnStatement);


  // Step 5: Determine if the return statement is a dictionary or a tuple/list
  const isDict = returnStatement.startsWith("{") && returnStatement.endsWith("}");

  console.log("Is Dictionary:", isDict);


  if (isDict) {
    // Handle dictionary return
    return extractDictReturn(returnStatement);
  } else {
    // Handle tuple or list return
    return extractTupleReturn(returnStatement);
  }
};

/**
 * Handles extraction of output parameters when the return statement is a dictionary.
 * @param returnStr - The return statement string.
 * @returns An array of Parameter objects representing the output parameters.
 */
const extractDictReturn = (returnStr: string): Parameter[] => {
  // Remove the enclosing braces
  const dictContent = returnStr.slice(1, -1).trim();

  // Split key-value pairs considering possible nested structures
  const keyValuePairs = splitKeyValuePairs(dictContent);

  // Extract keys
  const keys = keyValuePairs.map(pair => {
    const colonIndex = pair.indexOf(":");
    if (colonIndex === -1) {
      return pair.trim(); // In case there's no colon, which shouldn't happen
    }
    let key = pair.slice(0, colonIndex).trim();

    // Remove quotes around the key if present
    key = key.replace(/^['"]|['"]$/g, "");



    return key;
  });

  // Generate Parameter objects
  const parameters: Parameter[] = keys.map((key) => ({
    name: key,
    type: "any", // Placeholder for type, to be edited by user
    description: "",
  }));
  console.log("Extracted Parameters:", parameters);
  return parameters;
};

/**
 * Handles extraction of output parameters when the return statement is a tuple or list.
 * @param returnStr - The return statement string.
 * @returns An array of Parameter objects representing the output parameters.
 */
const extractTupleReturn = (returnStr: string): Parameter[] => {
  // Split return variables, handling nested structures
  const returnVariables = splitReturnVariables(returnStr);

  return returnVariables.map((variable, index) => ({
    name: variable || `output_${index + 1}`,
    type: "any", // Placeholder for type, to be edited by user
    description: "",
  }));
};

/**
 * Splits the return statement into individual key-value pairs, handling nested structures.
 * @param dictContent - The content inside the dictionary braces.
 * @returns An array of key-value pair strings.
 */
const splitKeyValuePairs = (dictContent: string): string[] => {
  const pairs: string[] = [];
  let currentPair = "";
  let bracketDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < dictContent.length; i++) {
    const char = dictContent[i];
    const prevChar = dictContent[i - 1];

    // Handle string literals to avoid splitting inside strings
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    if (!inString) {
      if (char === "{" || char === "[" || char === "(") {
        bracketDepth++;
      } else if (char === "}" || char === "]" || char === ")") {
        bracketDepth--;
      } else if (char === "," && bracketDepth === 0) {
        // Split here
        if (currentPair.trim()) {
          pairs.push(currentPair.trim());
          currentPair = "";
          continue;
        }
      }
    }

    currentPair += char;
  }

  if (currentPair.trim()) {
    pairs.push(currentPair.trim());
  }

  return pairs;
};

/**
 * Splits the return statement into individual variables, handling nested structures.
 * @param returnStr - The cleaned return statement string.
 * @returns An array of variable names as strings.
 */
export const splitReturnVariables = (returnStr: string): string[] => {
  const variables: string[] = [];
  let currentVar = "";
  let bracketDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let char of returnStr) {
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      stringChar = char;
    } else if (char === stringChar && inString) {
      inString = false;
    }

    if (!inString) {
      if (char === "(" || char === "[" || char === "{") {
        bracketDepth++;
      } else if (char === ")" || char === "]" || char === "}") {
        bracketDepth--;
      } else if (char === "," && bracketDepth === 0) {
        if (currentVar.trim()) {
          variables.push(currentVar.trim());
          currentVar = "";
          continue;
        }
      }
    }

    currentVar += char;
  }

  if (currentVar.trim()) {
    variables.push(currentVar.trim());
  }

  return variables;
};
