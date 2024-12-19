import React, { createContext, useContext, useState } from "react";

export type Result = {
  id: string;
  email: string;
  comment: string;
  description: string;
  timestamp: string;
};

type ResultsContextType = {
  results: Result[];
  addResult: (result: Omit<Result, "id" | "timestamp">) => void;
};

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

export const ResultsProvider = ({ children }: { children: React.ReactNode }) => {
  const [results, setResults] = useState<Result[]>([
    {
      id: "1",
      email: "researcher@university.edu",
      comment: "Achieved optimal solution with 98% accuracy",
      description: "TSP problem with 100 cities",
      timestamp: "2024-03-10",
    },
    {
      id: "2",
      email: "student@college.edu",
      comment: "Interesting convergence patterns observed",
      description: "Max-Cut on random graph",
      timestamp: "2024-03-09",
    },
  ]);

  const addResult = (newResult: Omit<Result, "id" | "timestamp">) => {
    const result: Result = {
      ...newResult,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString().split("T")[0],
    };
    setResults((prev) => [result, ...prev]);
  };

  return (
    <ResultsContext.Provider value={{ results, addResult }}>
      {children}
    </ResultsContext.Provider>
  );
};

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (context === undefined) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
};