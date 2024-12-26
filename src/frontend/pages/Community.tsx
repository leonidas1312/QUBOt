import React, { useState } from 'react';
import { SubmissionForm } from "/components/SubmissionForm";
import { ResultsDisplay } from "/components/ResultsDisplay";
import { ResultsProvider } from "/contexts/ResultsContext";

const Community: React.FC = () => {
    const [results, setResults] = useState<any[]>([]);

    const handleFormSubmit = (newResult: any) => {
        setResults([...results, newResult]);
    };

    return (
        <ResultsProvider>
            <div className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Community Page</h1>
                    <p className="text-muted-foreground">
                    Share your algorithms, datasets, and connect with the community.
                    </p>
                </div>

                <div className="bg-card rounded-lg border p-6 shadow-sm space-y-6">
                    <SubmissionForm />
                    <ResultsDisplay />
                </div>
                </div>
            </div>
        </ResultsProvider>

    );
};

export default Community;