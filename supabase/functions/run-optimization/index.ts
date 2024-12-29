import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
        from: 'QUBOt <jonhkarystos@gmail.com>',
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

async function updateJobStatus(supabase: any, jobId: string, status: string, message: string, results?: any) {
  try {
    const updateData: any = {
      status,
      logs: [message],
    };
    
    if (results) {
      updateData.results = results;
    }
    
    if (status === 'FAILED') {
      updateData.error_message = message;
    }
    
    await supabase
      .from('optimization_jobs')
      .update(updateData)
      .eq('id', jobId);
      
    console.log(`Job ${jobId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating job status:', error);
  }
}

async function callSolverService(jobData: any) {
  const solverServiceUrl = 'http://solver_service-1:5000/solve';
  console.log('Attempting to call solver service at:', solverServiceUrl);
  
  try {
    const response = await fetch(solverServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: jobData.id,
        solverId: jobData.solver.id,
        solverPath: jobData.solver.file_path,
        datasetPath: jobData.dataset.file_path,
        parameters: jobData.parameters,
        supabaseUrl: Deno.env.get('SUPABASE_URL'),
        supabaseKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Solver service responded with status ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling solver service:', error);
    throw new Error(`Failed to call solver service: ${error.message}`);
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
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
    await updateJobStatus(supabase, jobId, 'RUNNING', 'Starting optimization...');

    try {
      const result = await callSolverService(job);
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
      await updateJobStatus(supabase, jobId, 'COMPLETED', 'Solver completed successfully', result);

      return new Response(
        JSON.stringify({ message: 'Job completed successfully', result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      throw new Error(`Failed to execute solver: ${error.message}`);
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

      await updateJobStatus(errorClient, requestData.jobId, 'FAILED', String(error));

    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }

    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
