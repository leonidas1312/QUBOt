import { SolverUpload } from "@/components/uploads/SolverUpload";
import { Award, Database, RocketLaunch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <CardContent className="pt-6">
      <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 mx-auto">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </CardContent>
  </Card>
);

const Solvers = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700/10 via-orange-500/10 to-green-500/10">
      <div className="container mx-auto py-12 px-4 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-orange-500">
            Solver Repository
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload and manage your optimization solvers in a secure and collaborative environment
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <FeatureCard
            icon={RocketLaunch}
            title="Fast Deployment"
            description="Upload your solvers and deploy them instantly with our streamlined process"
          />
          <FeatureCard
            icon={Database}
            title="Secure Storage"
            description="Your solvers are stored securely with enterprise-grade encryption"
          />
          <FeatureCard
            icon={Award}
            title="Quality Assurance"
            description="Automated validation ensures your solvers meet all guidelines"
          />
        </div>

        {/* Upload Section */}
        <div className="animate-fade-in" style={{ animationDelay: "400ms" }}>
          <SolverUpload />
        </div>
      </div>
    </div>
  );
};

export default Solvers;