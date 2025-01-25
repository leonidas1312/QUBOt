import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useJobSubmission } from "./hooks/useJobSubmission"
import { useSolverSelection } from "./hooks/useSolverSelection"
import { useDatasetSelection } from "./hooks/useDatasetSelection"
import { SolverParameters } from "./SolverParameters"

export const CreateJob = () => {
  const [selectedSolver, setSelectedSolver] = useState("")
  const { solvers, isLoadingSolvers } = useSolverSelection()
  const { datasets, isLoadingDatasets } = useDatasetSelection()
  const { handleSubmit, isSubmitting } = useJobSubmission({ 
    selectedSolver,
    selectedDataset: selectedSolver, // We're using the same ID for both since they're paired
    onJobCreated: () => {
      setSelectedSolver("")
    }
  })

  const handleSolverSelect = (value: string) => {
    setSelectedSolver(value)
  }

  if (isLoadingSolvers || isLoadingDatasets) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <Select onValueChange={handleSolverSelect} value={selectedSolver}>
              <SelectTrigger>
                <SelectValue placeholder="Select a solver and dataset" />
              </SelectTrigger>
              <SelectContent>
                {solvers?.map((solver) => (
                  <SelectItem key={solver.id} value={solver.id}>
                    {solver.name} - {datasets?.find(d => d.id === solver.id)?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedSolver && (
              <SolverParameters 
                solver={solvers?.find(s => s.id === selectedSolver)} 
              />
            )}
          </div>
          
          <Button 
            onClick={handleSubmit}
            disabled={!selectedSolver || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Running..." : "Run Optimization"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}