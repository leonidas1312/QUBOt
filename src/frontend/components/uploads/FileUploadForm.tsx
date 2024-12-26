import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "/components/ui/label";
import { Upload } from "lucide-react";

interface FileUploadFormProps {
  title: string;
  description: string;
  acceptedFileType: string;
  fileExtension: string;
  onSubmit: (formData: FormData) => Promise<void>;
  additionalFields?: React.ReactNode;
  isProcessing?: boolean;
}

export const FileUploadForm = ({
  title,
  description,
  acceptedFileType,
  fileExtension,
  onSubmit,
  additionalFields,
  isProcessing = false,
}: FileUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(fileExtension)) {
        toast.error(`Please upload a ${fileExtension} file`);
        return;
      }
      setFile(selectedFile);
      toast.success("File uploaded successfully!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !fileDescription) {
      toast.error("Please provide both a file and description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", fileDescription);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload file.");
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Upload className="w-12 h-12 mb-4 text-gray-400" />
            <input
              type="file"
              accept={acceptedFileType}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Choose File
              </Button>
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload {fileExtension} files only
            </p>
          </div>

          <Textarea
            placeholder="Description..."
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            className="min-h-[100px]"
          />

          {additionalFields}

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Upload"}
          </Button>
        </div>
      </form>
    </Card>
  );
};