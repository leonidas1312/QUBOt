import { DatasetUpload } from "@/components/uploads/DatasetUpload";

const Datasets = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-700/10 via-purple-500/10 to-pink-500/10">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-500">
            Dataset Library
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload and explore optimization datasets
          </p>
        </div>
        <DatasetUpload />
      </div>
    </div>
  );
};

export default Datasets;