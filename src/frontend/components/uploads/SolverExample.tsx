// SolverExample.tsx
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const exampleCode = `# Simulated Annealing Algorithm Implementation
import numpy as np
import time

def compute_cost(qubo_matrix, solution, constant):
    """
    Computes the cost for a given solution based on the QUBO matrix and constant.
    """
    return solution @ qubo_matrix @ solution.T + constant

def solve(qubo_matrix, constant, initial_temperature=1000, cooling_rate=0.99, max_iterations=1000):
    """
    Implements Simulated Annealing for QUBO optimization.
    """
    #if parameters is None:
    #    parameters = {}
    
    #initial_temperature = parameters.get('initial_temperature', 1000)
    #cooling_rate = parameters.get('cooling_rate', 0.99)
    #max_iterations = parameters.get('max_iterations', 1000)
    
    num_vars = qubo_matrix.shape[0]

    # Initialize random solution
    current_solution = np.random.randint(0, 2, num_vars)
    current_cost = compute_cost(qubo_matrix, current_solution, constant)

    best_solution = current_solution.copy()
    best_cost = current_cost

    costs_per_iteration = []
    temperature = initial_temperature

    start_time = time.time()

    for iteration in range(max_iterations):
        # Generate a neighbor by flipping a random bit
        neighbor = current_solution.copy()
        flip_index = np.random.randint(num_vars)
        neighbor[flip_index] = 1 - neighbor[flip_index]  # Flip the bit

        # Compute cost of the neighbor
        neighbor_cost = compute_cost(qubo_matrix, neighbor, constant)

        # Decide whether to accept the neighbor
        cost_difference = neighbor_cost - current_cost
        if cost_difference < 0 or np.random.rand() < np.exp(-cost_difference / temperature):
            current_solution = neighbor
            current_cost = neighbor_cost

            # Update best solution if new solution is better
            if current_cost < best_cost:
                best_solution = current_solution.copy()
                best_cost = current_cost

        # Record the current cost
        costs_per_iteration.append(current_cost)

        # Cool down the temperature
        temperature *= cooling_rate

        # Stop if the temperature is too low
        if temperature < 1e-6:
            break

    end_time = time.time()
    elapsed_time = end_time - start_time

    return best_solution, best_cost, costs_per_iteration, elapsed_time`;

export const SolverExample = () => {
  /**
   * Helper function to highlight parameters within the function definition.
   * @param paramsStr - The string containing all parameters.
   * @returns JSX elements with highlighted parameters.
   */
  const highlightParameters = (paramsStr: string) => {
    // Split parameters by comma, considering default values
    const params = paramsStr.split(",").map(param => param.trim());

    return params.map((param, index) => {
      // Extract parameter name and type (if any)
      const [name, type] = param.split(":").map(part => part.trim());

      return (
        <span key={index} className="text-blue-600">
          {name}{type ? `: ${type}` : ""}
          {index < params.length - 1 ? ", " : ""}
        </span>
      );
    });
  };

  /**
   * Helper function to highlight return variables.
   * @param returnStr - The string containing all return variables.
   * @returns JSX elements with highlighted return variables.
   */
  const highlightReturns = (returnStr: string) => {
    // Handle multi-line returns enclosed in parentheses
    const cleanedReturn = returnStr.replace(/^\(([\s\S]*)\)$/, "$1").trim();

    // Split return variables by comma, considering nested structures
    const variables = splitReturnVariables(cleanedReturn);

    return variables.map((variable, index) => (
      <span key={index} className="text-green-600">
        {variable}
        {index < variables.length - 1 ? ", " : ""}
      </span>
    ));
  };

  /**
   * Splits the return statement into individual variables, handling nested structures.
   * @param returnStr - The cleaned return statement string.
   * @returns An array of variable names as strings.
   */
  const splitReturnVariables = (returnStr: string): string[] => {
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

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="example">
        <AccordionTrigger>View Example Solver</AccordionTrigger>
        <AccordionContent>
          <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto">
            <code>
              {(() => {
                const lines = exampleCode.split('\n');
                let isInsideSolve = false;
                let solveIndentLevel = 0;

                return lines.map((line, index) => {
                  const trimmedLine = line.trim();

                  // Detect function definitions
                  const funcDefMatch = trimmedLine.match(/^def\s+(\w+)\s*\(([^)]*)\):/);
                  if (funcDefMatch) {
                    const funcName = funcDefMatch[1];
                    const paramsStr = funcDefMatch[2];

                    if (funcName === 'solve') {
                      isInsideSolve = true;
                      // Determine indentation level (number of leading spaces)
                      solveIndentLevel = line.search(/\S|$/);
                      return (
                        <div key={index}>
                          <span className="font-bold">def solve(</span>
                          {highlightParameters(paramsStr)}
                          <span className="font-bold">):</span>
                        </div>
                      );
                    } else {
                      // If another function is defined, we're no longer inside solve
                      isInsideSolve = false;
                      return <div key={index}>{line}</div>;
                    }
                  }

                  // Check if we have exited the solve function based on indentation
                  if (isInsideSolve) {
                    const currentIndentLevel = line.search(/\S|$/);
                    if (currentIndentLevel <= solveIndentLevel && trimmedLine !== '') {
                      isInsideSolve = false;
                    }
                  }

                  // Highlight return statement only if inside solve function
                  if (isInsideSolve && trimmedLine.startsWith('return ')) {
                    const returnMatch = trimmedLine.match(/^return\s+(.+)/);
                    const returnStr = returnMatch ? returnMatch[1] : '';
                    return (
                      <div key={index}>
                        <span className="font-bold">return </span>
                        {returnMatch ? highlightReturns(returnStr) : null}
                      </div>
                    );
                  }

                  // Render other lines normally
                  return <div key={index}>{line}</div>;
                });
              })()}
            </code>
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
