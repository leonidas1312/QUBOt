import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const SubmissionForm = () => {
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !comment) {
      toast.error("Please fill in all fields");
      return;
    }
    // Here you would handle the submission to your backend
    toast.success("Results submitted successfully!");
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Submit Your Results</h3>
          <p className="text-sm text-muted-foreground">
            Share your findings with the community
          </p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Textarea
            placeholder="Comments about your results..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button type="submit" className="w-full">
            Submit Results
          </Button>
        </div>
      </form>
    </Card>
  );
};