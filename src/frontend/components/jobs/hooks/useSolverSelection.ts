import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSolverSelection = () => {
  const [solvers, setSolvers] = useState([]);
  const [selectedSolver, setSelectedSolver] = useState("");

  useEffect(() => {
    fetchSolvers();
  }, []);

  const fetchSolvers = async () => {
    try {
      const { data, error } = await supabase
        .from("solvers")
        .select("id, name, description, solver_parameters, solver_outputs");
      if (error) throw error;
      setSolvers(data || []);
    } catch (error) {
      console.error("Error fetching solvers:", error);
      toast.error("Error fetching solvers");
    }
  };

  const handleSolverChange = (solverId: string) => {
    setSelectedSolver(solverId);
  };

  return { solvers, selectedSolver, handleSolverChange };
};