export interface Job {
  id: string;
  solver_id: string;
  dataset_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  parameters: Record<string, any>;
  results: any;
  logs: string[];
  error_message?: string;
  created_at: string;
}