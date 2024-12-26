import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AlgorithmMetadata {
  name: string;
  description: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
}

const Solvers = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<AlgorithmMetadata>({
    name: '',
    description: '',
    inputs: [{ name: '', type: '' }],
    outputs: [{ name: '', type: '' }]
  });

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

    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload file to Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('solvers')
        .upload(`${Date.now()}-${file.name}`, file);

      if (fileError) throw fileError;

      // Store metadata in Supabase database
      const { error: dbError } = await supabase
        .from('solvers')
        .insert({
          name: metadata.name,
          description: metadata.description,
          file_path: fileData?.path,
          solver_parameters: {
            inputs: metadata.inputs,
            outputs: metadata.outputs
          }
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Solver uploaded successfully",
      });

      // Reset form
      setFile(null);
      setMetadata({
        name: '',
        description: '',
        inputs: [{ name: '', type: '' }],
        outputs: [{ name: '', type: '' }]
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to upload solver",
        variant: "destructive",
      });
    }
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
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-4">
              <Input
                placeholder="Algorithm Name"
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
              />
              
              <Textarea
                placeholder="Algorithm Description"
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              />

              <div>
                <h4 className="text-sm font-medium mb-2">Input Parameters</h4>
                {metadata.inputs.map((input, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Parameter Name"
                      value={input.name}
                      onChange={(e) => {
                        const newInputs = [...metadata.inputs];
                        newInputs[index].name = e.target.value;
                        setMetadata({ ...metadata, inputs: newInputs });
                      }}
                    />
                    <Input
                      placeholder="Parameter Type"
                      value={input.type}
                      onChange={(e) => {
                        const newInputs = [...metadata.inputs];
                        newInputs[index].type = e.target.value;
                        setMetadata({ ...metadata, inputs: newInputs });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newInputs = metadata.inputs.filter((_, i) => i !== index);
                        setMetadata({ ...metadata, inputs: newInputs });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMetadata({
                      ...metadata,
                      inputs: [...metadata.inputs, { name: '', type: '' }]
                    });
                  }}
                >
                  Add Input Parameter
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Output Parameters</h4>
                {metadata.outputs.map((output, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Output Name"
                      value={output.name}
                      onChange={(e) => {
                        const newOutputs = [...metadata.outputs];
                        newOutputs[index].name = e.target.value;
                        setMetadata({ ...metadata, outputs: newOutputs });
                      }}
                    />
                    <Input
                      placeholder="Output Type"
                      value={output.type}
                      onChange={(e) => {
                        const newOutputs = [...metadata.outputs];
                        newOutputs[index].type = e.target.value;
                        setMetadata({ ...metadata, outputs: newOutputs });
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newOutputs = metadata.outputs.filter((_, i) => i !== index);
                        setMetadata({ ...metadata, outputs: newOutputs });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMetadata({
                      ...metadata,
                      outputs: [...metadata.outputs, { name: '', type: '' }]
                    });
                  }}
                >
                  Add Output Parameter
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Upload Solver
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Solvers;