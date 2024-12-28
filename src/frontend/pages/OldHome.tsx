import { FileUpload } from "../components/FileUpload";


const OldHome = () => {
  return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">QUBO Optimization Solver</h1>
            <p className="text-xl text-muted-foreground">
              Upload your QUBO matrix and discover optimal solutions
            </p>
          </div>

          <div className="space-y-12">
            <FileUpload />
            
          </div>
        </div>
      </div>
  );
};

export default OldHome;
