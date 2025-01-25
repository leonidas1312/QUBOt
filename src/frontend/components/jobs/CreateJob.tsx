import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Info } from "lucide-react"

export const CreateJob = () => {
  const [selectedSolver, setSelectedSolver] = useState("")
  const { solvers, isLoadingSolvers } = useSolverSelection()
  const { datasets, isLoadingDatasets } = useDatasetSelection()
  const { submitJob, isSubmitting } = useJobSubmission()

  const handleSubmit = async () => {
    const selectedDataset = datasets?.find(d => d.id === selectedSolver)
    const selectedSolverObj = solvers?.find(s => s.id === selectedSolver)
    
    if (selectedDataset && selectedSolverObj) {
      await submitJob({
        solverId: selectedSolverObj.id,
        datasetId: selectedDataset.id,
        parameters: {}
      })
    }
  }

  const handleSolverSelect = (value: string) => {
    setSelectedSolver(value)
  }

  if (isLoadingSolvers || isLoadingDatasets) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Info className="h-5 w-5 text-muted-foreground" />
          Configure Optimization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="solver-select" className="text-sm font-medium text-left block">
                Select Solver and Dataset
              </label>
              <Select onValueChange={handleSolverSelect} value={selectedSolver}>
                <SelectTrigger id="solver-select" className="w-full">
                  <SelectValue placeholder="Choose a solver and compatible dataset" />
                </SelectTrigger>
                <SelectContent>
                  {solvers?.map((solver) => {
                    const dataset = datasets?.find(d => d.id === solver.id)
                    return (
                      <SelectItem key={solver.id} value={solver.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{solver.name}</span>
                          {dataset && (
                            <span className="text-sm text-muted-foreground">
                              Dataset: {dataset.name}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSolver && (
              <div className="pt-4 border-t">
                <SolverParameters 
                  solver={solvers?.find(s => s.id === selectedSolver)} 
                />
              </div>
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