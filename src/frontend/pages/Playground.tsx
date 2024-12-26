import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Playground = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Playground</CardTitle>
          <CardDescription>
            Run optimization algorithms on your datasets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Algorithm</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a solver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">No solvers available yet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Select Dataset</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placeholder">No datasets available yet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
              disabled={true}
            >
              Run Optimization
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Playground;