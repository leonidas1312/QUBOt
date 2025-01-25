import { DatasetUpload } from "@/components/uploads/DatasetUpload";

const Datasets = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto py-8 px-4">
        <DatasetUpload />
      </div>
    </div>
  );
};

export default Datasets;