import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as numpy from "https://cdn.skypack.dev/@numpy/core";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendEmail(to: string, subject: string, data: any) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email notification');
    return;
  }

  const htmlContent = `
    <h1>${subject}</h1>
    <pre style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
      ${JSON.stringify(data, null, 2)}
    </pre>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'QUBOt <solver@qubot.opt>',
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let requestData;
  try {
    requestData = await req.json();
    const jobId = requestData.jobId;
    
    if (!jobId) {
      throw new Error("jobId is missing from request body");
    }

    console.log(`Processing job ${jobId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('optimization_jobs')
      .select('*, solver:solvers(*), dataset:datasets(*)')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(jobError?.message || 'Job not found');
    }

    // Update job to RUNNING
    await supabase
      .from('optimization_jobs')
      .update({ 
        status: 'RUNNING',
        logs: [...(job.logs || []), 'Starting optimization...']
      })
      .eq('id', jobId);

    // Get solver code
    const { data: solverData, error: solverError } = await supabase.storage
      .from('solvers')
      .download(job.solver.file_path);
    
    if (solverError || !solverData) {
      throw new Error(`Failed to download solver: ${solverError?.message}`);
    }

    // Get dataset
    const { data: datasetData, error: datasetError } = await supabase.storage
      .from('datasets')
      .download(job.dataset.file_path);

    if (datasetError || !datasetData) {
      throw new Error(`Failed to download dataset: ${datasetError?.message}`);
    }

    // Convert dataset to array buffer
    const arrayBuffer = await datasetData.arrayBuffer();
    const quboMatrix = new Float64Array(arrayBuffer);

    // Execute solver
    const solverText = await solverData.text();
    const solver = new Function('QUBO_matrix', 'parameters', solverText);
    
    try {
      console.log('Executing solver with parameters:', job.parameters);
      const result = await solver(quboMatrix, job.parameters);
      console.log('Solver execution completed:', result);

      // Send completion email
      if (job.dataset.email) {
        await sendEmail(
          job.dataset.email,
          'Optimization Job Completed',
          {
            jobId,
            status: 'COMPLETED',
            parameters: job.parameters,
            results: result,
            solver: {
              name: job.solver.name,
              description: job.solver.description
            },
            dataset: {
              name: job.dataset.name,
              description: job.dataset.description
            }
          }
        );
      }

      // Update job with results
      await supabase
        .from('optimization_jobs')
        .update({
          status: 'COMPLETED',
          results: result,
          logs: [...(job.logs || []), 'Solver completed successfully']
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({ message: 'Job completed successfully', result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (solverError) {
      console.error('Error executing solver:', solverError);
      throw new Error(`Failed to execute solver: ${solverError.message}`);
    }

  } catch (error) {
    console.error('Error in optimization:', error);

    try {
      const errorClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      if (!requestData?.jobId) {
        throw new Error('No job ID available for error handling');
      }

      const { data: job } = await errorClient
        .from('optimization_jobs')
        .select('*, dataset:datasets(*)')
        .eq('id', requestData.jobId)
        .single();

      if (job?.dataset?.email) {
        await sendEmail(
          job.dataset.email,
          'Optimization Job Failed',
          {
            jobId: requestData.jobId,
            status: 'FAILED',
            error: String(error),
            timestamp: new Date().toISOString()
          }
        );
      }

      await errorClient
        .from('optimization_jobs')
        .update({
          status: 'FAILED',
          error_message: String(error),
          logs: ['Error occurred during optimization:', String(error)]
        })
        .eq('id', requestData.jobId);

    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});