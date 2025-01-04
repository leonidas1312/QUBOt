import React from 'react';
import { SubmissionForm } from "/components/SubmissionForm";
import { ResultsDisplay } from "/components/ResultsDisplay";
import { ResultsProvider } from "/contexts/ResultsContext";

const Community = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-700/10 via-red-500/10 to-purple-500/10">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-700 to-red-500">
            Community Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            Share and explore optimization results with the community
          </p>
        </div>
        <ResultsProvider>
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-card rounded-lg border p-6 shadow-sm space-y-6">
              <SubmissionForm />
              <ResultsDisplay />
            </div>
          </div>
        </ResultsProvider>
      </div>
    </div>
  );
};

export default Community;