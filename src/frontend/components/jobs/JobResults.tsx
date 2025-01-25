interface JobResultsProps {
  results: any;
}

export const JobResults = ({ results }: JobResultsProps) => {
  if (!results) return null;

  return (
    <div className="space-y-2 mt-4">
      <h3 className="font-semibold">Results:</h3>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  );
};