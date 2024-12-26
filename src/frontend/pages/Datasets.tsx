import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Datasets = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.npy')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a NumPy (.npy) file",
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
        .from('datasets')
        .upload(`${Date.now()}-${file.name}`, file);

      if (fileError) throw fileError;

      // Store metadata in Supabase database
      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name,
          description,
          file_path: fileData?.path,
          format: 'npy'
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Dataset uploaded successfully",
      });

      // Reset form
      setFile(null);
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to upload dataset",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Datasets</CardTitle>
          <CardDescription>
            Upload and manage your QUBO matrices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <input
                type="file"
                accept=".npy"
                onChange={handleFileUpload}
                className="hidden"
                id="dataset-upload"
              />
              <label htmlFor="dataset-upload">
                <Button variant="outline" className="cursor-pointer">
                  Upload QUBO Matrix
                </Button>
              </label>
              <p className="mt-2 text-sm text-gray-500">Upload .npy files only</p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Dataset Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              <Textarea
                placeholder="Dataset Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Button type="submit" className="w-full">
                Upload Dataset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Datasets;