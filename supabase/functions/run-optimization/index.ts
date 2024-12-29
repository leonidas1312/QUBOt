import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

// Estimate runtime based on parameters
function estimateRuntime(parameters: any): number {
  const maxIterations = parseInt(parameters.max_iterations) || 1000;
  const baseTimePerIteration = 0.1; // seconds
  return Math.ceil(maxIterations * baseTimePerIteration);
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Quantum Optimizer <optimizer@yourdomain.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error to prevent job failure
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let jobId: string | undefined;

  try {
    // Parse the request body once at the beginning
    const body = await req.json()
    jobId = body.jobId
    
    if (!jobId) {
      throw new Error("jobId is missing from request body")
    }

    console.log(`Processing job ${jobId}`)

    // Create supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found')
    }

    // Estimate runtime
    const estimatedRuntime = estimateRuntime(job.parameters);
    
    // Update job to RUNNING with estimated runtime
    await supabase
      .from('optimization_jobs')
      .update({ 
        status: 'RUNNING',
        logs: [...(job.logs || []), 
          'Starting optimization...',
          `Estimated runtime: ${estimatedRuntime} seconds`
        ]
      })
      .eq('id', jobId)

    // Download solver and dataset
    const { data: solverData, error: solverError } = await supabase.storage
      .from('solvers')
      .download(job.solver.file_path)
    if (solverError || !solverData) {
      throw new Error(`Failed to download solver: ${solverError?.message}`)
    }
    const solverText = await solverData.text()
    const solverBase64 = btoa(solverText)

    const { data: datasetData, error: datasetError } = await supabase.storage
      .from('datasets')
      .download(job.dataset.file_path)
    if (datasetError || !datasetData) {
      throw new Error(`Failed to download dataset: ${datasetError?.message}`)
    }
    const datasetBuffer = await datasetData.arrayBuffer()
    const datasetBase64 = btoa(
      String.fromCharCode(...new Uint8Array(datasetBuffer))
    )

    // Call solver service with timeout
    const solverServiceUrl = "http://solver_service:5000"
    console.log('Calling solver service at:', solverServiceUrl)
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), estimatedRuntime * 1500); // 50% extra time as buffer

    try {
      const resp = await fetch(solverServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          solver: solverBase64,
          dataset: datasetBase64,
          parameters: job.parameters
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!resp.ok) {
        const errorText = await resp.text()
        throw new Error(`Solver service error: ${errorText}`)
      }

      const solverResult = await resp.json()

      // Send email with results
      if (job.dataset.email) {
        await sendEmail(
          job.dataset.email,
          'Optimization Job Completed',
          `
          <h1>Your optimization job has completed!</h1>
          <p>Job ID: ${jobId}</p>
          <p>Best cost found: ${solverResult.solver_output?.best_cost || 'N/A'}</p>
          <p>View full results in the application.</p>
          `
        );
      }

      // Update job with results
      await supabase
        .from('optimization_jobs')
        .update({
          status: 'COMPLETED',
          results: solverResult,
          logs: [...(job.logs || []), 'Solver completed successfully']
        })
        .eq('id', jobId)

      // Return success response with CORS headers
      return new Response(
        JSON.stringify({ message: 'Job completed successfully', result: solverResult }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Job timed out after ${estimatedRuntime} seconds`);
      }
      throw error;
    }

  } catch (error) {
    console.error('Error in optimization:', error)

    // If we have a jobId, update job status and notify user
    if (jobId) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Fetch job details for email
        const { data: job } = await supabase
          .from('optimization_jobs')
          .select('*, dataset:datasets(*)')
          .eq('id', jobId)
          .single()

        // Send failure email
        if (job?.dataset?.email) {
          await sendEmail(
            job.dataset.email,
            'Optimization Job Failed',
            `
            <h1>Your optimization job has failed</h1>
            <p>Job ID: ${jobId}</p>
            <p>Error: ${String(error)}</p>
            <p>Please check the application for more details.</p>
            `
          );
        }

        await supabase
          .from('optimization_jobs')
          .update({
            status: 'FAILED',
            error_message: String(error),
            logs: ['Error occurred during optimization:', String(error)]
          })
          .eq('id', jobId)
      } catch (updateError) {
        console.error('Error updating job status:', updateError)
      }
    }

    // Return error response with CORS headers
    return new Response(
      JSON.stringify({ error: String(error) }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})