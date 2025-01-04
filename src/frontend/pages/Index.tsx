import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, Video } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-br from-purple-700 via-orange-500 to-green-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl font-bold text-white tracking-tight">
          Simplifying Optimization
        </h1>
        
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Built to make you extraordinarily productive,
          <br />
          QUBOt is the best way to optimize with AI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button
            onClick={() => window.open('https://www.youtube.com/watch?v=your-demo-video', '_blank')}
            variant="outline"
            size="lg"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <Video className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>

          <Button
            onClick={() => navigate('/playground')}
            size="lg"
            className="bg-black text-white hover:bg-black/80"
          >
            <Play className="mr-2 h-4 w-4" />
            Try the Playground
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;