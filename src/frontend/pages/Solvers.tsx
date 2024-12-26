import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Solvers = () => {
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.py')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a Python (.py) file",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement file upload to Supabase
    toast({
      title: "Feature coming soon",
      description: "File upload will be implemented after Supabase integration",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Solvers</CardTitle>
          <CardDescription>
            Upload and manage your optimization algorithms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Upload className="w-12 h-12 mb-4 text-gray-400" />
            <input
              type="file"
              accept=".py"
              onChange={handleFileUpload}
              className="hidden"
              id="solver-upload"
            />
            <label htmlFor="solver-upload">
              <Button variant="outline" className="cursor-pointer">
                Upload Python Solver
              </Button>
            </label>
            <p className="mt-2 text-sm text-gray-500">Upload .py files only</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solvers;