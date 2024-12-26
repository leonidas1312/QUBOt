import React, { useState } from 'react';
import { FileUpload } from '/components/FileUpload';
import { ResultsProvider } from '/contexts/ResultsContext';

const Datasets: React.FC = () => {
    return (
        <ResultsProvider>
            <div className="min-h-screen bg-background py-12 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold">Datasets Page</h1>
                        <p className="text-muted-foreground">
                            Upload your datasets and share them with the community.
                        </p>
                    </div>

                    <div className="bg-card rounded-lg border p-6 shadow-sm space-y-6">
                        <FileUpload />
                    </div>
                </div>
            </div>
        </ResultsProvider>
    );
};

export default Datasets;