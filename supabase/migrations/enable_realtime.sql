ALTER TABLE optimization_jobs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE optimization_jobs;