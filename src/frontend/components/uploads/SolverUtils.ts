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
 * This function simplifies the process by:
 * 1. Locating the `solve` function.
 * 2. Removing docstrings and comments.
 * 3. Extracting the first `return` statement.
 * 4. Parsing the returned variables.
 *
 * @param content - The content of the Python file as a string.
 * @returns An array of Parameter objects representing the output parameters.
 */
export const extractOutputs = (content: string): Parameter[] => {
  // Step 1: Locate the `solve` function using a simplified regex
  const funcMatch = content.match(/def\s+solve\s*\([^)]*\):([\s\S]*)/);
  //console.log("ExtractOutputs - Function Match:", funcMatch);

  if (!funcMatch) {
    toast.error("No `solve` function found in the file.");
    return [];
  }

  let solveBody = funcMatch[1];

  // Step 2: Remove multi-line docstrings ("""...""" or '''...''')
  solveBody = solveBody.replace(/(""".*?"""|'''.*?''')/gs, "");
  //console.log("ExtractOutputs - After Removing Docstrings:", solveBody);

  // Step 3: Remove single-line comments (# ...)
  solveBody = solveBody.replace(/#.*$/gm, "");
  //console.log("ExtractOutputs - After Removing Comments:", solveBody);

  // Step 4: Find the first `return` statement
  const returnMatch = solveBody.match(/return\s+(.+)/);
  //console.log("ExtractOutputs - Return Match:", returnMatch);

  if (!returnMatch) {
    toast.warning("No `return` statement found in the `solve` function.");
    return [];
  }

  let returnStatement = returnMatch[1].trim();
  //console.log("ExtractOutputs - Return Statement:", returnStatement);

  // Step 5: Handle potential multi-line return statements with parentheses
  // Remove enclosing parentheses if present
  returnStatement = returnStatement.replace(/^\(([\s\S]*)\)$/, "$1").trim();
  //console.log("ExtractOutputs - Cleaned Return Statement:", returnStatement);

  // Step 6: Split return variables, handling nested structures
  const returnVariables = splitReturnVariables(returnStatement);
  //console.log("ExtractOutputs - Return Variables:", returnVariables);

  return returnVariables.map((variable) => ({
    name: variable,
    type: "any", // Placeholder for type, to be edited by user
    description: "",
  }));
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

  for (let char of returnStr) {
    if (char === "," && bracketDepth === 0) {
      if (currentVar.trim()) {
        variables.push(currentVar.trim());
        currentVar = "";
      }
    } else {
      if (char === "(" || char === "[" || char === "{") {
        bracketDepth++;
      } else if (char === ")" || char === "]" || char === "}") {
        bracketDepth--;
      }
      currentVar += char;
    }
  }

  if (currentVar.trim()) {
    variables.push(currentVar.trim());
  }

  return variables;
};
