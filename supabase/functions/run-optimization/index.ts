import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateJobStatus(jobId: string, status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED', results?: any, errorMessage?: string) {
  console.log(`Updating job ${jobId} status to ${status}`);
  const { error } = await supabase
    .from('optimization_jobs')
    .update({
      status,
      results,
      error_message: errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job status:', error);
    throw new Error(`Failed to update job status: ${error.message}`);
  }
}

async function getSolverAndDataset(solverId: string, datasetId: string) {
  // Get solver details
  const { data: solver, error: solverError } = await supabase
    .from('solvers')
    .select('*')
    .eq('id', solverId)
    .single();

  if (solverError) {
    throw new Error(`Failed to fetch solver: ${solverError.message}`);
  }

  // Get dataset details
  const { data: dataset, error: datasetError } = await supabase
    .from('datasets')
    .select('*')
    .eq('id', datasetId)
    .single();

  if (datasetError) {
    throw new Error(`Failed to fetch dataset: ${datasetError.message}`);
  }

  return { solver, dataset };
}

async function callSolverService(jobData: any) {
  const solverServiceUrl = Deno.env.get('SOLVER_SERVICE_URL');
  if (!solverServiceUrl) {
    throw new Error('SOLVER_SERVICE_URL environment variable is not set');
  }
  
  console.log('Calling solver service at:', solverServiceUrl);
  
  try {
    const response = await fetch(`${solverServiceUrl}/solve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        jobId: jobData.id,
        supabaseUrl: Deno.env.get('SUPABASE_URL'),
        supabaseKey: Deno.env.get('SUPABASE_ANON_KEY'),
        solverPath: jobData.solver.file_path,
        datasetPath: jobData.dataset.file_path,
        parameters: jobData.parameters
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Solver service error response:', errorText);
      throw new Error(`Solver service responded with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Solver service successful response:', result);
    return result;
  } catch (error) {
    console.error('Error calling solver service:', error);
    throw new Error(`Failed to call solver service: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();
    console.log('Processing optimization job:', jobId);

    if (!jobId) {
      throw new Error('Job ID is required');
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to fetch job: ${jobError?.message || 'Job not found'}`);
    }

    // Update job status to RUNNING
    await updateJobStatus(jobId, 'RUNNING');

    // Call solver service
    const result = await callSolverService(job);

    // Update job with results
    await updateJobStatus(jobId, 'COMPLETED', result);

    return new Response(
      JSON.stringify({ message: 'Job processed successfully', jobId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing optimization job:', error);

    try {
      const { jobId } = await req.json();
      if (jobId) {
        await updateJobStatus(jobId, 'FAILED', null, error.message);
      }
    } catch (e) {
      console.error('Failed to update job status after error:', e);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});