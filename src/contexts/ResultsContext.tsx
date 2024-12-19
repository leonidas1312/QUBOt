import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Result = {
  id: string;
  email: string;
  comment: string;
  description: string;
  timestamp: string;
};

type ResultsContextType = {
  results: Result[];
  addResult: (result: Omit<Result, "id" | "timestamp">) => Promise<void>;
};

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

// Initial demo data
const initialDemoResults: Result[] = [
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
];

export const ResultsProvider = ({ children }: { children: React.ReactNode }) => {
  const [results, setResults] = useState<Result[]>(initialDemoResults);

  // Fetch results on mount
  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const { data, error } = await supabase
      .from('community_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching results:', error);
      return;
    }

    if (data) {
      setResults(data.map(result => ({
        ...result,
        timestamp: new Date(result.timestamp).toISOString().split('T')[0]
      })));
    }
  };

  const addResult = async (newResult: Omit<Result, "id" | "timestamp">) => {
    const { data, error } = await supabase
      .from('community_results')
      .insert([newResult])
      .select()
      .single();

    if (error) {
      console.error('Error adding result:', error);
      return;
    }

    if (data) {
      setResults(prev => [{
        ...data,
        timestamp: new Date(data.timestamp).toISOString().split('T')[0]
      }, ...prev]);
    }
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